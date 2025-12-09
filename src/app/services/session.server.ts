// app/services/session.server.ts
import { createCookieSessionStorage, redirect } from "react-router";
import type { User, UserRole } from "~/features/auth/types";
import { API_URL } from "~/features/common/utils/Utils";

const USER_SESSION_KEY = "userId";

/**
 * Creates a cookie-based session storage.
 * @see https://reactrouter.com/en/dev/utils/create-cookie-session-storage
 */
export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__session",
        secrets: ["s3cret"],
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    },
});

export const { commitSession, destroySession } = sessionStorage;

/**
 * Decodes a JWT token (basic decoding, no signature verification)
 * @param {string} token - The JWT token to decode
 * @returns {Token | null} The decoded payload or null if invalid
 */
interface Token {
    ip: string;
    id: string;
    canal: string;
    rol: UserRole;
    sub: string;
    iat: number;
    exp: number;
}

const decodeJWT = (token: string): Token | null => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        // Decode the payload (base64url)
        const payload = JSON.parse(
            atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
        );
        return payload;
    } catch (error) {
        console.error('Session Server - Error decoding JWT:', error);
        return null;
    }
}

/**
 * Validates if a JWT token is still valid (not expired)
 * @param {string} token - The JWT token to validate
 * @returns {boolean} True if token is valid, false if expired or invalid
 */
function isJWTValid(token: string): boolean {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return false;

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    return decoded.exp * 1000 > Date.now();
}

/**
 * Refreshes the access token using the refresh token
 * @param {string} refreshToken - The refresh token
 * @returns {Promise<{accessToken: string, accessTokenExp: number, refreshToken: string} | null>} New tokens or null if failed
 */
async function refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    accessTokenExp: number;
    refreshToken: string;
    rol: string;
} | null> {
    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            console.error("Failed to refresh token:", response.status);
            return null;
        }

        const data = await response.json();
        return {
            accessToken: data.accessToken,
            accessTokenExp: data.accessTokenExp,
            refreshToken: data.refreshToken,
            rol: data.rol,
        };
    } catch (error) {
        console.error("Error refreshing token:", error);
        return null;
    }
}


export const forceTokenRefresh = async (request: Request): Promise<{
    success: boolean;
    headers?: HeadersInit;
}> => {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    const refreshToken = session.get("refreshToken");

    if (!refreshToken) {
        console.error("No refresh token found in session");
        return { success: false };
    }

    const newTokens = await refreshAccessToken(refreshToken);

    if (!newTokens) {
        console.error("Failed to refresh token");
        await logout(request);
        return { success: false };
    }

    // Successfully refreshed, update session
    const decoded = decodeJWT(newTokens.accessToken);
    if (!decoded) {
        console.error("Failed to decode new access token");
        return { success: false };
    }

    console.log("Token refreshed successfully (force)");
    session.set("token", newTokens.accessToken);
    session.set("refreshToken", newTokens.refreshToken);
    session.set("exp", newTokens.accessTokenExp);
    session.set("rol", newTokens.rol);
    session.set(USER_SESSION_KEY, decoded.id);

    // Commit the session and return headers
    const headers = {
        "Set-Cookie": await sessionStorage.commitSession(session),
    };

    return { success: true, headers };
}

/**
 * Retrieves the user session from the request and validates JWT expiration.
 * If JWT is expired, tries to refresh it using the refresh token.
 * Automatically commits session changes if token was refreshed.
 * @param {Request} request - The incoming request.
 * @returns {Promise<Session>} The user session.
 */
const getUserSession = async (request: Request) => {
    const cookieHeader = request.headers.get("Cookie");
    const session = await sessionStorage.getSession(cookieHeader);

    // Check if session has a token and if it's expired
    const token = session.get("token");
    const refreshToken = session.get("refreshToken");

    if (token && !isJWTValid(token)) {
        // Token expired, try to refresh
        if (refreshToken) {

            console.log("Access token expired, attempting to refresh");
            const newTokens = await refreshAccessToken(refreshToken);

            if (newTokens) {

                console.log("Token refreshed successfully");
                // Successfully refreshed, update session
                const decoded = decodeJWT(newTokens.accessToken);
                if (decoded) {
                    session.set("token", newTokens.accessToken);
                    session.set("refreshToken", newTokens.refreshToken);
                    session.set("exp", newTokens.accessTokenExp);
                    session.set("rol", newTokens.rol);
                    session.set(USER_SESSION_KEY, decoded.id);

                    console.log("Token refreshed successfully");
                    // Note: Session will be committed by the calling function
                    (session as any)._tokenRefreshed = true;
                    return session;
                }
            }
        }


        console.log("Failed to refresh token or no refresh token available");
        // Couldn't refresh, clear session data
        session.unset(USER_SESSION_KEY);
        session.unset("token");
        session.unset("refreshToken");
        session.unset("rol");
        session.unset("exp");
    }

    return session;
};

