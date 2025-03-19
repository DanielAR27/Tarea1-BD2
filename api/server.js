const express = require("express");
const axios = require("axios"); // Para hacer peticiones HTTP a auth_service
const pool = require("./db"); // Importar la base de datos desde la ubicación compartida

const app = express();
app.use(express.json());

// Middleware para validar el JWT con auth_service
async function verificarToken(req, res, next) {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ error: "Acceso denegado. No hay token." });
    }

    // Enviar el token a auth_service para validarlo
    const respuesta = await axios.get("http://auth_service:4000/auth/verify", {
      headers: { Authorization: token }
    });

    req.usuario = respuesta.data.usuario; // Guardar usuario en req
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}

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
    const { id } = req.params;
    const { nombre, rol } = req.body;

    const usuarioExistente = await pool.query("SELECT * FROM Usuario WHERE id_usuario = $1", [id]);
    if (usuarioExistente.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    if (req.usuario.id_usuario !== parseInt(id) && req.usuario.rol !== "administrador") {
      return res.status(403).json({ error: "No tiene permisos para modificar este usuario." });
    }

    if (rol && req.usuario.rol !== "administrador") {
      return res.status(403).json({ error: "Solo los administradores pueden cambiar roles." });
    }

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

    const usuarioExistente = await pool.query("SELECT * FROM Usuario WHERE id_usuario = $1", [id]);
    if (usuarioExistente.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    if (req.usuario.rol !== "administrador") {
      return res.status(403).json({ error: "No tiene permisos para eliminar usuarios." });
    }

    if (req.usuario.id_usuario === parseInt(id)) {
      return res.status(403).json({ error: "No puede eliminar su propia cuenta." });
    }

    await pool.query("DELETE FROM Usuario WHERE id_usuario = $1", [id]);

    res.json({ message: "Usuario eliminado exitosamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API ejecutándose en el puerto ${PORT}`);
});