const axios = require("axios");

// Utiliza el middleware del contenedor de autenticación
module.exports = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Acceso denegado. No hay token." });

  try {
    // Llamar al servicio de autenticación para verificar el token
    const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/auth/verify`, {
      headers: {
        Authorization: token
      }
    });

    // Si el token es válido, se guarda el usuario en la request
    req.user = response.data.usuario;
    next();
  } catch (error) {
    console.error("Error al verificar token con auth_service:", error.message);
    res.status(401).json({ error: "Token inválido o expirado (vía auth_service)." });
  }
};
