# Especificación de API - Sistema de Notificaciones

## Endpoints Requeridos

### 1. `GET /api/notificaciones`

Devuelve todas las notificaciones del usuario autenticado.

**Headers:**

```http
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK:**

```json
[
  {
    "id": "string",
    "title": "string",
    "body": "string",
    "timestamp": "2025-11-23T10:30:00Z",
    "read": boolean
  }
]
```

**Ejemplo de Response:**

```json
[
	{
		"id": "notif-123",
		"title": "Nuevo mensaje en el curso",
		"body": "Juan comentó en el foro de Matemáticas",
		"timestamp": "2025-11-23T14:20:00Z",
		"read": false
	},
	{
		"id": "notif-124",
		"title": "Tarea calificada",
		"body": "Tu tarea de Historia ha sido calificada: 95/100",
		"timestamp": "2025-11-22T09:15:00Z",
		"read": true
	},
	{
		"id": "notif-125",
		"title": "Recordatorio",
		"body": "Tienes una clase en 30 minutos",
		"timestamp": "2025-11-23T08:00:00Z",
		"read": true
	}
]
```

---

### 2. `PUT /api/notificaciones/{id}/marcar-leida`

Marca una notificación específica como leída.

**Headers:**

```http
Authorization: Bearer {JWT_TOKEN}
```

**Path Parameters:**

-   `id` (string): ID de la notificación a marcar como leída

**Response 200 OK:**

```json
{
	"success": true
}
```

**Response 404 Not Found:**

```json
{
	"error": "Notification not found"
}
```

---

### 3. `PUT /api/notificaciones/marcar-todas-leidas`

Marca todas las notificaciones del usuario como leídas.

**Headers:**

```http
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK:**

```json
{
	"success": true,
	"count": 5
}
```

---

## DTO en Spring Boot

```java
public class NotificationDTO {
    private String id;
    private String title;
    private String body;
    private String timestamp; // ISO 8601 format: "2025-11-23T14:20:00Z"
    private boolean read;

    // Constructor vacío
    public NotificationDTO() {}

    // Constructor completo
    public NotificationDTO(String id, String title, String body, String timestamp, boolean read) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.timestamp = timestamp;
        this.read = read;
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
}
```

---

## Controlador de Ejemplo

```java
@RestController
@RequestMapping("/api/notificaciones")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {

        String userId = userDetails.getUsername(); // o el ID del usuario autenticado
        List<NotificationDTO> notifications = notificationService.getNotificationsForUser(userId);

        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/marcar-leida")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {

        String userId = userDetails.getUsername();
        boolean success = notificationService.markAsRead(id, userId);

        if (!success) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/marcar-todas-leidas")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {

        String userId = userDetails.getUsername();
        int count = notificationService.markAllAsRead(userId);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "count", count
        ));
    }
}
```

---

## Consideraciones Importantes

### 1. **Autenticación**

-   El endpoint debe validar el JWT token
-   Devolver **solo** las notificaciones del usuario autenticado
-   Retornar `401 Unauthorized` si el token es inválido o expirado

### 2. **Formato de Timestamp**

-   Usar formato **ISO 8601**: `2025-11-23T14:20:00Z`
-   Incluir zona horaria (recomendado UTC)
-   Ejemplo de conversión en Java:
    ```java
    String timestamp = Instant.now().toString();
    // O si tienes LocalDateTime:
    String timestamp = LocalDateTime.now().atZone(ZoneId.of("UTC")).format(DateTimeFormatter.ISO_INSTANT);
    ```

### 3. **Ordenamiento**

-   Las notificaciones deben venir ordenadas por **timestamp descendente** (más recientes primero)
-   Esto permite mostrar las notificaciones más importantes arriba

### 4. **Comportamiento del Frontend**

-   El frontend hace **polling cada 30 segundos** desde el servidor para obtener notificaciones
-   Las llamadas NO vienen directamente del navegador del usuario
-   Son llamadas **server-to-server** desde Next.js/React Router al backend Spring Boot
-   Esto mantiene el JWT token seguro y nunca expuesto al cliente
-   **NUEVO**: Cuando el usuario hace click en una notificación o marca todas como leídas, se hace una llamada **desde el navegador** a los endpoints PUT para persistir el estado

### 5. **Casos de Error**

| Código | Descripción           | Cuándo ocurre                                                  |
| ------ | --------------------- | -------------------------------------------------------------- |
| 200    | OK                    | Notificaciones obtenidas correctamente (puede ser array vacío) |
| 401    | Unauthorized          | Token inválido, expirado o no presente                         |
| 500    | Internal Server Error | Error al obtener notificaciones de la base de datos            |

---

## Estructura de Datos

### Campos Obligatorios

| Campo       | Tipo    | Descripción                                 | Ejemplo                     |
| ----------- | ------- | ------------------------------------------- | --------------------------- |
| `id`        | String  | Identificador único de la notificación      | `"notif-123"`               |
| `title`     | String  | Título corto de la notificación             | `"Nuevo mensaje"`           |
| `body`      | String  | Contenido/descripción de la notificación    | `"Juan comentó en el foro"` |
| `timestamp` | String  | Fecha y hora en formato ISO 8601            | `"2025-11-23T14:20:00Z"`    |
| `read`      | Boolean | Si la notificación fue leída por el usuario | `false`                     |

