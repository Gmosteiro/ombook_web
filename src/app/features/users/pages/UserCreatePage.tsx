import EntityCreate from "../../common/components/EntityCreate";
import UserIndividualForm from "../components/UserForm";
import { createUser, importUsersCsv } from "../api/usersService";

export default function UserCreatePage() {
    return (
        <div className="max-w-3xl mx-auto">
            <EntityCreate
                entityName="Usuario"
                title="Alta de Usuarios"
                IndividualForm={UserIndividualForm}
                addSingle={(values) => createUser(values)}
                addMasive={(file) => importUsersCsv(file)}
                bulk={{ accept: ".csv", templateUrl: "/plantillas/usuarios.csv" }}
                labels={{ submitBulk: "Importar Usuarios" }}
            />
        </div>
    );
}