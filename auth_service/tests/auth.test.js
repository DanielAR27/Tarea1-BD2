const request = require("supertest");
const app = require("../auth");
const pool = require("../db");
const jwt = require("jsonwebtoken");

let adminEmail = "admin@example.com";
let userEmail = "testuser@example.com";
let token;

beforeAll(async () => {
  await request(app).post("/auth/register").send({
    nombre: "Admin",
    email: adminEmail,
    contrasena: "admin123",
    rol: "administrador"
  });

  await request(app).post("/auth/register").send({
    nombre: "Usuario Prueba",
    email: userEmail,
    contrasena: "test1234",
    rol: "cliente"
  });

  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: userEmail, contrasena: "test1234" });

  token = loginRes.body.token;
});

describe("Pruebas de autenticación", () => {
  it("debería iniciar sesión y devolver un token", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: userEmail, contrasena: "test1234" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("debería rechazar el login si faltan campos", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect(res.statusCode).toBe(400);
  });

  it("debería rechazar el login con credenciales incorrectas", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: userEmail, contrasena: "incorrecta" });
    expect(res.statusCode).toBe(400);
  });

  it("debería fallar el registro si faltan campos", async () => {
    const res = await request(app).post("/auth/register").send({ email: "x@y.com" });
    expect(res.statusCode).toBe(400);
  });

  it("debería rechazar un rol inválido en el registro", async () => {
    const res = await request(app).post("/auth/register").send({
      nombre: "Fake",
      email: "fake@example.com",
      contrasena: "123",
      rol: "root"
    });
    expect(res.statusCode).toBe(400);
  });

  it("debería rechazar el registro si el email ya está registrado", async () => {
    const res = await request(app).post("/auth/register").send({
      nombre: "Usuario Prueba",
      email: userEmail,
      contrasena: "otra1234",
      rol: "cliente"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "El email ya está registrado.");
  });

  it("debería verificar un token válido", async () => {
    const res = await request(app)
      .get("/auth/verify")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.usuario).toHaveProperty("email", userEmail);
  });

  it("debería rechazar la verificación si no hay token", async () => {
    const res = await request(app).get("/auth/verify");
    expect(res.statusCode).toBe(401);
  });

  it("debería rechazar un token inválido", async () => {
    const res = await request(app)
      .get("/auth/verify")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.statusCode).toBe(401);
  });

  it("debería rechazar login con email inexistente", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "noexiste@example.com", contrasena: "algo" });
    expect(res.statusCode).toBe(400);
  });


});

describe("Pruebas del middleware verificarToken", () => {
  it("debería rechazar /users/me si no hay token", async () => {
    const res = await request(app).get("/users/me");
    expect(res.statusCode).toBe(401);
  });

  it("debería rechazar /users/me si el token es inválido", async () => {
    const res = await request(app)
      .get("/users/me")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.statusCode).toBe(401);
  });

  it("debería acceder a /users/me con token válido", async () => {
    const res = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("email", userEmail);
  });

  it("debería devolver 404 si el usuario del token no existe", async () => {
    const fakeToken = jwt.sign(
      { id_usuario: 999999, nombre: "Fake", email: "x@y.com", rol: "cliente" },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${fakeToken}`);
    expect(res.statusCode).toBe(404);
  });
});

describe("Pruebas de acciones de usuario", () => {

    it("debería registrar exitosamente un nuevo usuario", async () => {
        const email = `nuevo${Date.now()}@example.com`;
    
        const res = await request(app)
          .post("/auth/register")
          .send({
            nombre: "Nuevo Usuario",
            email,
            contrasena: "contrasena123",
            rol: "cliente"
          });
    
        expect(res.statusCode).toBe(201);
        expect(res.body.usuario).toHaveProperty("email", email);
      });
    
      it("debería actualizar exitosamente un usuario existente", async () => {
        const email = `editable${Date.now()}@example.com`;
    
        const reg = await request(app)
          .post("/auth/register")
          .send({
            nombre: "Para Editar",
            email,
            contrasena: "editame123",
            rol: "cliente"
          });
    
        const userId = reg.body.usuario.id_usuario;
    
        const loginAdmin = await request(app).post("/auth/login").send({
          email: adminEmail,
          contrasena: "admin123"
        });
    
        const adminToken = loginAdmin.body.token;
    
        const res = await request(app)
          .put(`/users/${userId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            nombre: "Usuario Editado",
            email,
            rol: "cliente"
          });
    
        expect(res.statusCode).toBe(200);
        expect(res.body.usuario).toHaveProperty("nombre", "Usuario Editado");
      });

  it("debería rechazar la actualización si faltan campos", async () => {
    const res = await request(app)
      .put("/users/999999")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it("debería rechazar un rol inválido al actualizar", async () => {
    const res = await request(app)
      .put("/users/999999")
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Test", email: "a@a.com", rol: "admin" });
    expect(res.statusCode).toBe(400);
  });

  it("debería devolver 404 si el usuario a actualizar no existe", async () => {
    const res = await request(app)
      .put("/users/999999")
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Test", email: "a@a.com", rol: "cliente" });
    expect(res.statusCode).toBe(404);
  });

  it("debería rechazar la eliminación si no es administrador", async () => {
    const res = await request(app)
      .delete("/users/999999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });

  it("debería devolver 404 al eliminar un usuario que no existe (siendo admin)", async () => {
    const loginAdmin = await request(app).post("/auth/login").send({
      email: adminEmail,
      contrasena: "admin123"
    });

    const adminToken = loginAdmin.body.token;

    const res = await request(app)
      .delete("/users/999999")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it("debería manejar error interno al eliminar (simulado)", async () => {
    const loginAdmin = await request(app).post("/auth/login").send({
      email: adminEmail,
      contrasena: "admin123"
    });

    const adminToken = loginAdmin.body.token;

    const spy = jest.spyOn(pool, "query").mockImplementationOnce(() => {
      throw new Error("Error simulado");
    });

    const res = await request(app)
      .delete("/users/999999")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(500);
    spy.mockRestore();
  });
});

afterAll(async () => {
  await pool.end();
});
