import { useMemo, useState, useEffect } from "react"
import { useLoaderData, useFetcher, useSearchParams } from "react-router"
import type { LoaderFunctionArgs } from "react-router"
import "../styles/chat.css"
import type { ChatSummaryResponse, MensajePrivadoResponse } from "~/features/chat/types/index"
import { obtenerChats, obtenerMensajesCon } from "~/routes/api.chat"
import { requireRoleLoader } from "~/features/auth/components/requireRoleLoader"
import { UserRole } from "~/features/auth/types"
import type { Contact, Message } from "../types"
import { ContactList } from "../components/ContactList"
import { ChatHeader } from "../components/ChatHeader"
import { MessageList } from "../components/MessageList"
import { MessageInput } from "../components/MessageInput"
import { EmptyChat } from "../components/EmptyChat"

export const loader = async (args: LoaderFunctionArgs) => {
  await requireRoleLoader([UserRole.PROFESOR, UserRole.ESTUDIANTE])(args);

  const url = new URL(args.request.url);
  const search = url.searchParams.get("search") || undefined;
  const chatId = url.searchParams.get("chatId") || undefined;

  // Obtener resumen de chats con búsqueda
  const chats = await obtenerChats(args.request, search);

  // Obtener mensajes si hay un chat seleccionado
  let mensajes: MensajePrivadoResponse[] = [];
  if (chatId) {
    try {
      mensajes = await obtenerMensajesCon(args.request, Number(chatId));
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }

  return { chats, mensajes, selectedChatId: chatId };
};

// Formatea timestamps ISO a formato HH:MM
const prettyTs = (ts?: string | null) => {
  if (!ts) return ""
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ts
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
}

const ChatInterface = () => {
  const { chats, mensajes, selectedChatId } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const messageFetcher = useFetcher();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")

  // Transformar ChatSummaryResponse a Contact del frontend
  const transformChat = (chat: ChatSummaryResponse): Contact => ({
    id: chat.partnerId?.toString() || "",
    name: `${chat.partnerNombre || ""} ${chat.partnerApellido || ""}`.trim(),
    lastMessage: chat.ultimoMensaje || "Sin mensajes",
    timestamp: prettyTs(chat.fechaUltimoMensaje),
    isOnline: false, // El backend no provee esta info
    unreadCount: chat.unreadCount,
  })

  const contacts = useMemo(() => chats.map(transformChat), [chats])

  // Transformar mensajes del backend a formato UI
  const messages: Message[] = useMemo(() => {
    return mensajes.map((m) => ({
      id: m.id?.toString() || "",
      senderId: m.senderId?.toString() || "",
      content: m.contenido || "",
      timestamp: prettyTs(m.fechaCreacion),
      isOwn: m.sentByRequester || false,
    }))
  }, [mensajes])

  // Actualizar búsqueda en URL con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== searchParams.get("search")) {
        const params = new URLSearchParams(searchParams)
        if (searchQuery) {
          params.set("search", searchQuery)
        } else {
          params.delete("search")
        }
        setSearchParams(params, { replace: true })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchParams, setSearchParams])

  const selectedContactData = useMemo(
    () => contacts.find((c) => c.id === selectedChatId),
    [contacts, selectedChatId]
  )

  const selectContact = (contactId: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("chatId", contactId)
    if (searchQuery) {
      params.set("search", searchQuery)
    }
    setSearchParams(params)
  }

  const sendMessage = (content: string) => {
    if (!selectedChatId) return

    messageFetcher.submit(
      { destinatarioId: Number(selectedChatId), contenido: content },
      { method: "POST", action: "/api/chat/mensajes", encType: "application/json" }
    )
  }

  const isSending = messageFetcher.state === "submitting"

  return (
    <div className="chat-container flex h-screen bg-gray-50">
      <ContactList
        contacts={contacts}
        selectedContactId={selectedChatId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectContact={selectContact}
      />

      <div className="flex-1 flex flex-col">
        {selectedContactData ? (
          <>
            <ChatHeader contact={selectedContactData} />
            <MessageList messages={messages} />
            <MessageInput onSendMessage={sendMessage} isSending={isSending} />
          </>
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  )
}

export default ChatInterface
