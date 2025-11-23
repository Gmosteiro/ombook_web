import { Phone, Video, MoreVertical } from "lucide-react"
import type { ContactoSimpleResponse } from "../types"

interface ChatHeaderProps {
    contact: ContactoSimpleResponse
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ contact }) => {
    const displayName = `${contact.nombre} ${contact.apellido}`
    return (
        <div className="bg-white border-b border-gray-200 p-4">
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
                        <h2 className="font-semibold text-gray-900">{displayName}</h2>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full" title="Llamar">
                        <Phone className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full" title="Video">
                        <Video className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full" title="Más">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>
        </div>
    )
}
