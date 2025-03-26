const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swaggerConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();
app.use(express.json());

// Middleware para validar JWT
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

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Endpoints relacionados a autenticación
 *   - name: Users
 *     description: Acciones sobre usuarios autenticados
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verificar un token JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido o faltante
 */
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

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, contrasena, rol]
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               contrasena:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [cliente, administrador]
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
app.post("/auth/register", async (req, res) => {
  try {
    const { nombre, email, contrasena, rol } = req.body;

    if (!nombre || !email || !contrasena || !rol) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    if (!["cliente", "administrador"].includes(rol)) {
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
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener un JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, contrasena]
 *             properties:
 *               email:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       400:
 *         description: Credenciales inválidas o faltantes
 */
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
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Obtener datos del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: No autorizado
 */
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
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar un usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, rol]
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [cliente, administrador]
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       400:
 *         description: Campos inválidos
 *       403:
 *         description: No tienes permisos para modificar este usuario
 *       404:
 *         description: Usuario no encontrado
 */

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
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar un usuario por ID (solo administrador)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       403:
 *         description: No tienes permisos para eliminar usuarios
 *       404:
 *         description: Usuario no encontrado
 */

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
    res.status(500).json({ error: "Error en el servidor." });
  }
});

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Export para pruebas
module.exports = app;

// Si se ejecuta directamente
if (require.main === module) {
  const PORT = process.env.AUTH_PORT || 4000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Autenticación corriendo en http://0.0.0.0:${PORT}`);
  });
}
