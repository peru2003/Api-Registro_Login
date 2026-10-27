# GA7-220501096-AA5-EV01 - API de Registro e Inicio de Sesión

## 1. Descripción

Servicio web REST desarrollado con Node.js y Express para realizar:

- Registro de usuarios.
- Inicio de sesión.
- Validación de usuario y contraseña.
- Respuesta de autenticación satisfactoria o error de autenticación.
- Generación de token JWT.
- Consulta de un recurso protegido.
- Persistencia local mediante archivo JSON.
- Control de versiones mediante Git.

## 2. Tecnologías

- Node.js
- Express
- bcryptjs
- JSON Web Token (JWT)
- CORS
- Git y GitHub
- Postman o Thunder Client para pruebas

## 3. Instalación

Requisitos:
- Node.js instalado.
- Git instalado.

Ejecutar:

```bash
npm install
npm start
```

El servicio estará disponible en:

`http://localhost:3000`

Para desarrollo:

```bash
npm run dev
```

## 4. Endpoints

### GET /
Comprueba que la API esté funcionando.

### POST /api/auth/register
Registra un usuario.

Body JSON:

```json
{
  "usuario": "abraham",
  "contraseña": "123456"
}
```

Respuesta esperada:

```json
{
  "mensaje": "Usuario registrado correctamente.",
  "usuario": "abraham"
}
```

### POST /api/auth/login
Realiza la autenticación.

Body correcto:

```json
{
  "usuario": "abraham",
  "contraseña": "123456"
}
```

Respuesta correcta:

```json
{
  "mensaje": "Autenticación satisfactoria.",
  "usuario": "abraham",
  "token": "..."
}
```

Con contraseña incorrecta:

```json
{
  "error": "Error en la autenticación."
}
```

### GET /api/auth/perfil
Recurso protegido. En Postman enviar:

`Authorization: Bearer TU_TOKEN`

## 5. Pruebas recomendadas

1. Ejecutar GET `/`.
2. Registrar un usuario con POST `/api/auth/register`.
3. Intentar registrar nuevamente el mismo usuario.
4. Iniciar sesión con datos correctos.
5. Iniciar sesión con contraseña incorrecta.
6. Probar `/api/auth/perfil` usando el token.
7. Probar `/api/auth/perfil` sin token.
8. Capturar pantallazos de cada resultado para anexarlos al informe.

## 6. Versionamiento con Git

Comandos sugeridos:

```bash
git init
git add .
git commit -m "Inicialización del proyecto API"
git branch -M main
git remote add origin URL_DE_TU_REPOSITORIO
git push -u origin main
```

Cada cambio importante debe registrarse con un commit descriptivo.

## 7. Estructura

```text
GA7-220501096-AA5-EV01_API_Registro_Login/
├── data/
│   └── users.example.json
├── docs/
│   └── informe_evidencia.md
├── src/
│   ├── db.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 8. Nota de seguridad

El proyecto es académico. Las contraseñas no se guardan en texto plano: se almacenan mediante hash bcrypt. Para producción se recomienda usar variables de entorno, una base de datos real, HTTPS, políticas de contraseñas y gestión segura de secretos.
