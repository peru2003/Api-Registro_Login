# API de Registro e Inicio de Sesión

Servicio REST académico desarrollado con Node.js y Express para registrar usuarios, autenticar credenciales y consultar un recurso protegido mediante JWT.

## Requisitos e instalación

- Node.js y npm.

```bash
npm install
npm start
```

La API estará disponible en `http://localhost:3000`. Para desarrollo con reinicio automático:

```bash
npm run dev
```

El servidor usa `PORT=3000` si no se configura otra variable. Para firmar los JWT utiliza `JWT_SECRET`; si no se configura, la aplicación emplea una clave predeterminada solo para desarrollo. En PowerShell se puede definir una clave para la sesión actual antes de iniciar el servicio:

```powershell
$env:JWT_SECRET = "reemplazar-por-una-clave-local-segura"
npm start
```

No usar la clave predeterminada ni almacenar secretos en el repositorio en un despliegue real.

## Contrato de la API

La especificación OpenAPI 3.0 con rutas, esquemas, ejemplos y respuestas está en [`docs/openapi.yaml`](./docs/openapi.yaml). Puede importarse en Swagger Editor o en Postman para explorar y probar los servicios.

Todas las solicitudes con cuerpo deben enviarse como `Content-Type: application/json`. Los errores usan el formato:

```json
{
  "error": "Descripción del error."
}
```

### `GET /` — Estado

Comprueba que el servicio está activo.

- `200 OK`: devuelve un mensaje de disponibilidad y el identificador de la evidencia.

### `POST /api/auth/register` — Registrar usuario

Solicitud:

```json
{
  "usuario": "abraham",
  "contraseña": "123456"
}
```

El usuario debe tener entre 3 y 30 caracteres. Se eliminan espacios al inicio y al final; la comparación de nombres no distingue mayúsculas. La contraseña debe tener mínimo 6 caracteres y máximo 72 bytes UTF-8. Las contraseñas se almacenan como hash bcrypt, nunca en texto plano.

- `201 Created`: usuario registrado.
- `400 Bad Request`: cuerpo JSON o campos inválidos.
- `409 Conflict`: el usuario ya existe.
- `413 Payload Too Large`: cuerpo superior al límite del parser JSON.
- `500 Internal Server Error`: error interno.

Respuesta `201`:

```json
{
  "mensaje": "Usuario registrado correctamente.",
  "usuario": "abraham"
}
```

### `POST /api/auth/login` — Iniciar sesión

Solicitud:

```json
{
  "usuario": "abraham",
  "contraseña": "123456"
}
```

- `200 OK`: credenciales correctas; devuelve un JWT con vigencia de una hora.
- `400 Bad Request`: cuerpo JSON o campos inválidos; la contraseña no puede superar 72 bytes UTF-8.
- `401 Unauthorized`: usuario o contraseña incorrectos. El mensaje es genérico.
- `413 Payload Too Large`: cuerpo superior al límite del parser JSON.
- `500 Internal Server Error`: error interno.

Respuesta `200`:

```json
{
  "mensaje": "Autenticación satisfactoria.",
  "usuario": "abraham",
  "token": "<jwt>"
}
```

### `GET /api/auth/perfil` — Consultar perfil protegido

Enviar el token obtenido en el inicio de sesión en el encabezado:

```text
Authorization: Bearer <jwt>
```

- `200 OK`: token válido; devuelve el nombre de usuario.
- `401 Unauthorized`: encabezado ausente, token inválido o expirado.

## Persistencia y pruebas manuales

Los registros se guardan en `data/users.json`, que se crea al ejecutar la API y está excluido de Git. Para probar el flujo con Postman o Thunder Client:

1. Consultar `GET /`.
2. Registrar un usuario nuevo.
3. Intentar registrarlo de nuevo para verificar `409`.
4. Iniciar sesión con las credenciales correctas e incorrectas.
5. Consultar el perfil con el JWT y luego sin él.
6. Probar un cuerpo JSON inválido y campos de tipo incorrecto.

## Estructura

```text
├── data/
│   └── users.example.json
├── docs/
│   ├── informe_evidencia.md
│   └── openapi.yaml
├── src/
│   ├── db.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

La persistencia JSON está destinada al ejercicio. Para un entorno productivo se recomienda una base de datos, HTTPS, gestión segura de secretos, límites de solicitudes y controles adicionales de autenticación.
