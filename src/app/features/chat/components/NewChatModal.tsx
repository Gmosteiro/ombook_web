import { X, Search } from "lucide-react"
import type { ContactoSimpleResponse } from "../types"

interface NewChatModalProps {
    isOpen: boolean
    onClose: () => void
    contacts: ContactoSimpleResponse[]
    onSelectContact: (contactId: string) => void
    searchQuery: string
    onSearchChange: (query: string) => void
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
    isOpen,
    onClose,
    contacts,
    onSelectContact,
    searchQuery,
    onSearchChange,
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Nuevo chat</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        title="Cerrar"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Buscar contactos..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {contacts.length === 0 && (
                        <div className="p-4 text-sm text-gray-500 text-center">
                            No se encontraron contactos
                        </div>
                    )}
                    {contacts.map((contact) => (
                        <div
                            key={contact.id}
                            onClick={() => {
                                if (contact.id) {
                                    onSelectContact(contact.id.toString())
                                    onClose()
                                }
                            }}
                            className="flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                        >
                            <img
                                src={contact.fotoPerfilUrl}
                                alt={`${contact.nombre} ${contact.apellido}`}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">
                                    {contact.nombre} {contact.apellido}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
