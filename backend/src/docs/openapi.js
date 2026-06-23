import { readFileSync } from "node:fs";

import swaggerUi from "swagger-ui-express";

const openApiDocumentPath = new URL(
  "../../openapi.yaml",
  import.meta.url
);

const swaggerOptions = {
  customSiteTitle: "Weather Information API Documentation",
  swaggerOptions: {
    url: "/api/docs/openapi.yaml",
  },
};

/**
 * Mounts Swagger UI and a raw YAML endpoint backed by the repository's single
 * OpenAPI source file.
 */
export function mountOpenApiDocumentation(app) {
  app.get("/api/docs/openapi.yaml", (req, res, next) => {
    try {
      const openApiDocument = readFileSync(
        openApiDocumentPath,
        "utf8"
      );

      return res
        .type("application/yaml")
        .status(200)
        .send(openApiDocument);
    } catch (error) {
      return next(error);
    }
  });

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(undefined, swaggerOptions)
  );
}
