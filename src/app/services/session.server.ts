// app/services/session.server.ts
import { createCookieSessionStorage, redirect } from "react-router";
import type { User, UserRole } from "~/features/auth/types";

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
 * @returns {any | null} The decoded payload or null if invalid
 */
function decodeJWT(token: string): any | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        // Decode the payload (base64url)
        const payload = JSON.parse(
            atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
        );
        return payload;
    } catch (error) {
        console.error('Error decoding JWT:', error);
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
 * Retrieves the user session from the request and validates JWT expiration.
 * If JWT is expired, destroys the session.
 * @param {Request} request - The incoming request.
 * @returns {Promise<Session>} The user session.
 */
const getUserSession = async (request: Request) => {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));

    // Check if session has a token and if it's expired
    const token = session.get("token");
    if (token && !isJWTValid(token)) {
        // Clear session data but don't redirect here, let the calling function handle it
        session.unset(USER_SESSION_KEY);
        session.unset("token");
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
        },
    });
}

/**
 * Checks if the user has a valid session, redirects to login if not.
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
            },
        });
    }
}

/**
 * Retrieves the user ID from the session.
 * @param {Request} request - The incoming request.
 * @returns {Promise<string | undefined>} The user ID if found, undefined otherwise.
 */
export async function getUserId(
    request: Request
): Promise<User["email"] | undefined> {
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
    userId,
    remember = true,
    redirectUrl,
    extraSessionData,
}: {
    request: Request;
    userId: string;
    remember: boolean;
    redirectUrl?: string;
    extraSessionData: {
        rol: UserRole
        [key: string]: string | any;
    };
}) {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    session.set(USER_SESSION_KEY, userId);
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
                maxAge: remember
                    ? 60 * 60 * 24 * 7 // 7 days
                    : undefined,
            }),
        },
    });
}