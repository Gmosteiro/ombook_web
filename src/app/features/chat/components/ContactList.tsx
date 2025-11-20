import { Search, MoreVertical } from "lucide-react"
import type { Contact } from "../types"

interface ContactListProps {
    contacts: Contact[]
    selectedContactId?: string
    searchQuery: string
    onSearchChange: (query: string) => void
    onSelectContact: (contactId: string) => void
}

const initials = (name: string) =>
    name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()

export const ContactList: React.FC<ContactListProps> = ({
    contacts,
    selectedContactId,
    searchQuery,
    onSearchChange,
    onSelectContact,
}) => {
    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
                    <button className="p-2 hover:bg-gray-100 rounded-full" title="Más">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar contactos..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {contacts.length === 0 && (
                    <div className="p-4 text-sm text-gray-500">Sin contactos</div>
                )}
                {contacts.map((contact) => (
                    <div
                        key={contact.id}
                        onClick={() => onSelectContact(contact.id)}
                        className={`contact-item p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedContactId === contact.id ? "bg-blue-50 border-r-2 border-r-blue-500" : ""
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
                                    {initials(contact.name)}
                                </div>
                                {contact.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                                    <span className="text-xs text-gray-500">{contact.timestamp}</span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                                    {contact.unreadCount ? (
                                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                            {contact.unreadCount}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
