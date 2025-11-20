import { useMemo, useState, useEffect } from "react"
import { useLoaderData, useFetcher, useSearchParams } from "react-router"
import type { LoaderFunctionArgs } from "react-router"
import "../styles/chat.css"
import type { Contacto, Chat } from "~/features/chat/types/index"
import { obtenerContactos, obtenerChatPorId } from "~/routes/api.chat"
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

  const contactos = await obtenerContactos(args.request, search);

  let chat: Chat | null = null;
  if (chatId) {
    try {
      chat = await obtenerChatPorId(args.request, Number(chatId));
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  }

  return { contactos, chat, selectedChatId: chatId };
};

// Intenta formatear si viene ISO; si ya viene "10:30" o "Ayer", lo deja.
const prettyTs = (ts: string) => {
  if (!ts) return ""
  if (ts === "Ayer" || /^\d{2}:\d{2}$/.test(ts)) return ts
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ts
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
}

const ChatInterface = () => {
  const { contactos, chat, selectedChatId } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const messageFetcher = useFetcher();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")

  // Transformar Contacto del backend a Contact del frontend
  const transformContacto = (contacto: Contacto): Contact => ({
    id: contacto.id.toString(),
    name: `${contacto.nombre} ${contacto.apellido}`,
    lastMessage: contacto.ultimoMensaje || "Sin mensajes",
    timestamp: contacto.timestampUltimoMensaje ? prettyTs(contacto.timestampUltimoMensaje) : "",
    isOnline: contacto.enLinea,
    unreadCount: contacto.mensajesNoLeidos,
  })

  const contacts = useMemo(() => contactos.map(transformContacto), [contactos])

  const messages: Message[] = useMemo(() => {
    if (!chat || !chat.mensajes) return []

    // Obtener el ID del usuario actual (el que NO es el contacto seleccionado)
    const currentUserId = chat.mensajes.length > 0
      ? chat.mensajes.find(m => m.remitenteId.toString() === selectedChatId)?.destinatarioId
      : null

    return chat.mensajes.map((m) => ({
      id: m.id.toString(),
      senderId: m.remitenteId.toString(),
      content: m.contenido,
      timestamp: prettyTs(m.timestamp),
      isOwn: currentUserId ? m.remitenteId === currentUserId : false,
    }))
  }, [chat, selectedChatId])

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
