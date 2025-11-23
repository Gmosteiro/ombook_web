import { useState, useEffect } from "react"
import { useLoaderData, useFetcher, useSearchParams, useRevalidator } from "react-router"
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router"
import "../styles/chat.css"
import type { MensajePrivadoResponse } from "~/features/chat/types/index"
import { obtenerContactos, obtenerMensajesCon, enviarMensaje } from "~/routes/api.chat"
import { requireRoleLoader } from "~/features/auth/components/requireRoleLoader"
import { UserRole } from "~/features/auth/types"
import { ContactList } from "../components/ContactList"
import { ChatHeader } from "../components/ChatHeader"
import { MessageList } from "../components/MessageList"
import { MessageInput } from "../components/MessageInput"
import { EmptyChat } from "../components/EmptyChat"

export function meta() {
  return [{ title: 'Ombook | Chat' }];
}

export const loader = async (args: LoaderFunctionArgs) => {
  await requireRoleLoader([UserRole.PROFESOR, UserRole.ESTUDIANTE])(args);

  const url = new URL(args.request.url);
  const search = url.searchParams.get("search") || undefined;
  const chatId = url.searchParams.get("chatId") || undefined;

  const contactos = await obtenerContactos(args.request, search);

  let mensajes: MensajePrivadoResponse[] = [];
  if (chatId) {
    try {
      mensajes = await obtenerMensajesCon(args.request, Number(chatId));
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }

  return { contactos, mensajes, selectedChatId: chatId };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    console.log("Received request to send message", body);
    const { destinatarioId, contenido } = body;

    if (!destinatarioId || !contenido) {
      return new Response(
        JSON.stringify({ error: "destinatarioId y contenido son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const mensaje = await enviarMensaje(request, Number(destinatarioId), contenido);

    console.log("Mensaje enviado:", mensaje);

    return new Response(JSON.stringify(mensaje), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return new Response(
      JSON.stringify({ error: "Error al enviar mensaje" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const ChatInterface = () => {
  const { contactos, mensajes, selectedChatId } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const messageFetcher = useFetcher();
  const revalidator = useRevalidator();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")

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

  // Recargar datos después de enviar un mensaje
  useEffect(() => {
    if (messageFetcher.state === "idle" && messageFetcher.data) {
      revalidator.revalidate();
    }
  }, [messageFetcher.state, messageFetcher.data, revalidator])

  const selectedContactData = contactos.find((c) => c.id?.toString() === selectedChatId)

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
      { method: "POST", encType: "application/json" }
    )
  }

  const isSending = messageFetcher.state === "submitting"

  return (
    <div className="chat-container flex bg-gray-50">
      <ContactList
        contacts={contactos}
        selectedContactId={selectedChatId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectContact={selectContact}
      />

      <div className="flex-1 flex flex-col min-h-0">
        {selectedContactData ? (
          <>
            <ChatHeader contact={selectedContactData} />
            <MessageList messages={mensajes} />
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
