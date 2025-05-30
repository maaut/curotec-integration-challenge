import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description:
        "API for managing tasks, users, and authentication. " +
        "It supports CRUD operations for tasks, user registration and login, " +
        "and task sharing through invitations.",
      contact: {
        name: "API Support",
        // url: "http://www.example.com/support", // Optional
        // email: "support@example.com", // Optional
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api", // Adjust if your base URL or port is different
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          // Arbitrary name for the security scheme
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // Optional, for documentation purposes
        },
      },
    },
    // security: [
    //     {
    //         bearerAuth: [] // Applies JWT to all operations by default
    //     }
    // ]
  },
  // Path to the API docs
  // Paths to files containing OpenAPI definitions (JSDoc comments)
  apis: ["./src/routes/*.ts", "./src/dtos/*.ts"], // Scan all .ts files in routes and DTOs for JSDoc
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