/**
 * Logs out the user by destroying their session.
 * @param {Request} request - The incoming request.
 * @returns {Promise<Response>} Redirect response after logout.
 */
export async function logout(request: Request) {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    return redirect("/login", {
        headers: {
            "Set-Cookie": await sessionStorage.destroySession(session),
            "Cache-Control": "no-store", // <-- fuerza no cachear
        },
    });
}

/**
 * Checks if the user has a valid session, redirects to login if not.
 * Automatically persists session if token was refreshed.
 * @param {Request} request - The incoming request.
 * @returns {Promise<void>} Throws redirect if session is invalid.
 */
export async function requireValidSession(request: Request): Promise<void> {
    const session = await getUserSession(request);
    const userId = session.get(USER_SESSION_KEY);
    const token = session.get("token");

    if (!userId || !token) {
        throw redirect("/login", {
            headers: {
                "Set-Cookie": await sessionStorage.destroySession(session),
                "Cache-Control": "no-store",
                "Pragma": "no-cache",
            },
        });
    }

    // If token was refreshed, we need to commit the session
    // This will be handled by the response headers in loaders/actions
    if ((session as any)._tokenRefreshed) {
        // Mark that we need to update the session cookie
        // The calling loader/action should handle this
    }
}

/**
 * Retrieves the user ID from the session.
 * @param {Request} request - The incoming request.
 * @returns {Promise<string | undefined>} The user ID if found, undefined otherwise.
 */
export async function getUserId(
    request: Request
): Promise<User["id"] | undefined> {
    const session = await getUserSession(request);
    return session.get(USER_SESSION_KEY);
}

/**
 * Retrieves the user role from the session.
 * @param {Request} request - The incoming request.
 * @returns {Promise<string | undefined>} The user role if found, undefined otherwise.
 */
export async function getUserRole(
    request: Request
): Promise<UserRole | undefined> {
    const session = await getUserSession(request);
    return session.get("rol");
}

// /**
//  * Retrieves the JWT token from the session.
//  * @param {Request} request - The incoming request.
//  * @returns {Promise<string | undefined>} The JWT token if found, undefined otherwise.
//  */
// async function getJWTToken(request: Request): Promise<string | undefined> {
//     const session = await getUserSession(request);
//     return session.get("token");
// }

/**
 * Retrieves a valid JWT token from the session (checks expiration).
 * Redirects to login if token is expired or invalid.
 * @param {Request} request - The incoming request.
 * @returns {Promise<string | null>} The JWT token if valid, null if not found.
 */
export async function getValidJWTToken(request: Request): Promise<string> {
    await requireValidSession(request); // This will redirect if session is invalid
    const session = await getUserSession(request);

    return session.get("token");
}

/**
 * Creates a new user session.
 * @param {Object} params - The parameters for creating the session.
 * @param {Request} params.request - The incoming request.
 * @param {string} params.userId - The user ID to store in the session.
 * @param {boolean} params.remember - Whether to create a persistent session.
 * @param {string} [params.redirectUrl] - The URL to redirect to after creating the session.
 * @returns {Promise<Response>} Redirect response with the new session cookie.
 */
export async function createUserSession({
    request,
    remember = true,
    redirectUrl,
    extraSessionData,
}: {
    request: Request;
    remember: boolean;
    redirectUrl?: string;
    extraSessionData: {
        rol: UserRole
        [key: string]: string | any;
    };
}) {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    const data = decodeJWT(extraSessionData.token);

    if (!data) {
        throw new Error("Invalid token data");
    }

    session.set(USER_SESSION_KEY, data.id);
    if (extraSessionData) {
        Object.entries(extraSessionData).forEach(([key, value]) => {
            session.set(key, value);
        });
    }
    return redirect(redirectUrl || "/", {
        headers: {
            "Set-Cookie": await sessionStorage.commitSession(session, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: remember ? 60 * 15 : undefined,
            }),
            "Cache-Control": "no-store",
            "Pragma": "no-cache",
        },
    });
}