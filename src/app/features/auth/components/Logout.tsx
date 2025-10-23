import { type MetaFunction, Form } from "react-router";
import { redirect } from "react-router";
import { Route } from "../../../../.react-router/types/app/features/auth/components/+types/Login";
import { logout, getValidJWTToken } from "~/services/session.server";
import { API_URL } from "../../common/utils/Utils";
import type { CerrarSesionRequest } from "../../auth/types";

/**
 * Defines metadata for the logout route.
 * 
 * @returns An array of metadata objects for the route.
 * @see https://reactrouter.com/en/dev/route/meta
 */
export const meta: MetaFunction = () => {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
};

/**
 * Action function for the logout route.
 * Handles the logout process when a POST request is made to this route.
 * First calls the backend to invalidate the session, then clears local session.
 * 
 * @param {Route.ActionArgs} params - The action arguments.
 * @returns {Promise<Response>} Redirect response after logging out.
 * @see https://reactrouter.com/en/dev/route/action
 */
export async function action({ request }: Route.ActionArgs) {
    try {
        // Get the JWT token from the session
        const token = await getValidJWTToken(request);
        if (token) {
            // Call the backend to invalidate the session
            const reqBody: CerrarSesionRequest = {
                token: token
            };

            const res = await fetch(`${API_URL}/auth/cerrar-sesion`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(reqBody)
            });

            // Even if the backend call fails, we should still clear the local session
            if (!res.ok) {
                console.warn("Failed to invalidate session on backend:", await res.text());
            }
        }
    } catch (error) {
        // If there's any error getting the token or calling the backend,
        // we should still proceed with local logout
        console.warn("Error during backend logout call:", error);
    }

    // Always clear the local session regardless of backend response
    return logout(request);
}

/**
 * Loader function for the logout route.
 * Redirects to the login page if accessed directly.
 * 
 * @param {Route.LoaderArgs} params - The loader arguments.
 * @returns {Response} Redirect response to the login page.
 * @see https://reactrouter.com/en/dev/route/loader
 */
export async function loader(
    // { request }: Route.LoaderArgs
) {
    return redirect("/login");
}

/**
 * Logout component with form.
 * Can be used as a standalone component or imported into other components.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} [props.buttonText] - Custom text for the logout button
 * @returns {JSX.Element} The logout form component
 */
export default function Logout({
    className = "",
    buttonText = "Logout"
}: {
    className?: string;
    buttonText?: string;
}) {
    return (
        <Form method="post" action="/logout" className={className}>
            <button
                type="submit"
                className="border rounded px-2.5 py-1"
            >
                {buttonText}
            </button>
        </Form>
    );
}