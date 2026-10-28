// GA7-220501096-AA5-EV01 - Servicio web de registro e inicio de sesión
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getUsers, saveUsers } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_para_desarrollo";

// Permite recibir solicitudes JSON y solicitudes desde otros orígenes.
app.use(cors());
app.use(express.json());

function esObjetoJson(valor) {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor);
}

app.get("/", (req, res) => {
  res.json({
    mensaje: "API de Registro e Inicio de Sesión funcionando correctamente",
    evidencia: "GA7-220501096-AA5-EV01"
  });
});

// Registro de usuario.
app.post("/api/auth/register", async (req, res) => {
  try {
    if (!esObjetoJson(req.body)) {
      return res.status(400).json({
        error: "El cuerpo de la solicitud debe ser un objeto JSON."
      });
    }

    const { usuario, contraseña } = req.body;

    // Validación de campos obligatorios.
    if (typeof usuario !== "string" || typeof contraseña !== "string" ||
        !usuario.trim() || !contraseña) {
      return res.status(400).json({
        error: "El usuario y la contraseña son obligatorios y deben ser texto."
      });
    }

    const nombreUsuario = usuario.trim();

    if (nombreUsuario.length < 3 || nombreUsuario.length > 30) {
      return res.status(400).json({
        error: "El usuario debe tener entre 3 y 30 caracteres."
      });
    }

    if (contraseña.length < 6 || Buffer.byteLength(contraseña, "utf8") > 72) {
      return res.status(400).json({
        error: "La contraseña debe tener mínimo 6 caracteres y máximo 72 bytes."
      });
    }

    const users = getUsers();

    // Se evita registrar dos veces el mismo usuario.
    const existe = users.some(
      (user) => user.usuario.toLowerCase() === nombreUsuario.toLowerCase()
    );

    if (existe) {
      return res.status(409).json({
        error: "El usuario ya está registrado."
      });
    }

    // La contraseña se almacena cifrada mediante bcrypt.
    const contraseñaHash = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = {
      id: users.reduce((ultimoId, user) => Math.max(ultimoId, user.id), 0) + 1,
      usuario: nombreUsuario,
      contraseñaHash
    };

    users.push(nuevoUsuario);
    saveUsers(users);

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente.",
      usuario: nuevoUsuario.usuario
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error interno del servidor."
    });
  }
});

// Inicio de sesión.
app.post("/api/auth/login", async (req, res) => {
  try {
    if (!esObjetoJson(req.body)) {
      return res.status(400).json({
        error: "El cuerpo de la solicitud debe ser un objeto JSON."
      });
    }

    const { usuario, contraseña } = req.body;

    if (typeof usuario !== "string" || typeof contraseña !== "string" ||
        !usuario.trim() || !contraseña) {
      return res.status(400).json({
        error: "El usuario y la contraseña son obligatorios y deben ser texto."
      });
    }

    if (Buffer.byteLength(contraseña, "utf8") > 72) {
      return res.status(400).json({
        error: "La contraseña no puede superar 72 bytes."
      });
    }

    const users = getUsers();
    const nombreUsuario = usuario.trim();
    const user = users.find(
      (item) => item.usuario.toLowerCase() === nombreUsuario.toLowerCase()
    );

    // Se devuelve un mensaje de error si el usuario no existe.
    if (!user) {
      return res.status(401).json({
        error: "Error en la autenticación."
      });
    }

    // Comparación segura entre contraseña recibida y hash almacenado.
    const contraseñaValida = await bcrypt.compare(
      contraseña,
      user.contraseñaHash
    );

    if (!contraseñaValida) {
      return res.status(401).json({
        error: "Error en la autenticación."
      });
    }

    // Se genera un token JWT para representar la sesión autenticada.
    const token = jwt.sign(
      { id: user.id, usuario: user.usuario },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      mensaje: "Autenticación satisfactoria.",
      usuario: user.usuario,
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error interno del servidor."
    });
  }
});

// Endpoint protegido para comprobar el token.
app.get("/api/auth/perfil", (req, res) => {
  const encabezado = req.headers.authorization;

  const coincidencia = encabezado && encabezado.match(/^Bearer\s+(\S+)$/i);
  if (!coincidencia) {
    return res.status(401).json({
      error: "Token de autenticación requerido."
    });
  }

  const token = coincidencia[1];

  try {
    const datos = jwt.verify(token, JWT_SECRET);

    return res.status(200).json({
      mensaje: "Acceso autorizado.",
      usuario: datos.usuario
    });
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido o expirado."
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada."
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "El cuerpo de la solicitud contiene JSON inválido."
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      error: "El cuerpo de la solicitud excede el tamaño permitido."
    });
  }

  console.error(error);
  return res.status(500).json({
    error: "Error interno del servidor."
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});