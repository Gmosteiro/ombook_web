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
        <div className="w-80 bg-white ombook-border-gray border-r flex flex-col">
            <div className="p-4 ombook-border-gray border-b">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="ombook-heading ombook-heading-md ombook-text-green">Chats</h1>
                    <button
                        onClick={onNewChat}
                        className="p-2 hover:bg-green-50 rounded-full transition-colors"
                        title="Nuevo chat"
                    >
                        <MessageSquarePlus className="w-5 h-5 ombook-text-gray" />
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ombook-text-gray" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar chats..."
                        className="ombook-input pl-10"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {chats.length === 0 && (
                    <div className="p-4 text-sm ombook-text-gray">Sin chats</div>
                )}
                {chats.map((chat) => (
                    <div
                        key={chat.partnerId}
                        onClick={() => {
                            if (chat.partnerId)
                                onSelectContact(chat.partnerId.toString())
                        }}
                        className={`contact-item p-4 ombook-border-gray border-b cursor-pointer transition-colors ${selectedContactId === chat.partnerId?.toString() ? "bg-green-50 border-r-2 ombook-border-green" : "hover:bg-green-50"}`}
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
                                    <h3 className="font-medium ombook-text-gray truncate">
                                        {chat.partnerNombre} {chat.partnerApellido}
                                    </h3>
                                    <span className="text-xs ombook-text-gray">{chat.fechaUltimoMensaje ? new Date(chat.fechaUltimoMensaje).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}</span>
                                </div>
                                <p className="text-sm ombook-text-gray truncate">{chat.ultimoMensaje}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
