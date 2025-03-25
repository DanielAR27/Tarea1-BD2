
const request = require("supertest");
const app = require("../server");
const Reservation = require("../src/models/reservation.model");

let token;
let createdRestaurantId;
let createdReservationId;

beforeAll(async () => {
  const authUrl = process.env.AUTH_SERVICE_URL || "http://auth_service:4000";

  const loginRes = await request(authUrl)
    .post("/auth/login")
    .send({ email: "admin@example.com", contrasena: "admin123" });

  token = loginRes.body.token;

  const restRes = await request(app)
    .post("/restaurants")
    .set("Authorization", `Bearer ${token}`)
    .send({ nombre: "Rest Test", direccion: "Calle 1" });

  createdRestaurantId = restRes.body.id_restaurante;
});

describe("📅 Pruebas de /reservations", () => {
  it("debería crear una reservación", async () => {
    const res = await request(app)
      .post("/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id_restaurante: createdRestaurantId,
        fecha_hora: "2025-04-01T18:00:00Z",
        estado: "pendiente"
      });

    console.log("Nuevo print");
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id_reserva");
    createdReservationId = res.body.id_reserva;
  });

  it("debería obtener todas las reservaciones", async () => {
    const res = await request(app)
      .get("/reservations")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("debería obtener una reservación por ID", async () => {
    const res = await request(app)
      .get(`/reservations/${createdReservationId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id_reserva");
  });

  it("debería actualizar una reservación", async () => {
    const res = await request(app)
      .put(`/reservations/${createdReservationId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ fecha_hora: "2025-04-02T20:00:00Z", estado: "confirmada" });

    expect(res.statusCode).toBe(201);
    expect(res.body.estado).toBe("confirmada");
  });

  it("debería devolver 404 si la reservación no existe", async () => {
    const res = await request(app)
      .put("/reservations/99999") // Un ID muy alto que probablemente no exista
      .set("Authorization", `Bearer ${token}`)
      .send({ fecha_hora: "2025-04-02T20:00:00Z", estado: "confirmada" });
  
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Reservación no encontrada");
  });
  
  it("debería eliminar una reservación", async () => {
    const res = await request(app)
      .delete(`/reservations/${createdReservationId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Reservación eliminada correctamente");
  });

  it("debería fallar si no se envía id_usuario", async () => {
    const res = await request(app)
      .post("/reservations")
      .send({ id_restaurante: 1, fecha_hora: "2025-04-01", estado: "pendiente" });

    expect(res.statusCode).toBe(400);
  });

  it("debería devolver 404 si no encuentra reservación", async () => {
    const res = await request(app)
      .get("/reservations/99999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it("debería manejar error de servidor en getAll", async () => {
    const spy = jest.spyOn(Reservation, "getAll").mockImplementation(() => {
      throw new Error("Error forzado");
    });

    const res = await request(app)
      .get("/reservations")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    spy.mockRestore();
  });

  it("debería manejar error de servidor en getById", async () => {
    const spy = jest.spyOn(Reservation, "getById").mockImplementation(() => {
      throw new Error("Error forzado");
    });

    const res = await request(app)
      .get("/reservations/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    spy.mockRestore();
  });

  it("debería manejar errores del servidor (500) al crear una reservación", async () => {
    const spy = jest.spyOn(Reservation, "create").mockImplementation(() => {
      throw new Error("Error simulado en creación");
    });
  
    const res = await request(app)
      .post("/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id_restaurante: createdRestaurantId,
        fecha_hora: "2025-04-01T18:00:00Z",
        estado: "pendiente"
      });
  
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error", "Error simulado en creación");
  
    spy.mockRestore(); // Restaurar función original
  });
  
});
