import React from "react";
import EntityDelete from "../../common/components/EntityDelete";
import UsersSearchList from "../components/UsersSearchList";
import { deleteUser, deleteUsersBulk } from "../api/usersService";

import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { UserRole } from "../../auth/types";

export const loader = requireRoleLoader([UserRole.ADMINISTRADOR]);

const UsersDeletePage: React.FC = () => {
    return (
        <EntityDelete
            entityName="Usuario"
            SearchList={UsersSearchList}
            deleteSingle={deleteUser}
            deleteMasive={deleteUsersBulk}
            bulk={{
                accept: ".csv",
                maxSizeMB: 10,
                templateUrl: "/plantillas/borrado-usuarios.csv" //TODO: subir plantilla
            }}

        />
    );
};

export default UsersDeletePage;