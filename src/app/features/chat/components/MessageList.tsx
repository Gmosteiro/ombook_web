import type { MensajePrivadoResponse } from "../types"

interface MessageListProps {
    messages: MensajePrivadoResponse[]
}

const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    })
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
    return (
        <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sentByRequester ? "justify-end" : "justify-start"}`}>
                    <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sentByRequester ? "ombook-bg-green text-white" : "bg-white border border-gray-200 text-gray-900"
                            }`}
                    >
                        <p className="text-sm">{message.contenido}</p>
                        <p className={`text-xs mt-1 ${message.sentByRequester ? "text-white opacity-80" : "text-gray-500"}`}>
                            {formatTimestamp(message.fechaCreacion)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
