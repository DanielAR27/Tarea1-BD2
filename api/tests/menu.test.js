const request = require("supertest");
const app = require("../server");
const Menu = require("../src/models/menu.model");

let token;
let createdRestaurantId;
let createdMenuId;

beforeAll(async () => {
  const authUrl = process.env.AUTH_SERVICE_URL || "http://auth_service:4000";

  const loginRes = await request(authUrl)
    .post("/auth/login")
    .send({
      email: "admin@example.com",
      contrasena: "admin123"
    });

  token = loginRes.body.token;

  // Crear restaurante necesario para menú
  const restRes = await request(app)
    .post("/restaurants")
    .set("Authorization", `Bearer ${token}`)
    .send({ nombre: "Rest para Menús", direccion: "Calle Test" });

  createdRestaurantId = restRes.body.id_restaurante;
});

describe("Pruebas de /menus", () => {
  it("debería crear un menú", async () => {
    const res = await request(app)
      .post("/menus")
      .set("Authorization", `Bearer ${token}`)
      .send({
        restaurant_id: createdRestaurantId,
        nombre: "Menú del Día",
        descripcion: "Platos frescos"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id_menu");
    createdMenuId = res.body.id_menu;
  });

  it("debería obtener un menú por ID", async () => {
    const res = await request(app)
      .get(`/menus/${createdMenuId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.nombre).toBe("Menú del Día");
  });

  it("debería actualizar un menú", async () => {
    const res = await request(app)
      .put(`/menus/${createdMenuId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Menú Editado", descripcion: "Actualizado" });

    expect(res.statusCode).toBe(201);
    expect(res.body.nombre).toBe("Menú Editado");
  });

  it("debería eliminar un menú", async () => {
    const res = await request(app)
      .delete(`/menus/${createdMenuId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Menú eliminado correctamente");
  });

  it("debería devolver 404 si el menú no existe", async () => {
    const res = await request(app)
      .get("/menus/99999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it("debería manejar error del servidor en getById", async () => {
    const spy = jest.spyOn(Menu, "getById").mockImplementation(() => {
      throw new Error("Error simulado");
    });

    const res = await request(app)
      .get("/menus/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    spy.mockRestore();
  });

  it("debería devolver 404 al intentar actualizar un menú inexistente", async () => {
    const res = await request(app)
      .put("/menus/99999")
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "No existe", descripcion: "Nada" });
  
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Menú no encontrado");
  });
  
  it("debería devolver 404 al intentar eliminar un menú inexistente", async () => {
    const res = await request(app)
      .delete("/menus/99999")
      .set("Authorization", `Bearer ${token}`);
  
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Menú no encontrado");
  });
  
});
