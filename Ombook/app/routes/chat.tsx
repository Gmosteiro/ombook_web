import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatInterface from "../features/chat/ChatInterface";

export default function ChatPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
        }
    }, []);

    return <ChatInterface />;
}
