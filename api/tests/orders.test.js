const request = require("supertest");
const app = require("../server");
const Order = require("../src/models/orders.model");

let token;
let restaurantId;
let menuId;
let productId;
let orderId;

beforeAll(async () => {
  const authUrl = process.env.AUTH_SERVICE_URL || "http://auth_service:4000";

  const loginRes = await request(authUrl)
    .post("/auth/login")
    .send({ email: "admin@example.com", contrasena: "admin123" });

  token = loginRes.body.token;

  const restaurantRes = await request(app)
    .post("/restaurants")
    .set("Authorization", `Bearer ${token}`)
    .send({ nombre: "Rest para Órdenes", direccion: "Ubicación Z" });

  restaurantId = restaurantRes.body.id_restaurante;

  const menuRes = await request(app)
    .post("/menus")
    .set("Authorization", `Bearer ${token}`)
    .send({ restaurant_id: restaurantId, nombre: "Menú Test", descripcion: "Menú de prueba" });

  menuId = menuRes.body.id_menu;

  const productRes = await request(app)
    .post("/products")
    .set("Authorization", `Bearer ${token}`)
    .send({
      id_menu: menuId,
      nombre: "Producto de Orden",
      precio: 12.99,
      descripcion: "Producto para prueba de orden"
    });

  productId = productRes.body.id_producto;
});

describe("📦 Pruebas de /orders", () => {
  it("debería crear una orden exitosamente", async () => {
    const res = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id_restaurante: restaurantId,
        tipo: "en restaurante",
        productos: [
          { id_producto: productId, cantidad: 2 }
        ]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("pedido_id");
    orderId = res.body.pedido_id;
  });

  it("debería obtener la orden por ID", async () => {
    const res = await request(app)
      .get(`/orders/${orderId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("pedido");
    expect(res.body.pedido).toHaveProperty("id_pedido", orderId);
    expect(Array.isArray(res.body.productos)).toBe(true);
  });

  it("debería devolver 404 si la orden no existe", async () => {
    const res = await request(app)
      .get("/orders/999999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Pedido no encontrado");
  });

  it("debería devolver 400 si faltan datos en el cuerpo", async () => {
    const res = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        tipo: "en restaurante",
        productos: [{ id_producto: productId, cantidad: 1 }]
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("debería devolver 400 si el tipo de orden es inválido", async () => {
    const res = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id_restaurante: restaurantId,
        tipo: "delivery",
        productos: [{ id_producto: productId, cantidad: 1 }]
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Tipo de pedido inválido.");
  });

  it("debería devolver 400 si la lista de productos está vacía", async () => {
    const res = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id_restaurante: restaurantId,
        tipo: "en restaurante",
        productos: []
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Datos incompletos para realizar el pedido.");
  });

  it("debería devolver 401 si el usuario no está autenticado", async () => {
    const res = await request(app)
      .post("/orders")
      .send({
        id_restaurante: restaurantId,
        tipo: "en restaurante",
        productos: [{ id_producto: productId, cantidad: 1 }]
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Usuario no autenticado.");
  });

  it("debería manejar error 500 en getOrderById", async () => {
    const spy = jest.spyOn(Order, "getOrderById").mockImplementation(() => {
      throw new Error("Error simulado en getOrderById");
    });

    const res = await request(app)
      .get(`/orders/${orderId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error", "Error en el servidor");

    spy.mockRestore();
  });

  it("debería manejar error 500 al crear una orden", async () => {
    const spy = jest.spyOn(Order, "createOrder").mockImplementation(() => {
      throw new Error("Error simulado en createOrder");
    });

    const res = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id_restaurante: restaurantId,
        tipo: "en restaurante",
        productos: [{ id_producto: productId, cantidad: 1 }]
      });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error", "Error en el servidor");

    spy.mockRestore();
  });
});
