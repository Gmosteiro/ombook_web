import type { Message } from "../types"

interface MessageListProps {
    messages: Message[]
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
    return (
        <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isOwn ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-900"
                            }`}
                    >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.isOwn ? "text-blue-100" : "text-gray-500"}`}>
                            {message.timestamp}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
