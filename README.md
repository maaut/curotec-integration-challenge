# Curotec Integration Challenge

This project contains a Node.js API backend and a React frontend.

## Project Structure

```
/
├── api/            # Node.js, Express, Prisma, TypeScript API
├── frontend/       # React, TypeScript (Vite) Frontend
├── .env            # Root environment variables for Docker Compose
└── docker-compose.yml
```

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
    PORT=3000 # Optional: API server port, defaults to 3000 if not set
    CORS_ORIGIN="http://localhost:5173" # Optional: Frontend URL for CORS, defaults to * if not set

    # JWT Configuration
    # -----------------
    # This secret is used to sign and verify JSON Web Tokens (JWTs) for user authentication.
    # It MUST be a long, random, and strong string to ensure the security of your application.
    #
    # How to generate a strong secret:
    # You can use a password generator or a command-line tool like OpenSSL:
    # openssl rand -base64 32
    #
    # Example (REPLACE THIS WITH YOUR OWN GENERATED SECRET):
    JWT_SECRET="your_very_strong_and_random_jwt_secret_string_here_dont_use_this_example_value"
    ```

    **Important notes for `api/.env`:**

    - Ensure this `.env` file (i.e., `api/.env`) is listed in your `api/.gitignore` file.
    - The `DATABASE_URL` should use the same credentials (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) as defined in the root `/.env` if you are using the provided Docker Compose setup for PostgreSQL. The `localhost:5432` part refers to the port exposed by the Docker container to your host machine.
    - `JWT_SECRET` is critical for security. Keep it secret and make it strong.

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

## Frontend Setup (React with TypeScript using Vite)

The frontend application is located in the `frontend` directory.

### Prerequisites

- Node.js (v16 or higher recommended)
- npm

### Getting Started

1.  **Navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will usually start the frontend on `http://localhost:5173` (Vite's default) or another port if 5173 is busy. Check your terminal for the exact URL.

### Available Scripts (in `frontend` directory)

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the application for production.
- `npm run lint`: Lints the codebase (if ESLint is configured).
- `npm run preview`: Serves the production build locally for preview.
