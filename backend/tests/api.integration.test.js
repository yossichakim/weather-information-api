import request from "supertest";
import {
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { parse } from "yaml";

import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";

const TEST_PASSWORD = "StrongPassword123";

function bearerToken(token) {
  return `Bearer ${token}`;
}

/**
 * Creates an isolated account and returns the real token issued by the
 * authentication stack so protected-route tests exercise JWT verification.
 */
async function registerAndLogin(email) {
  const registerResponse = await request(app)
    .post("/api/auth/register")
    .send({
      email,
      password: TEST_PASSWORD,
    });

  expect(registerResponse.status).toBe(201);

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password: TEST_PASSWORD,
    });

  expect(loginResponse.status).toBe(200);
  expect(loginResponse.body.data.accessToken).toEqual(
    expect.any(String)
  );

  return {
    user: loginResponse.body.data.user,
    token: loginResponse.body.data.accessToken,
  };
}

/**
 * Creates an owned task through the public API while allowing each scenario
 * to override only the fields relevant to its regression case.
 */
async function createTask(token, taskData = {}) {
  return request(app)
    .post("/api/tasks")
    .set("Authorization", bearerToken(token))
    .send({
      title: "Check weather for London",
      description: "Check current weather conditions",
      city: "London",
      category: "travel",
      ...taskData,
    });
}

