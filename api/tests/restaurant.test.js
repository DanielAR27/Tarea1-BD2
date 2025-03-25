const request = require("supertest");
const app = require("../server");
const Restaurant = require("../src/models/restaurant.model");

let token;
let createdRestaurantId;

beforeAll(async () => {
  const authUrl = process.env.AUTH_SERVICE_URL || "http://auth_service:4000";

  console.log("🔐 Intentando login en:", `${authUrl}/auth/login`);

  try {
    const loginRes = await request(authUrl)
      .post("/auth/login")
      .send({
        email: "admin@example.com",
        contrasena: "admin123"
      });

    token = loginRes.body.token;

    if (!token) {
      throw new Error("No se pudo obtener el token desde auth_service.");
    }

    console.log("Token obtenido correctamente.");
  } catch (err) {
    console.error("Error en login:", err.message);
    throw err;
  }
});

describe("📌 Rutas de /restaurants", () => {
  it("debería crear un restaurante si el token es válido", async () => {
    const res = await request(app)
      .post("/restaurants")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Restaurante de Prueba",
        direccion: "Avenida Jest"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id_restaurante");
    expect(res.body.nombre).toBe("Restaurante de Prueba");

    createdRestaurantId = res.body.id_restaurante; // Guardar ID para pruebas siguientes
  });

  it("debería devolver 400 si no hay token ni id admin", async () => {
    const res = await request(app)
      .post("/restaurants") // Sin token y sin id_admin
      .send({
        nombre: "Restaurante sin Admin",
        direccion: "Calle Fantasma"
      });
  
    expect(res.statusCode).toBe(400); // Da error 400 por el middleware
    expect(res.body).toHaveProperty("error", "Se requiere un id_admin válido.");
  });
  
  it("debería obtener todos los restaurantes", async () => {
    const res = await request(app)
      .get("/restaurants")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("debería obtener un restaurante por ID", async () => {
    const res = await request(app)
      .get(`/restaurants/${createdRestaurantId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id_restaurante", createdRestaurantId);
    expect(res.body).toHaveProperty("nombre");
    expect(res.body).toHaveProperty("direccion");
  });


    it("debería actualizar un restaurante existente", async () => {
      const res = await request(app)
        .put(`/restaurants/${createdRestaurantId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre: "Restaurante Actualizado",
          direccion: "Nueva Dirección 123"
        });
  
      expect(res.statusCode).toBe(201);
      expect(res.body.nombre).toBe("Restaurante Actualizado");
    });
  
    it("debería fallar al actualizar un restaurante inexistente", async () => {
      const res = await request(app)
        .put("/restaurants/1000")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre: "No Existe",
          direccion: "Tampoco Existe"
        });
  
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error");
      });
  
    it("debería fallar si faltan campos obligatorios", async () => {
      const res = await request(app)
        .put(`/restaurants/${createdRestaurantId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ nombre: "" }); // Falta dirección
  
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  
    it("debería eliminar el restaurante correctamente", async () => {
      const res = await request(app)
        .delete(`/restaurants/${createdRestaurantId}`)
        .set("Authorization", `Bearer ${token}`);
  
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Restaurante eliminado correctamente");
    });
  
    it("debería fallar al intentar eliminar un restaurante inexistente", async () => {
      const res = await request(app)
        .delete("/restaurants/1000")
        .set("Authorization", `Bearer ${token}`);
  
      expect(res.statusCode).toBe(404);
    });
  
    it("debería manejar errores del servidor (500) al obtener todos los restaurantes", async () => {
      // Mock asíncrono que lanza error (¡importante!)
      const spy = jest.spyOn(Restaurant, "getAll").mockImplementation(async () => {
        throw new Error("Falla simulada en la base de datos");
      });
    
      const res = await request(app)
        .get("/restaurants")
        .set("Authorization", `Bearer ${token}`);
    
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    
      spy.mockRestore(); // Restaurar comportamiento original
    });
       
    it("debería manejar errores del servidor (500) al obtener restaurante por ID", async () => {
      const spy = jest.spyOn(Restaurant, "getById").mockImplementation(async () => {
        throw new Error("Falla simulada al buscar restaurante por ID");
      });
    
      const res = await request(app)
        .get("/restaurants/999") // Cualquier ID, no importa, porque está mockeado
        .set("Authorization", `Bearer ${token}`);
    
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    
      spy.mockRestore();
    });
    
});
