import type React from "react"
import { useState } from "react"
import { Send } from "lucide-react"

interface MessageInputProps {
    onSendMessage: (content: string) => void
    isSending: boolean
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isSending }) => {
    const [message, setMessage] = useState("")

    const handleSend = () => {
        const content = message.trim()
        if (!content) return
        onSendMessage(content)
        setMessage("")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="bg-white ombook-border-gray border-t p-4">
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-2 ombook-input caret-ombook-green"
                />
                <button
                    onClick={handleSend}
                    disabled={isSending || !message.trim()}
                    className="send-button ombook-btn-primary disabled:opacity-60 disabled:cursor-not-allowed p-2 rounded-lg transition-colors"
                    title="Enviar"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
