const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");
require("dotenv").config();

const app = express();
app.use(express.json());

// Middleware para validar el JWT
function verificarToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Acceso denegado. No hay token." });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado." });
  }
}

// Endpoint para verificar el token
app.get("/auth/verify", (req, res) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "No hay token" });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    res.json({ usuario: decoded });
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
});

// Endpoint para registrar un nuevo usuario
app.post("/auth/register", async (req, res) => {
  try {
    const { nombre, email, contrasena, rol } = req.body;

    if (!nombre || !email || !contrasena || !rol) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    if (rol !== "cliente" && rol !== "administrador") {
      return res.status(400).json({ error: "El rol debe ser 'cliente' o 'administrador'." });
    }

    const usuarioExistente = await pool.query("SELECT id_usuario FROM Usuario WHERE email = $1", [email]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const contrasena_hash = await bcrypt.hash(contrasena, salt);

    const nuevoUsuario = await pool.query(
      "INSERT INTO Usuario (nombre, email, contrasena_hash, rol) VALUES ($1, $2, $3, $4) RETURNING id_usuario, nombre, email, rol, fecha_registro",
      [nombre, email, contrasena_hash, rol]
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      usuario: nuevoUsuario.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Endpoint para iniciar sesión y obtener un JWT
app.post("/auth/login", async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios." });
    }

    const usuario = await pool.query("SELECT * FROM Usuario WHERE email = $1", [email]);
    if (usuario.rows.length === 0) {
      return res.status(400).json({ error: "Credenciales inválidas." });
    }

    const { id_usuario, nombre, contrasena_hash, rol } = usuario.rows[0];
    const contrasenaValida = await bcrypt.compare(contrasena, contrasena_hash);
    if (!contrasenaValida) {
      return res.status(400).json({ error: "Credenciales inválidas." });
    }

    const token = jwt.sign(
      { id_usuario, nombre, email, rol },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Inicio de sesión exitoso",
      token,
      usuario: { id_usuario, nombre, email, rol }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


// Endpoint para obtener los detalles del usuario autenticado
app.get("/users/me", verificarToken, async (req, res) => {
  try {
    const usuario = await pool.query(
      "SELECT id_usuario, nombre, email, rol, fecha_registro FROM Usuario WHERE id_usuario = $1",
      [req.usuario.id_usuario]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(usuario.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


// Endpoint para actualizar un usuario
app.put("/users/:id", verificarToken, async (req, res) => {
  try {
    const { nombre, email, rol } = req.body;
    const { id } = req.params;

    if (!nombre || !email || !rol) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    if (rol !== "cliente" && rol !== "administrador") {
      return res.status(400).json({ error: "El rol debe ser 'cliente' o 'administrador'." });
    }

    const usuarioExistente = await pool.query("SELECT * FROM Usuario WHERE id_usuario = $1", [id]);
    if (usuarioExistente.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const usuarioActualizado = await pool.query(
      "UPDATE Usuario SET nombre = $1, email = $2, rol = $3 WHERE id_usuario = $4 RETURNING id_usuario, nombre, email, rol",
      [nombre, email, rol, id]
    );

    res.json({
      message: "Usuario actualizado correctamente",
      usuario: usuarioActualizado.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


// Endpoint para eliminar un usuario
app.delete("/users/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Solo un administrador puede eliminar usuarios
    if (req.usuario.rol !== "administrador") {
      return res.status(403).json({ error: "No tienes permisos para eliminar usuarios." });
    }

    const result = await pool.query("DELETE FROM Usuario WHERE id_usuario = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor." });
  }
});



const PORT = process.env.AUTH_PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servicio de autenticación ejecutándose en el puerto ${PORT}`);
});