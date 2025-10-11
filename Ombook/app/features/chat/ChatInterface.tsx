"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Send, Phone, Video, Search, MoreVertical } from "lucide-react"
import "./chat.css"

interface Contact {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  isOnline: boolean
  unreadCount?: number
}

interface Message {
  id: string
  senderId: string // "me" o "<id>"
  content: string
  timestamp: string // "HH:mm" | "Ayer" | ISO
  isOwn: boolean
}

const API_BASE = "http://localhost:8080/api";

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

// Intenta formatear si viene ISO; si ya viene "10:30" o "Ayer", lo deja.
const prettyTs = (ts: string) => {
  if (!ts) return ""
  if (ts === "Ayer" || /^\d{2}:\d{2}$/.test(ts)) return ts
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ts
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
}

const ChatInterface: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactsLoading, setContactsLoading] = useState(false)
  const [contactsError, setContactsError] = useState<string | null>(null)

  const [selectedContact, setSelectedContact] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState<string | null>(null)

  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)

  // Cargar contactos al montar
  useEffect(() => {
    let alive = true
    const load = async () => {
      setContactsLoading(true)
      setContactsError(null)
      try {
        const res = await fetch(`${API_BASE}/contacts`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: Contact[] = await res.json()
        if (!alive) return
        // Normaliza timestamps si vienen ISO
        const normalized = data.map((c) => ({ ...c, timestamp: prettyTs(c.timestamp) }))
        setContacts(normalized)
        // Selecciona el primero si no hay uno seleccionado
        if (!selectedContact && normalized.length) {
          setSelectedContact(normalized[0].id)
        }
      } catch (e: any) {
        if (!alive) return
        setContactsError(e?.message ?? "Error cargando contactos")
      } finally {
        if (alive) setContactsLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Cargar conversación cuando cambia el contacto
  useEffect(() => {
    if (!selectedContact) return
    let alive = true
    const load = async () => {
      setMessagesLoading(true)
      setMessagesError(null)
      try {
        const res = await fetch(`${API_BASE}/messages/${selectedContact}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: Message[] = await res.json()
        if (!alive) return
        setMessages(
          data.map((m) => ({
            ...m,
            timestamp: prettyTs(m.timestamp),
          }))
        )
      } catch (e: any) {
        if (!alive) return
        setMessagesError(e?.message ?? "Error cargando mensajes")
      } finally {
        if (alive) setMessagesLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [selectedContact])

  const selectedContactData = useMemo(
    () => contacts.find((c) => c.id === selectedContact),
    [contacts, selectedContact]
  )

  const sendMessage = async () => {
    if (sending) return
    const content = newMessage.trim()
    if (!content || !selectedContact) return
    setSending(true)
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: Number(selectedContact), content }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const saved: Message = await res.json()
      setMessages((prev) => [
        ...prev,
        { ...saved, timestamp: prettyTs(saved.timestamp) }
      ])
      setNewMessage("")
      // Refresca el lastMessage/timestamp del contacto en la lista (opcional)
      setContacts((prev) =>
        prev.map((c) =>
          c.id === selectedContact
            ? { ...c, lastMessage: content, timestamp: prettyTs(saved.timestamp) }
            : c
        )
      )
    } catch (e) {
      // Podés mostrar un toast si usás alguna lib
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  return (
    <div className="chat-container flex h-screen bg-gray-50">
      {/* Sidebar de contactos */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full" title="Más">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contactos..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contactsLoading && (
            <div className="p-4 text-sm text-gray-500">Cargando contactos…</div>
          )}
          {contactsError && (
            <div className="p-4 text-sm text-red-600">Error: {contactsError}</div>
          )}
          {!contactsLoading && !contactsError && contacts.length === 0 && (
            <div className="p-4 text-sm text-gray-500">Sin contactos</div>
          )}
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact.id)}
              className={`contact-item p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedContact === contact.id ? "bg-blue-50 border-r-2 border-r-blue-500" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
                    {initials(contact.name)}
                  </div>
                  {contact.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                    <span className="text-xs text-gray-500">{contact.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">
                      {contact.lastMessage}
                    </p>
                    {contact.unreadCount ? (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {contact.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área principal del chat */}
      <div className="flex-1 flex flex-col">
        {selectedContactData ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
                      {initials(selectedContactData.name)}
                    </div>
                    {selectedContactData.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedContactData.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedContactData.isOnline ? "En línea" : "Desconectado"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full" title="Llamar">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full" title="Video">
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full" title="Más">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading && (
                <div className="text-sm text-gray-500">Cargando mensajes…</div>
              )}
              {messagesError && (
                <div className="text-sm text-red-600">Error: {messagesError}</div>
              )}
              {!messagesLoading &&
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isOwn ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-900"
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

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent caret-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="send-button bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                  title="Enviar"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un chat</h3>
              <p className="text-gray-500">Elige una conversación para comenzar a chatear</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatInterface
