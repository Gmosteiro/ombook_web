import React from "react";
import SearchList, { type CommonSearchListProps } from "../../common/components/SearchList";

type User = { id: string; name: string };

type Props = {
    selected: User | null;
    onSelect: (u: User | null) => void;
    busy: boolean;
    className?: string;
};

const UsersSearchList: React.FC<Props> = ({ selected, onSelect, busy, className }) => {
    const fetchUsers: CommonSearchListProps<User>["fetch"] = async (q) => {
        // TODO: reemplazar por tu client/API
        // ej: return api.users.search({ q });
        const all = [
            { id: "1", name: "Alice" },
            { id: "2", name: "Bob" },
            { id: "3", name: "Carlos" },
        ];
        const qq = q.toLowerCase();
        return all.filter(u => u.name.toLowerCase().includes(qq));
    };

    return (
        <SearchList<User>
            mode="select"
            fetch={fetchUsers}
            getKey={(u) => u.id}
            getLabel={(u) => u.name}
            selected={selected}
            onSelect={onSelect}
            busy={busy}
            className={className}
            placeholder="Buscar usuario..."
            emptyText="Sin usuarios"
        />
    );
};

export default UsersSearchList;