const request = require("supertest");
const app = require("../server");
const Product = require("../src/models/product.model");

let token;
let createdRestaurantId;
let createdMenuId;
let createdProductId;

beforeAll(async () => {
  const authUrl = process.env.AUTH_SERVICE_URL || "http://auth_service:4000";

  const loginRes = await request(authUrl)
    .post("/auth/login")
    .send({ email: "admin@example.com", contrasena: "admin123" });

  token = loginRes.body.token;

  const restaurantRes = await request(app)
    .post("/restaurants")
    .set("Authorization", `Bearer ${token}`)
    .send({ nombre: "Rest para Productos", direccion: "Dirección X" });

  createdRestaurantId = restaurantRes.body.id_restaurante;

  const menuRes = await request(app)
    .post("/menus")
    .set("Authorization", `Bearer ${token}`)
    .send({
      restaurant_id: createdRestaurantId,
      nombre: "Menú Producto",
      descripcion: "Menú de prueba"
    });

  createdMenuId = menuRes.body.id_menu;
});

describe("🛒 Pruebas de /products", () => {
  it("debería crear un producto", async () => {
    const res = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id_menu: createdMenuId,
        nombre: "Producto Prueba",
        precio: 9.99,
        descripcion: "Producto de prueba"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id_producto");
    createdProductId = res.body.id_producto;
  });

  it("debería obtener todos los productos", async () => {
    const res = await request(app)
      .get("/products")
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("debería obtener un producto por ID", async () => {
    const res = await request(app)
      .get(`/products/${createdProductId}`)
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id_producto", createdProductId);
  });

  it("debería actualizar el producto", async () => {
    const res = await request(app)
      .put(`/products/${createdProductId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Producto Editado", precio: 15.5, descripcion: "Editado" });

    expect(res.statusCode).toBe(201);
    expect(res.body.nombre).toBe("Producto Editado");
  });

  it("debería eliminar el producto", async () => {
    const res = await request(app)
      .delete(`/products/${createdProductId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Producto eliminado correctamente");
  });

  it("debería devolver 404 si el producto no existe", async () => {
    const res = await request(app)
      .get("/products/99999")
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBe(404);
  });

  it("debería manejar error del servidor (500) en getAll", async () => {
    const spy = jest.spyOn(Product, "getAll").mockImplementation(() => {
      throw new Error("Error simulado en getAll");
    });

    const res = await request(app)
      .get("/products")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    spy.mockRestore();
  });

  it("debería manejar error del servidor (500) en getProductById", async () => {
    const spy = jest.spyOn(Product, "getById").mockImplementation(() => {
      throw new Error("Error simulado en getById");
    });

    const res = await request(app)
      .get(`/products/${createdProductId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error", "Error simulado en getById");

    spy.mockRestore();
  });

  it("debería devolver 404 si el producto no existe al actualizar", async () => {
    const res = await request(app)
      .put("/products/999999")
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Nuevo", precio: 15.0, descripcion: "desc" });
  
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Producto no encontrado");
  });

  it("debería devolver 404 si se intenta eliminar un producto que no existe", async () => {
    const res = await request(app)
      .delete(`/products/999999`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Producto no encontrado");
  });

});
