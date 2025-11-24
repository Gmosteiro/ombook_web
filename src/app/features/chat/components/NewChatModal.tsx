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
                <div className="flex items-center justify-between p-4 ombook-border-gray border-b">
                    <h2 className="ombook-heading ombook-heading-md ombook-text-green">Nuevo chat</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        title="Cerrar"
                    >
                        <X className="w-5 h-5 ombook-text-gray" />
                    </button>
                </div>

                <div className="p-4 ombook-border-gray border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ombook-text-gray" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Buscar contactos..."
                            className="ombook-input pl-10"
                            style={{ paddingLeft: "35px" }}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {contacts.length === 0 && (
                        <div className="p-4 text-sm ombook-text-gray text-center">
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
                            className="flex items-center space-x-3 p-4 hover:bg-green-50 cursor-pointer ombook-border-gray border-b transition-colors"
                        >
                            <img
                                src={contact.fotoPerfilUrl}
                                alt={`${contact.nombre} ${contact.apellido}`}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium ombook-text-gray truncate">
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
