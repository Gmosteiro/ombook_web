import { Search, MessageSquarePlus } from "lucide-react"
import type { ChatSummaryResponse } from "../types"

interface ContactListProps {
    chats: ChatSummaryResponse[]
    selectedContactId?: string
    searchQuery: string
    onSearchChange: (query: string) => void
    onSelectContact: (contactId: string) => void
    onNewChat: () => void
}

export const ContactList: React.FC<ContactListProps> = ({
    chats,
    selectedContactId,
    searchQuery,
    onSearchChange,
    onSelectContact,
    onNewChat,
}) => {
    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
                    <button
                        onClick={onNewChat}
                        className="p-2 hover:bg-gray-100 rounded-full"
                        title="Nuevo chat"
                    >
                        <MessageSquarePlus className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar chats..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {chats.length === 0 && (
                    <div className="p-4 text-sm text-gray-500">Sin chats</div>
                )}
                {chats.map((chat) => (
                    <div
                        key={chat.partnerId}
                        onClick={() => {
                            if (chat.partnerId)
                                onSelectContact(chat.partnerId.toString())
                        }}
                        className={`contact-item p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedContactId === chat.partnerId?.toString() ? "bg-blue-50 border-r-2 border-r-blue-500" : ""
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <img
                                    src={chat.partnerFoto}
                                    alt={`${chat.partnerNombre} ${chat.partnerApellido}`}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-gray-900 truncate">
                                        {chat.partnerNombre} {chat.partnerApellido}
                                    </h3>
                                    <span className="text-xs text-gray-500">{chat.fechaUltimoMensaje ? new Date(chat.fechaUltimoMensaje).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{chat.ultimoMensaje}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
