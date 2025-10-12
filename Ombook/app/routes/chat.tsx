import ChatInterface from "../features/chat/ChatInterface";
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';

export default function ChatPage() {
    return (
        <ProtectedRoute>
            <ChatInterface />
        </ProtectedRoute>
    );
}
