import { Send } from "lucide-react"

export const EmptyChat: React.FC = () => {
    return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Send className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un chat</h3>
                <p className="text-gray-500">Elige una conversación para comenzar a chatear</p>
            </div>
        </div>
    )
}
