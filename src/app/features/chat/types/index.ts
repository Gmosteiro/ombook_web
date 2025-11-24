import type { components } from "../../../../types/openapi";

// Tipos del OpenAPI backend
export type ContactoSimpleResponse = components["schemas"]["ContactoSimpleResponse"];
export type ChatSummaryResponse = components["schemas"]["ChatSummaryResponse"];
export type MensajePrivadoResponse = components["schemas"]["MensajePrivadoResponse"];
export type MensajeCreateRequest = components["schemas"]["MensajeCreateRequest"];

// Tipos del frontend para UI
export interface Contact {
    id: string
    name: string
    lastMessage: string
    timestamp: string
    isOnline: boolean
    unreadCount?: number
}

export interface Message {
    id: string
    senderId: string
    content: string
    timestamp: string
    isOwn: boolean
}