# Curotec Integration Challenge

This project is a basic Node.js application with TypeScript, Express, Prisma, and PostgreSQL.

## API Setup

The API is located in the `api` directory.

### Prerequisites

- Node.js (v16 or higher recommended)
- npm
- Docker and Docker Compose (for PostgreSQL)
- PostgreSQL (if not using Docker)

### Getting Started

1.  **Set up root environment variables for Docker Compose:**
    Create a `.env` file in the root of the project (alongside `docker-compose.yml`). This file will store sensitive credentials for Docker Compose services.

    Example `/.env`:

    ```env
    # Root .env file for Docker Compose
    POSTGRES_USER=myuser
    POSTGRES_PASSWORD=mypassword
    POSTGRES_DB=mydatabase
    ```

2.  **Start the PostgreSQL database (using Docker Compose):**
    From the root of the project, run:

    ```bash
    docker-compose up -d
    ```

    This will start a PostgreSQL container. Docker Compose automatically loads variables from the root `.env` file.
    The credentials in your `api/.env` should match those in the root `.env` file.

3.  **Navigate to the API directory:**

    ```bash
    cd api
    ```

4.  **Install dependencies:**

    ```bash
    npm install
    ```

5.  **Set up API environment variables:**
    The API has its own environment variables, primarily for Prisma and runtime configurations like CORS or the API port.
    Prisma requires a `DATABASE_URL` in `api/prisma/.env`. This URL must point to your database, which in the Docker setup, uses the credentials from the root `.env` file.

    Example `api/.env` (ensure it matches root `.env` values for Docker):

    ```env
    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"
    PORT=3000
    CORS_ORIGIN=http://your-frontend-domain.com
    ```

### Available Scripts

In the `api` directory, you can run the following scripts:

- `npm run dev`: Starts the development server with `nodemon`.
- `npm run build`: Compiles TypeScript to JavaScript.
- `npm start`: Starts the production server.
- `npm test`: (Placeholder)

**Prisma Scripts:**

- `npm run prisma:migrate:dev`: Create and apply new migrations (development).
- `npm run prisma:migrate:deploy`: Apply pending migrations (production).
- `npm run prisma:generate`: Generate Prisma Client.
- `npm run prisma:studio`: Open Prisma Studio (GUI for database).
- `npm run prisma:db:pull`: Introspect existing database to `schema.prisma`.
- `npm run prisma:db:push`: Push `schema.prisma` state to DB (prototyping, no migrations).
- `npm run prisma:db:seed`: Run seed scripts.