// Delete dependent records in ownership order so every test starts without
// users, tasks, or revoked-token state from a previous scenario.
beforeEach(async () => {
  await prisma.revokedToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Weather Information API integration tests", () => {
  it("returns the API health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: "success",
      message: "Weather Information API is running",
    });
  });

  it("serves the Swagger UI and raw OpenAPI 3.1 document", async () => {
    const swaggerResponse = await request(app).get("/api/docs/");

    expect(swaggerResponse.status).toBe(200);
    expect(swaggerResponse.type).toBe("text/html");
    expect(swaggerResponse.text).toContain(
      "Weather Information API Documentation"
    );
    expect(swaggerResponse.text).toContain(
      '<div id="swagger-ui"></div>'
    );

    const openApiResponse = await request(app).get(
      "/api/docs/openapi.yaml"
    );

    expect(openApiResponse.status).toBe(200);
    expect(openApiResponse.type).toBe("application/yaml");

    const openApiDocument = parse(openApiResponse.text);

    expect(openApiDocument.openapi).toBe("3.1.0");
    expect(openApiDocument.paths).toHaveProperty("/api/health");
    expect(openApiDocument.paths).toHaveProperty(
      "/api/auth/register"
    );
    expect(openApiDocument.paths).toHaveProperty(
      "/api/weather/current"
    );
    expect(openApiDocument.paths).toHaveProperty("/api/tasks");
  });

  it("rejects access to protected task routes without a token", async () => {
    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      status: "fail",
      message: "Authentication token is required",
    });
  });

  it("registers, logs in, reads the current user, and logs out", async () => {
    const { user, token } = await registerAndLogin(
      "auth-user@example.com"
    );

    const currentUserResponse = await request(app)
      .get("/api/auth/me")
      .set("Authorization", bearerToken(token));

    expect(currentUserResponse.status).toBe(200);

    expect(currentUserResponse.body.data.user).toMatchObject({
      id: user.id,
      email: "auth-user@example.com",
    });

    const logoutResponse = await request(app)
      .delete("/api/auth/logout")
      .set("Authorization", bearerToken(token));

    expect(logoutResponse.status).toBe(200);

    expect(logoutResponse.body).toEqual({
      status: "success",
      message: "Logged out successfully",
    });

    // Reusing the same signed token verifies server-side revocation rather
    // than only the client's ability to discard local session data.
    const revokedTokenResponse = await request(app)
      .get("/api/auth/me")
      .set("Authorization", bearerToken(token));

    expect(revokedTokenResponse.status).toBe(401);

    expect(revokedTokenResponse.body).toEqual({
      status: "fail",
      message: "Authentication token has been revoked",
    });
  });

  it("creates a task and retrieves it by ID", async () => {
    const { token } = await registerAndLogin(
      "create-user@example.com"
    );

    const createResponse = await createTask(token);

    expect(createResponse.status).toBe(201);

    expect(createResponse.body.data.task).toMatchObject({
      title: "Check weather for London",
      description: "Check current weather conditions",
      city: "London",
      category: "travel",
      status: "PENDING",
    });

    const taskId = createResponse.body.data.task.id;

    expect(taskId).toEqual(expect.any(Number));

    const getResponse = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", bearerToken(token));

    expect(getResponse.status).toBe(200);

    expect(getResponse.body.data.task).toMatchObject({
      id: taskId,
      title: "Check weather for London",
      city: "London",
      category: "travel",
      status: "PENDING",
    });
  });

  it("returns tasks using status and category filters", async () => {
    const { token } = await registerAndLogin(
      "filter-user@example.com"
    );

    const londonTaskResponse = await createTask(token);

    expect(londonTaskResponse.status).toBe(201);

    const parisTaskResponse = await createTask(token, {
      title: "Check weather for Paris",
      description: "Check weather before work",
      city: "Paris",
      category: "daily",
    });

    expect(parisTaskResponse.status).toBe(201);

    const parisTaskId = parisTaskResponse.body.data.task.id;

    const updateResponse = await request(app)
      .patch(`/api/tasks/${parisTaskId}`)
      .set("Authorization", bearerToken(token))
      .send({
        status: "checked",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.task.status).toBe("CHECKED");

    const allTasksResponse = await request(app)
      .get("/api/tasks")
      .set("Authorization", bearerToken(token));

    expect(allTasksResponse.status).toBe(200);
    expect(allTasksResponse.body.results).toBe(2);
    expect(allTasksResponse.body.data.tasks).toHaveLength(2);

    const checkedTasksResponse = await request(app)
      .get("/api/tasks?status=checked")
      .set("Authorization", bearerToken(token));

    expect(checkedTasksResponse.status).toBe(200);
    expect(checkedTasksResponse.body.results).toBe(1);

    expect(checkedTasksResponse.body.data.tasks[0]).toMatchObject({
      id: parisTaskId,
      city: "Paris",
      category: "daily",
      status: "CHECKED",
    });

    const dailyTasksResponse = await request(app)
      .get("/api/tasks?category=daily")
      .set("Authorization", bearerToken(token));

    expect(dailyTasksResponse.status).toBe(200);
    expect(dailyTasksResponse.body.results).toBe(1);

    expect(dailyTasksResponse.body.data.tasks[0]).toMatchObject({
      id: parisTaskId,
      city: "Paris",
      category: "daily",
    });

    const combinedFilterResponse = await request(app)
      .get("/api/tasks?status=checked&category=daily")
      .set("Authorization", bearerToken(token));

    expect(combinedFilterResponse.status).toBe(200);
    expect(combinedFilterResponse.body.results).toBe(1);

    const nonMatchingFilterResponse = await request(app)
      .get("/api/tasks?status=pending&category=daily")
      .set("Authorization", bearerToken(token));

    expect(nonMatchingFilterResponse.status).toBe(200);
    expect(nonMatchingFilterResponse.body.results).toBe(0);
    expect(nonMatchingFilterResponse.body.data.tasks).toEqual([]);
  });

  it("updates and deletes a task", async () => {
    const { token } = await registerAndLogin(
      "update-user@example.com"
    );

    const createResponse = await createTask(token);

    expect(createResponse.status).toBe(201);

    const taskId = createResponse.body.data.task.id;

    const updateResponse = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", bearerToken(token))
      .send({
        title: "Check updated weather for London",
        city: "Manchester",
        category: "daily",
        status: "checked",
      });

    expect(updateResponse.status).toBe(200);

    expect(updateResponse.body.data.task).toMatchObject({
      id: taskId,
      title: "Check updated weather for London",
      city: "Manchester",
      category: "daily",
      status: "CHECKED",
    });

    const deleteResponse = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", bearerToken(token));

    expect(deleteResponse.status).toBe(204);

    const getDeletedTaskResponse = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", bearerToken(token));

    expect(getDeletedTaskResponse.status).toBe(404);

    expect(getDeletedTaskResponse.body).toEqual({
      status: "fail",
      message: "Task not found",
    });
  });

  it("prevents one user from accessing another user's task", async () => {
    const firstUser = await registerAndLogin(
      "first-user@example.com"
    );

    const secondUser = await registerAndLogin(
      "second-user@example.com"
    );

    const createResponse = await createTask(firstUser.token);

    expect(createResponse.status).toBe(201);

    const taskId = createResponse.body.data.task.id;

    const secondUserTasksResponse = await request(app)
      .get("/api/tasks")
      .set(
        "Authorization",
        bearerToken(secondUser.token)
      );

    expect(secondUserTasksResponse.status).toBe(200);
    expect(secondUserTasksResponse.body.results).toBe(0);

    // Read, update, and delete must all apply the authenticated owner
    // predicate; a valid task identifier alone must never grant access.
    const unauthorizedReadResponse = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set(
        "Authorization",
        bearerToken(secondUser.token)
      );

    expect(unauthorizedReadResponse.status).toBe(404);

    const unauthorizedUpdateResponse = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set(
        "Authorization",
        bearerToken(secondUser.token)
      )
      .send({
        status: "checked",
      });

    expect(unauthorizedUpdateResponse.status).toBe(404);

    const unauthorizedDeleteResponse = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set(
        "Authorization",
        bearerToken(secondUser.token)
      );

    expect(unauthorizedDeleteResponse.status).toBe(404);

    const ownerReadResponse = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set(
        "Authorization",
        bearerToken(firstUser.token)
      );

    expect(ownerReadResponse.status).toBe(200);
    expect(ownerReadResponse.body.data.task.id).toBe(taskId);
  });

  it("validates invalid task input", async () => {
    const { token } = await registerAndLogin(
      "validation-user@example.com"
    );

    const missingTitleResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", bearerToken(token))
      .send({
        city: "London",
        category: "travel",
      });

    expect(missingTitleResponse.status).toBe(400);

    expect(missingTitleResponse.body).toEqual({
      status: "fail",
      message: "Title is required",
    });

    const invalidIdResponse = await request(app)
      .get("/api/tasks/abc")
      .set("Authorization", bearerToken(token));

    expect(invalidIdResponse.status).toBe(400);

    expect(invalidIdResponse.body).toEqual({
      status: "fail",
      message: "Task ID must be a positive integer",
    });

    const createResponse = await createTask(token);
    const taskId = createResponse.body.data.task.id;

    const invalidStatusResponse = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", bearerToken(token))
      .send({
        status: "finished",
      });

    expect(invalidStatusResponse.status).toBe(400);

    expect(invalidStatusResponse.body).toEqual({
      status: "fail",
      message: "Status must be pending or checked",
    });
  });
});
