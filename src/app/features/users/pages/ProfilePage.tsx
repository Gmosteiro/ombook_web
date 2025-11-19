import { useLoaderData, useFetcher, useRevalidator, Link } from "react-router";
import { getPerfil, actualizarPerfil, actualizarAvatar, UsuarioBasicoResponse } from "../../../routes/api.profile";
import { useEffect, useState } from "react";
import { formatFecha } from "../utils/Utils";
import { requireRoleLoader } from "~/features/auth/components/requireRoleLoader";
import { UserRole } from "~/features/auth/types";

// Loader para obtener el perfil
export const loader = async ({ request }: { request: Request }) => {
    await requireRoleLoader([UserRole.ADMINISTRADOR, UserRole.PROFESOR, UserRole.ESTUDIANTE])({ request } as any);

    const perfil = await getPerfil(request);
    return { perfil };
};


export function meta() {
    return [
        { title: `Ombook | Perfil` }
    ];
}

// Action para actualizar perfil y avatar
export const action = async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const intent = formData.get("intent");

    try {
        if (intent === "updateProfile") {
            const perfilActualizado = await actualizarPerfil(request, {
                nombre: formData.get("nombre") as string,
                apellido: formData.get("apellido") as string,
                fechaNacimiento: formData.get("fechaNacimiento") as string,
            });
            return { success: "Perfil actualizado", perfil: perfilActualizado };
        }

        if (intent === "updateAvatar") {
            const archivo = formData.get("archivo") as File;
            if (
                !archivo ||
                !["image/png", "image/jpeg"].includes(archivo.type) ||
                archivo.size > 5 * 1024 * 1024
            ) {
                return { error: "Solo se permiten imágenes PNG o JPG de hasta 5MB." };
            }
            const perfilActualizado = await actualizarAvatar(request, archivo);
            return { success: "Perfil actualizado", perfil: perfilActualizado };
        }

        return { error: "Acción no reconocida" };
    } catch (e: any) {
        return { error: e.message || "Error al actualizar perfil" };
    }
};

export default function ProfilePage() {
    const initialPerfil = (useLoaderData() as { perfil: UsuarioBasicoResponse }).perfil;
    const fetcher = useFetcher<any>();
    const revalidator = useRevalidator();
    const [edit, setEdit] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [perfil, setPerfil] = useState<UsuarioBasicoResponse>(initialPerfil);
    const [avatarVersion, setAvatarVersion] = useState(Date.now());

    useEffect(() => {
        if (fetcher.data?.success && fetcher.data.perfil) {
            setPerfil(fetcher.data.perfil);
            setAvatarVersion(Date.now());
            setEdit(false);
            revalidator.revalidate();
        }
    }, [fetcher.data]);

    const isUpdating = fetcher.state === "submitting" || fetcher.state === "loading";

    if (isUpdating) {
        return (
            <div className="max-w-xl mx-auto mt-12 bg-white rounded-2xl shadow p-8 flex items-center justify-center min-h-[300px]">
                <svg className="animate-spin h-6 w-6 text-blue-600 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-blue-600 font-medium text-lg">Actualizando...</span>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto mt-12 bg-white rounded-2xl shadow p-8">
            <div className="flex justify-between items-baseline mb-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Mi Perfil</h1>
                {fetcher.data?.error && (
                    <div className="text-red-600 mt-4">{fetcher.data.error}</div>
                )}
                {!edit && (
                    <button
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                        onClick={() => setEdit(true)}
                    >
                        Editar
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                <img
                    src={
                        perfil.fotoPerfil
                            ? `${perfil.fotoPerfil}?v=${avatarVersion}`
                            : "/default-avatar.png"
                    }
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow"
                />
                {edit && (
                    <div className="flex flex-col gap-2 w-full">
                        <fetcher.Form
                            method="post"
                            encType="multipart/form-data"
                            className="flex flex-col sm:flex-row gap-2 items-center"
                            onSubmit={e => {
                                if (
                                    avatarFile &&
                                    (!["image/png", "image/jpeg"].includes(avatarFile.type) ||
                                        avatarFile.size > 5 * 1024 * 1024)
                                ) {
                                    e.preventDefault();
                                    setAvatarError(
                                        "Solo se permiten imágenes PNG o JPG de hasta 5MB."
                                    );
                                } else {
                                    setAvatarError(null);
                                }
                            }}
                        >
                            <input type="hidden" name="intent" value="updateAvatar" />
                            <input
                                type="file"
                                name="archivo"
                                accept="image/png, image/jpeg"
                                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                onChange={e => {
                                    const file = e.target.files?.[0] ?? null;
                                    setAvatarFile(file);
                                    if (
                                        file &&
                                        (!["image/png", "image/jpeg"].includes(file.type) ||
                                            file.size > 5 * 1024 * 1024)
                                    ) {
                                        setAvatarError(
                                            "Solo se permiten imágenes PNG o JPG de hasta 5MB."
                                        );
                                    } else {
                                        setAvatarError(null);
                                    }
                                }}
                            />
                            {avatarFile && !avatarError && (
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                                >
                                    Actualizar Avatar
                                </button>
                            )}
                        </fetcher.Form>
                        {avatarError && (
                            <div className="text-red-600 text-sm mt-1">{avatarError}</div>
                        )}
                    </div>
                )}
            </div>
            {edit ? (
                <fetcher.Form
                    method="post"
                    className="space-y-5"
                    onSubmit={() => setEdit(false)}
                >
                    <input type="hidden" name="intent" value="updateProfile" />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            name="nombre"
                            defaultValue={perfil.nombre}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                        <input
                            name="apellido"
                            defaultValue={perfil.apellido}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                        <input
                            name="fechaNacimiento"
                            type="date"
                            defaultValue={formatFecha(perfil.fechaNacimiento)}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                            disabled={isUpdating}
                        >
                            Guardar
                        </button>
                        <button
                            type="button"
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition"
                            onClick={() => setEdit(false)}
                            disabled={isUpdating}
                        >
                            Cancelar
                        </button>
                        <Link
                            to="/profile/change-password"
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition inline-flex items-center justify-center"
                        >
                            Cambiar Contraseña
                        </Link>
                    </div>
                </fetcher.Form>
            ) : (
                <div className="space-y-2">
                    <div>
                        <span className="font-semibold text-gray-800">Nombre:</span> {perfil.nombre}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-800">Apellido:</span> {perfil.apellido}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-800">Correo:</span> {perfil.correo}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-800">Fecha de nacimiento:</span> {formatFecha(perfil.fechaNacimiento)}
                    </div>
                </div>
            )}
        </div>
    );
}