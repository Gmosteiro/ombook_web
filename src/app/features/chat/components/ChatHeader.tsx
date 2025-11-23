import { Phone, Video, MoreVertical } from "lucide-react"
import type { Contact } from "../types"

interface ChatHeaderProps {
    contact: Contact
}

const initials = (name: string) =>
    name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()

export const ChatHeader: React.FC<ChatHeaderProps> = ({ contact }) => {
    return (
        <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
                            {initials(contact.name)}
                        </div>
                        {contact.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">{contact.name}</h2>
                        <p className="text-sm text-gray-500">
                            {contact.isOnline ? "En línea" : "Desconectado"}
                        </p>
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
