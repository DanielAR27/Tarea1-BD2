const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");
require("dotenv").config();

const app = express();
app.use(express.json()); // Middleware para leer JSON en el body

// Middleware para validar el JWT
function verificarToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Acceso denegado. No hay token." });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.usuario = decoded; // Guardar usuario en `req`
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado." });
  }
}

// Endpoint para registrar un nuevo usuario
app.post("/auth/register", async (req, res) => {
  try {
    const { nombre, email, contrasena, rol } = req.body;

    // Validar que se envíen los datos requeridos
    if (!nombre || !email || !contrasena || !rol) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Validar el rol
    if (rol !== "cliente" && rol !== "administrador") {
      return res.status(400).json({ error: "El rol debe ser 'cliente' o 'administrador'." });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await pool.query("SELECT id_usuario FROM Usuario WHERE email = $1", [email]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado." });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const contrasena_hash = await bcrypt.hash(contrasena, salt);

    // Insertar el usuario en la base de datos
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

    // Validar que se envíen los datos requeridos
    if (!email || !contrasena) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios." });
    }

    // Buscar el usuario en la base de datos
    const usuario = await pool.query("SELECT * FROM Usuario WHERE email = $1", [email]);

    if (usuario.rows.length === 0) {
      return res.status(400).json({ error: "Credenciales inválidas." });
    }

    const { id_usuario, nombre, contrasena_hash, rol } = usuario.rows[0];

    // Verificar la contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, contrasena_hash);
    if (!contrasenaValida) {
      return res.status(400).json({ error: "Credenciales inválidas." });
    }

    // Generar el token JWT
    const token = jwt.sign(
      { id_usuario, nombre, email, rol },
      process.env.JWT_SECRET,
      { expiresIn: "2h" } // El token expira en 2 horas
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

// Endpoint para obtener los datos del usuario autenticado
app.get("/users/me", verificarToken, (req, res) => {
  res.json({
    id_usuario: req.usuario.id_usuario,
    nombre: req.usuario.nombre,
    email: req.usuario.email,
    rol: req.usuario.rol
  });
});

// Endpoint para actualizar un usuario
app.put("/users/:id", verificarToken, async (req, res) => {
    try {
      const { id } = req.params; // ID del usuario a actualizar
      const { nombre, rol } = req.body;
  
      // Asegurar que el usuario existe
      const usuarioExistente = await pool.query("SELECT * FROM Usuario WHERE id_usuario = $1", [id]);
      if (usuarioExistente.rows.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }
  
      // Permitir actualizar el nombre del usuario autenticado
      if (req.usuario.id_usuario !== parseInt(id) && req.usuario.rol !== "administrador") {
        return res.status(403).json({ error: "No tiene permisos para modificar este usuario." });
      }
  
      // Validar si el usuario quiere actualizar el rol
      if (rol && req.usuario.rol !== "administrador") {
        return res.status(403).json({ error: "Solo los administradores pueden cambiar roles." });
      }
  
      // Actualizar en la base de datos
      const usuarioActualizado = await pool.query(
        "UPDATE Usuario SET nombre = COALESCE($1, nombre), rol = COALESCE($2, rol) WHERE id_usuario = $3 RETURNING id_usuario, nombre, email, rol",
        [nombre || usuarioExistente.rows[0].nombre, rol || usuarioExistente.rows[0].rol, id]
      );
  
      res.json({
        message: "Usuario actualizado exitosamente",
        usuario: usuarioActualizado.rows[0],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error en el servidor" });
    }
});

// Endpoint para eliminar usuario
app.delete("/users/:id", verificarToken, async (req, res) => {
    try {
      const { id } = req.params;
  
      // Asegurar que el usuario existe
      const usuarioExistente = await pool.query("SELECT * FROM Usuario WHERE id_usuario = $1", [id]);
      if (usuarioExistente.rows.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }
  
      // Solo administradores pueden eliminar usuarios
      if (req.usuario.rol !== "administrador") {
        return res.status(403).json({ error: "No tiene permisos para eliminar usuarios." });
      }
  
      // Evitar que un usuario se elimine a sí mismo
      if (req.usuario.id_usuario === parseInt(id)) {
        return res.status(403).json({ error: "No puede eliminar su propia cuenta." });
      }
  
      // Eliminar el usuario de la base de datos
      await pool.query("DELETE FROM Usuario WHERE id_usuario = $1", [id]);
  
      res.json({ message: "Usuario eliminado exitosamente." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error en el servidor" });
    }
});
  
// Puerto de ejecución
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servicio de autenticación ejecutándose en el puerto ${PORT}`);
});
