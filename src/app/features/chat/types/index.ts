export interface Contact {
    id: string
    name: string
    lastMessage: string
    timestamp: string
    isOnline: boolean
    unreadCount?: number
}

export interface Message { //TODO revisar duplicado
    id: string
    senderId: string
    content: string
    timestamp: string
    isOwn: boolean
}



export interface Contacto {
    id: number;
    nombre: string;
    apellido: string;
    rol: "ADMINISTRADOR" | "PROFESOR" | "ESTUDIANTE";
    fotoPerfilUrl?: string;
    ultimoMensaje?: string;
    timestampUltimoMensaje?: string;
    enLinea: boolean;
    mensajesNoLeidos?: number;
}

export interface Mensaje {
    id: number;
    remitenteId: number;
    destinatarioId: number;
    contenido: string;
    timestamp: string;
    leido: boolean;
}

export interface Chat {
    contacto: Contacto;
    mensajes: Mensaje[];
}

export interface EnviarMensajeRequest {
    destinatarioId: number;
    contenido: string;
}

export interface EnviarMensajeResponse {
    id: number;
    remitenteId: number;
    destinatarioId: number;
    contenido: string;
    timestamp: string;
    leido: boolean;
}

export interface ErrorResponse {
    error: string;
}