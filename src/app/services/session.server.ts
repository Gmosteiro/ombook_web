// app/services/session.server.ts
import { createCookieSessionStorage, redirect } from "react-router";
import type { User, UserRole } from "~/features/auth/types";
import { API_URL } from "~/features/common/utils/Utils";

const USER_SESSION_KEY = "userId";

// =====================================================
// SESSION STORAGE
// =====================================================
export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__session",
        secrets: ["s3cret"],
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15, // 15 minutes
    },
});

export const { commitSession, destroySession } = sessionStorage;

// =====================================================
// JWT HELPERS
// =====================================================
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
        console.log("[SESSION DEBUG] Decoding JWT...");

        const parts = token.split('.');
        if (parts.length !== 3) {
            console.log("[SESSION DEBUG] Invalid JWT format");
            return null;
        }

        const payload = JSON.parse(
            atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
        );

        console.log("[SESSION DEBUG] JWT decoded:", payload);
        return payload;
    } catch (error) {
        console.error("[SESSION DEBUG] Error decoding JWT:", error);
        return null;
    }
};

function isJWTValid(token: string): boolean {
    console.log("[SESSION DEBUG] Checking if JWT is valid...");
    const decoded = decodeJWT(token);
    if (!decoded) {
        console.log("[SESSION DEBUG] JWT invalid");
        return false;
    }

    const now = Date.now();
    const expMs = decoded.exp * 1000;

    console.log("[SESSION DEBUG] Now:", now, "Exp:", expMs);

    const valid = expMs > now;
    console.log("[SESSION DEBUG] Token valid?", valid);

    return valid;
}

// =====================================================
// REFRESH TOKEN
// =====================================================
async function refreshAccessToken(refreshToken: string) {
    console.log("[SESSION DEBUG] Calling /auth/refresh...");

    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        console.log("[SESSION DEBUG] Refresh response status:", response.status);

        if (!response.ok) {
            console.error("[SESSION DEBUG] FAILED refresh.");
            return null;
        }

        const data = await response.json();
        console.log("[SESSION DEBUG] Refresh success:", data);

        return data;
    } catch (err) {
        console.error("[SESSION DEBUG] Error refreshing token:", err);
        return null;
    }
}

// =====================================================
// FORCE REFRESH
// =====================================================
export const forceTokenRefresh = async (request: Request) => {
    console.log("[SESSION DEBUG] forceTokenRefresh called");

    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    const refreshToken = session.get("refreshToken");

    console.log("[SESSION DEBUG] Refresh token:", refreshToken);

    if (!refreshToken) {
        console.log("[SESSION DEBUG] No refresh token found");
        return { success: false };
    }

    const newTokens = await refreshAccessToken(refreshToken);

    if (!newTokens) {
        console.log("[SESSION DEBUG] Failed refreshing inside forceTokenRefresh");
        await logout(request);
        return { success: false };
    }

    console.log("[SESSION DEBUG] Refresh OK, updating session...");

    const decoded = decodeJWT(newTokens.accessToken);

    session.set("token", newTokens.accessToken);
    session.set("refreshToken", newTokens.refreshToken);
    session.set("exp", newTokens.accessTokenExp);
    session.set("rol", newTokens.rol);
    session.set(USER_SESSION_KEY, decoded?.id);

    return {
        success: true,
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    };
};

// =====================================================
// GET USER SESSION
// =====================================================
const getUserSession = async (request: Request) => {
    console.log("[SESSION DEBUG] getUserSession called");

    const cookieHeader = request.headers.get("Cookie");
    console.log("[SESSION DEBUG] Incoming Cookie:", cookieHeader);

    const session = await sessionStorage.getSession(cookieHeader);

    const token = session.get("token");
    const refreshToken = session.get("refreshToken");

    console.log("[SESSION DEBUG] Found token:", token);
    console.log("[SESSION DEBUG] Found refresh token:", refreshToken);

    if (token && !isJWTValid(token)) {
        console.log("[SESSION DEBUG] Token EXPIRED");

        if (refreshToken) {
            console.log("[SESSION DEBUG] Attempting token refresh...");

            const newTokens = await refreshAccessToken(refreshToken);

            if (newTokens) {
                console.log("[SESSION DEBUG] Refresh successful inside getUserSession");

                const decoded = decodeJWT(newTokens.accessToken);

                session.set("token", newTokens.accessToken);
                session.set("refreshToken", newTokens.refreshToken);
                session.set("exp", newTokens.accessTokenExp);
                session.set("rol", newTokens.rol);
                session.set(USER_SESSION_KEY, decoded?.id);

                (session as any)._tokenRefreshed = true;

                return session;
            }

            console.log("[SESSION DEBUG] Refresh FAILED inside getUserSession");
        }

        console.log("[SESSION DEBUG] No refresh token OR refresh failed. Clearing session");
        session.unset("token");
        session.unset("refreshToken");
        session.unset("rol");
        session.unset(USER_SESSION_KEY);
    }

    return session;
};

// =====================================================
// LOGOUT
// =====================================================
export async function logout(request: Request) {
    console.log("[SESSION DEBUG] LOGOUT triggered");

    const session = await sessionStorage.getSession(request.headers.get("Cookie"));

    return redirect("/login", {
        headers: {
            "Set-Cookie": await destroySession(session),
            "Cache-Control": "no-store",
        },
    });
}

// =====================================================
// REQUIRE VALID SESSION
// =====================================================
export async function requireValidSession(request: Request) {
    console.log("[SESSION DEBUG] requireValidSession called");

    const session = await getUserSession(request);

    const userId = session.get(USER_SESSION_KEY);
    const token = session.get("token");

    console.log("[SESSION DEBUG] UserId:", userId);
    console.log("[SESSION DEBUG] Token:", token);

    if (!userId || !token) {
        console.log("[SESSION DEBUG] Invalid session → redirecting to login");

        throw redirect("/login", {
            headers: {
                "Set-Cookie": await destroySession(session),
                "Cache-Control": "no-store",
            },
        });
    }
}

// =====================================================
// GETTERS
// =====================================================
export async function getUserId(request: Request) {
    console.log("[SESSION DEBUG] getUserId called");
    const session = await getUserSession(request);
    console.log("[SESSION DEBUG] Returning userId:", session.get(USER_SESSION_KEY));
    return session.get(USER_SESSION_KEY);
}

export async function getUserRole(request: Request) {
    console.log("[SESSION DEBUG] getUserRole called");
    const session = await getUserSession(request);
    console.log("[SESSION DEBUG] Returning role:", session.get("rol"));
    return session.get("rol");
}

export async function getValidJWTToken(request: Request) {
    console.log("[SESSION DEBUG] getValidJWTToken called", Date.now());
    await requireValidSession(request);
    const session = await getUserSession(request);
    console.log("[SESSION DEBUG] Returning token:", session.get("token"));
    return session.get("token");
}

// =====================================================
// CREATE SESSION
// =====================================================
export async function createUserSession({ request, remember, redirectUrl, extraSessionData }) {
    console.log("[SESSION DEBUG] createUserSession called");

    const session = await sessionStorage.getSession(request.headers.get("Cookie"));

    const data = decodeJWT(extraSessionData.token);
    console.log("[SESSION DEBUG] Decoded login token:", data);

    session.set(USER_SESSION_KEY, data.id);

    Object.entries(extraSessionData).forEach(([k, v]) => {
        session.set(k, v);
        console.log(`[SESSION DEBUG] Set session key ${k} =`, v);
    });

    return redirect(redirectUrl || "/", {
        headers: {
            "Set-Cookie": await commitSession(session),
            "Cache-Control": "no-store",
        },
    });
}