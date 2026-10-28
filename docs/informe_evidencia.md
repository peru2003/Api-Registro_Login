# Evidencia GA7-220501096-AA5-EV01
## Diseño y desarrollo de servicios web - caso

### Introducción

El presente proyecto desarrolla un servicio web REST para el registro e inicio de sesión de usuarios. La solución permite crear una cuenta, validar las credenciales suministradas y responder con un mensaje de autenticación satisfactoria cuando los datos son correctos. Si las credenciales no coinciden, la API devuelve un error de autenticación.

### Objetivo general

Diseñar y codificar un servicio web para registro y autenticación de usuarios, aplicando principios básicos de construcción de API, validación de datos, seguridad de contraseñas y herramientas de versionamiento.

### Objetivos específicos

- Crear un endpoint para registrar usuarios.
- Crear un endpoint para iniciar sesión.
- Validar usuario y contraseña.
- Evitar almacenar contraseñas en texto plano.
- Generar un token para sesiones autenticadas.
- Documentar el código mediante comentarios.
- Utilizar Git para el control de versiones.

### Diseño de la solución

La API está construida con Node.js y Express. El registro recibe usuario y contraseña, valida los datos, genera un hash de la contraseña con bcrypt y almacena el usuario en un archivo JSON. El inicio de sesión compara el hash y, si las credenciales son correctas, entrega un token JWT. El servicio de perfil verifica ese token antes de autorizar la respuesta.

El contrato de las rutas, parámetros, cuerpos, respuestas y códigos HTTP se especifica en [`openapi.yaml`](./openapi.yaml). La especificación puede importarse en Swagger Editor o Postman.

### Endpoints

| Método | Ruta | Función | Respuestas principales |
|---|---|---|---|
| GET | `/` | Verificar funcionamiento de la API | `200` |
| POST | `/api/auth/register` | Registrar usuario | `201`, `400`, `409`, `413`, `500` |
| POST | `/api/auth/login` | Autenticar usuario y emitir JWT | `200`, `400`, `401`, `413`, `500` |
| GET | `/api/auth/perfil` | Consultar recurso protegido con `Bearer JWT` | `200`, `401` |

Todas las solicitudes de escritura usan `Content-Type: application/json`. Los errores se devuelven como un objeto JSON con la propiedad `error`. En registro el usuario debe tener entre 3 y 30 caracteres; la contraseña requiere al menos 6 caracteres y no puede superar 72 bytes UTF-8.

### Ejemplo de registro

```json
{
  "usuario": "abraham",
  "contraseña": "123456"
}
```

### Ejemplo de inicio de sesión correcto

```json
{
  "usuario": "abraham",
  "contraseña": "123456"
}
```

Resultado esperado:

```json
{
  "mensaje": "Autenticación satisfactoria.",
  "usuario": "abraham",
  "token": "<jwt>"
}
```

### Ejemplo de autenticación incorrecta

Si se utiliza una contraseña diferente:

```json
{
  "usuario": "abraham",
  "contraseña": "incorrecta"
}
```

Resultado esperado:

```json
{
  "error": "Error en la autenticación."
}
```

### Versionamiento

El proyecto debe administrarse mediante Git. Se recomienda realizar un commit inicial y posteriormente registrar los cambios relevantes. El repositorio remoto puede alojarse en GitHub.

Comandos:

```bash
git init
git add .
git commit -m "Inicialización API registro login"
git branch -M main
git remote add origin URL_DE_TU_REPOSITORIO
git push -u origin main
```

### Pruebas

Para la evidencia de funcionamiento se recomienda utilizar Postman o Thunder Client y tomar capturas de:

1. API funcionando.
2. Registro exitoso.
3. Registro de usuario existente.
4. Inicio de sesión exitoso.
5. Inicio de sesión con contraseña incorrecta.
6. Acceso al perfil con token.
7. Acceso al perfil sin token.
8. Envío de JSON malformado y de campos con tipos no válidos.

### Conclusión

El servicio desarrollado cumple con el caso planteado, ya que permite registrar usuarios y realizar un proceso de autenticación mediante usuario y contraseña. Además, incorpora validaciones, hash de contraseñas, token JWT, especificación OpenAPI y una estructura preparada para trabajar con Git y GitHub. La solución puede ampliarse posteriormente mediante una base de datos y mecanismos adicionales de seguridad.
