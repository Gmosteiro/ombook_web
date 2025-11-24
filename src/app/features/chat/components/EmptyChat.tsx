import { Send } from "lucide-react"

export const EmptyChat: React.FC = () => {
    return (
        <div className="flex-1 flex items-center justify-center ombook-bg-light">
            <div className="text-center">
                <div className="w-16 h-16 ombook-bg-gray-light rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Send className="w-8 h-8 ombook-text-gray" />
                </div>
                <h3 className="ombook-heading ombook-heading-md mb-2">Selecciona un chat</h3>
                <p className="ombook-text-gray">Elige una conversación para comenzar a chatear</p>
            </div>
        </div>
    )
}
