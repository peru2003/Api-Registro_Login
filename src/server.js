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

app.get("/", (req, res) => {
  res.json({
    mensaje: "API de Registro e Inicio de Sesión funcionando correctamente",
    evidencia: "GA7-220501096-AA5-EV01"
  });
});

// Registro de usuario.
app.post("/api/auth/register", async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;

    // Validación de campos obligatorios.
    if (!usuario || !contraseña) {
      return res.status(400).json({
        error: "El usuario y la contraseña son obligatorios."
      });
    }

    if (usuario.length < 3) {
      return res.status(400).json({
        error: "El usuario debe tener mínimo 3 caracteres."
      });
    }

    if (contraseña.length < 6) {
      return res.status(400).json({
        error: "La contraseña debe tener mínimo 6 caracteres."
      });
    }

    const users = getUsers();

    // Se evita registrar dos veces el mismo usuario.
    const existe = users.some(
      (user) => user.usuario.toLowerCase() === usuario.toLowerCase()
    );

    if (existe) {
      return res.status(409).json({
        error: "El usuario ya está registrado."
      });
    }

    // La contraseña se almacena cifrada mediante bcrypt.
    const contraseñaHash = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = {
      id: users.length + 1,
      usuario,
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
    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
      return res.status(400).json({
        error: "El usuario y la contraseña son obligatorios."
      });
    }

    const users = getUsers();
    const user = users.find(
      (item) => item.usuario.toLowerCase() === usuario.toLowerCase()
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

  if (!encabezado || !encabezado.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Token de autenticación requerido."
    });
  }

  const token = encabezado.split(" ")[1];

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

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});