### Notas sobre los Campos

-   **id**: Puede ser UUID, Long, o cualquier identificador único de tu base de datos
-   **title**: Máximo recomendado 100 caracteres (se muestra como encabezado)
-   **body**: Máximo recomendado 300 caracteres (se muestra como descripción)
-   **timestamp**: Debe ser parseable como Date en JavaScript
-   **read**: Por defecto `false` para notificaciones nuevas

---

## Ejemplo de Flujo Completo

### 1. Usuario hace login

```
POST /api/auth/login
Response: JWT Token en httpOnly cookie
```

### 2. Frontend carga la página (Server-Side)

```
GET /api/notificaciones
Headers: Authorization: Bearer {token_from_cookie}
Response: Array de NotificationDTO
```

### 3. Frontend hace polling cada 30 segundos

```
(Cada 30 segundos)
GET /api/notificaciones
Headers: Authorization: Bearer {token_from_cookie}
Response: Array actualizado de NotificationDTO
```

### 4. Usuario marca una notificación como leída

```
(Click en notificación)
PUT /api/notificaciones/{id}/marcar-leida
Headers: Authorization: Bearer {token_from_cookie}
Response: {"success": true}
```

### 5. Usuario marca todas como leídas

```
(Click en "Marcar todas leídas")
PUT /api/notificaciones/marcar-todas-leidas
Headers: Authorization: Bearer {token_from_cookie}
Response: {"success": true, "count": 5}
```

---

## Service de Ejemplo

```java
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<NotificationDTO> getNotificationsForUser(String userId) {
        return notificationRepository.findByUserIdOrderByTimestampDesc(userId)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public boolean markAsRead(String notificationId, String userId) {
        Optional<Notification> notification = notificationRepository.findById(notificationId);

        if (notification.isEmpty() || !notification.get().getUserId().equals(userId)) {
            return false;
        }

        Notification notif = notification.get();
        notif.setRead(true);
        notificationRepository.save(notif);

        return true;
    }

    public int markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndReadFalse(userId);

        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);

        return notifications.size();
    }

    private NotificationDTO toDTO(Notification notification) {
        return new NotificationDTO(
            notification.getId(),
            notification.getTitle(),
            notification.getBody(),
            notification.getTimestamp().toString(),
            notification.isRead()
        );
    }
}
```

---

## Preguntas Frecuentes

**Q: ¿El frontend llama directamente al backend?**  
A: No, el servidor de React Router (Node.js) llama al backend Spring Boot. Esto mantiene el JWT seguro.

**Q: ¿Cada cuánto se actualiza?**  
A: Cada 30 segundos mediante polling automático.

**Q: ¿El estado de "leído" persiste?**  
A: Sí, cuando el usuario marca una notificación como leída, se hace una llamada PUT al backend para persistir el cambio. Si el usuario refresca la página o abre la app en otro dispositivo, verá el estado actualizado.

**Q: ¿Se pueden enviar notificaciones en tiempo real?**  
A: Actualmente no. Este sistema usa polling. Para tiempo real necesitarían WebSockets o Server-Sent Events.

**Q: ¿Qué pasa si falla la llamada PUT al marcar como leída?**  
A: El frontend hace un "optimistic update" (actualiza la UI inmediatamente) y si la llamada al backend falla, revierte el cambio automáticamente.

**Q: ¿Hay límite de notificaciones?**  
A: Eso depende de ustedes. Recomendamos paginar o limitar a las últimas 50-100 notificaciones.

**Q: ¿Es necesario implementar los 3 endpoints?**  
A: Sí, los 3 son necesarios:

-   GET /api/notificaciones → Para obtener notificaciones (polling)
-   PUT /api/notificaciones/{id}/marcar-leida → Para marcar una como leída
-   PUT /api/notificaciones/marcar-todas-leidas → Para marcar todas como leídas

---

## Checklist de Implementación

**Endpoints (3 requeridos):**

-   [ ] Crear `NotificationDTO` con los 5 campos requeridos
-   [ ] Crear endpoint `GET /api/notificaciones` con autenticación JWT
-   [ ] Crear endpoint `PUT /api/notificaciones/{id}/marcar-leida`
-   [ ] Crear endpoint `PUT /api/notificaciones/marcar-todas-leidas`

**Lógica de negocio:**

-   [ ] Filtrar notificaciones por usuario autenticado
-   [ ] Ordenar por timestamp descendente
-   [ ] Validar que el usuario solo puede marcar sus propias notificaciones como leídas
-   [ ] Retornar 404 si se intenta marcar una notificación que no existe o no pertenece al usuario

**Formato y validación:**

-   [ ] Formatear timestamp como ISO 8601
-   [ ] Verificar que retorna 401 sin token válido
-   [ ] Verificar que retorna array vacío `[]` si no hay notificaciones
-   [ ] Probar con Postman/Insomnia los 3 endpoints

---

## Contacto

Si tienen dudas sobre la integración, pregunten a Gastón.
