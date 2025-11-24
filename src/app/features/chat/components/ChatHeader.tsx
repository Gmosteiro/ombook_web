import type { ContactoSimpleResponse } from "../types"

interface ChatHeaderProps {
    contact: ContactoSimpleResponse
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ contact }) => {
    const displayName = `${contact.nombre} ${contact.apellido}`
    return (
        <div className="bg-white ombook-border-gray border-b p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <img
                            src={contact.fotoPerfilUrl}
                            alt={displayName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="ombook-heading ombook-heading-sm">{displayName}</h2>
                    </div>
                </div>
            </div>
        </div>
    )
}
