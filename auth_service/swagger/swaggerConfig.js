// docs/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Servicio de Autenticación",
    version: "1.0.0",
    description: "Documentación del servicio de autenticación con JWT",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Servidor local",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./auth.js"], // Aquí defines qué archivos contienen los comentarios de Swagger
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
