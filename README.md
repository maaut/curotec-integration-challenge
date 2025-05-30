# Curotec Integration Challenge

This project contains a Node.js API backend and a React frontend for a full-stack task management application with real-time collaboration features.

## Features

### Backend (API)

- **User Authentication**: JWT-based registration and login
- **Task Management**: CRUD operations for tasks with user ownership
- **Task Collaboration**: Invite users to collaborate on tasks
- **Real-time Notifications**: WebSocket-based notifications for task invitations
- **API Documentation**: OpenAPI/Swagger documentation at `/api-docs`
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Jest test suite with coverage reporting

### Frontend

- **Modern React**: Built with React 18, TypeScript, and Vite
- **UI Components**: Ant Design (antd) component library
- **Authentication**: Login/register forms with JWT token management
- **Task Management**:
  - Create, edit, and delete tasks
  - Mark tasks as complete/incomplete
  - Pagination, filtering, and sorting
- **Real-time Collaboration**:
  - Invite users to tasks via email
  - Real-time notifications when invited to tasks
  - Separate views for owned and invited tasks
- **Responsive Design**: Works on desktop and mobile devices
- **Theme Support**: Light and dark mode toggle

## Project Structure

```
/
├── api/            # Node.js, Express, Prisma, TypeScript API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic (including WebSocket)
│   │   ├── routes/         # API routes with OpenAPI docs
│   │   ├── middlewares/    # Auth, validation, and logging
│   │   ├── dtos/          # Data transfer objects
│   │   └── config/        # App configuration
│   ├── prisma/            # Database schema and migrations
│   └── tests/             # Jest test files
├── frontend/       # React, TypeScript (Vite) Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API calls and WebSocket service
│   │   ├── providers/     # Context providers
│   │   └── types/         # TypeScript type definitions
├── .env            # Root environment variables for Docker Compose
└── docker-compose.yml
```

## Getting Started (Simplified with Root Commands)

This project includes a root `package.json` to simplify common tasks like installing dependencies and running development servers for both the API and frontend concurrently.

1.  **Set up root environment variables for Docker Compose:**
    (This step remains the same - create a `/.env` file as described in the original "API Setup" section if you haven't already.)

    Example `/.env`:

    ```env
    # Root .env file for Docker Compose
    POSTGRES_USER=myuser
    POSTGRES_PASSWORD=mypassword
    POSTGRES_DB=mydatabase
    ```

2.  **Start the PostgreSQL database (using Docker Compose):**
    From the root of the project, you can use the new script:

    ```bash
    npm run docker:db
    ```

    Alternatively, run `docker-compose up -d` as before.

3.  **Install all dependencies:**
    From the root of the project, run:

    ```bash
    npm install       # Installs root dependencies (like concurrently)
    npm run install:all # Installs dependencies for api/ and frontend/
    ```

4.  **Set up API environment variables (`api/.env`):**
    (See detailed instructions under [API Setup > Getting Started > Set up API environment variables](#set-up-api-environment-variables))

5.  **Set up Frontend Environment Variables (`frontend/.env` - Optional):**
    (See detailed instructions under [Frontend Setup > Getting Started > Set up Frontend Environment Variables](#set-up-frontend-environment-variables-optional-but-recommended))

6.  **Set up Prisma (First-time setup):**
    Before running the application for the first time, you need to set up the database schema and generate the Prisma client.
    (See detailed instructions under [First-Time Prisma Setup](#first-time-prisma-setup))

7.  **Run the entire stack (API + Frontend):**
    From the root of the project, run:
    ```bash
    npm run start:dev
    ```
    This command will start the API (typically on `http://localhost:3000`) and the frontend (typically on `http://localhost:5173`) concurrently. Check your terminal for the exact URLs.

## API Documentation

Once the API is running, you can access the interactive OpenAPI documentation at:

- **Swagger UI**: `http://localhost:3000/api-docs`

The documentation includes detailed information about all available endpoints, request/response schemas, and authentication requirements.

## Real-time Features

The application includes WebSocket-based real-time notifications:

- **Task Invitations**: When a user is invited to collaborate on a task, they receive an instant notification
- **Task Updates**: Users are notified when they're removed from task collaborations
- **Automatic UI Updates**: The task list automatically refreshes when receiving notifications

The WebSocket server runs on the same port as the API and requires JWT authentication.

---

_The individual setup instructions for API and Frontend below are still valid if you prefer to manage them separately, but the `npm run start:dev` command from the root is recommended for ease of use during development._

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

### First-Time Prisma Setup

Before running the API for the first time, or after pulling down changes that include new database models or modifications to existing ones, you need to ensure your local database schema is synchronized with the Prisma schema and that the Prisma Client is generated.

1.  **Generate Prisma Client:**
    Prisma Client is a type-safe database client that you use to interact with your database. It's generated based on your `schema.prisma` file.
    Run this from the `api` directory:

    ```bash
    npm run prisma:generate
    ```

2.  **Run Database Migrations (Development):
    **Prisma Migrate creates and applies SQL migration files based on changes to your `schema.prisma` file. For development, `migrate dev` will also create the database if it doesn't exist and apply pending migrations.
    Run this from the `api` directory:
    ```bash
    npm run prisma:migrate:dev
    ```
    You might be prompted to name your first migration (e.g., "initial_setup").

**Combined Setup Script:**
To simplify the above two steps for a first-time setup or after schema changes, you can use the `prisma:setup` script. This script combines both `prisma:generate` and `prisma:migrate:dev`.

Run from the `api` directory:

```bash
npm run prisma:setup
```

Or from the project root:

```bash
npm run prisma:setup --prefix api
```

### Available Scripts

In the `api` directory, you can run the following scripts:

- `npm run dev`: Starts the development server with `nodemon`.
- `npm run build`: Compiles TypeScript to JavaScript.
- `npm start`: Starts the production server.
- `npm test`: Runs the Jest test suite.
- `npm run test:watch`: Runs Jest in watch mode.
- `npm run test:coverage`: Runs Jest and generates a coverage report.

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

3.  **Set up Frontend Environment Variables (Optional but Recommended):**
    Create a `.env` file in the `frontend` directory (i.e., `frontend/.env`). This file is used by Vite to load environment variables.

    Example `frontend/.env`:

    ```env
    # Frontend .env file
    VITE_API_URL=http://localhost:3000/api
    ```

    - If this file is not present, the application will default to `http://localhost:3000/api` for the API URL.
    - Ensure `frontend/.env` is added to your `frontend/.gitignore` file if it contains sensitive information (though `VITE_API_URL` is generally not sensitive).

4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will usually start the frontend on `http://localhost:5173` (Vite's default) or another port if 5173 is busy. Check your terminal for the exact URL.

### Available Scripts (in `frontend` directory)

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the application for production.
- `npm run lint`: Lints the codebase (if ESLint is configured).
- `npm run preview`: Serves the production build locally for preview.

## Running the Full Stack

_This section is superseded by the "Getting Started (Simplified with Root Commands)" section above if you use the root `npm run start:dev` command._

To run the application, you need to have both the backend API and the frontend development server running concurrently.

1.  **Start the API:**

    - Ensure your PostgreSQL database is running (e.g., via `docker-compose up -d` from the root directory).
    - Navigate to the `api` directory: `cd api`
    - Start the API development server: `npm run dev` (typically on `http://localhost:3000`)

2.  **Start the Frontend:**
    - Navigate to the `frontend` directory: `cd frontend`
    - Start the frontend development server: `npm run dev` (typically on `http://localhost:5173`)

Once both are running, you can access the application via the frontend URL (e.g., `http://localhost:5173`).

## Testing

### Backend Testing

The API includes a comprehensive Jest test suite:

```bash
cd api
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

### Frontend Testing

Frontend testing capabilities are available through Vite:

```bash
cd frontend
npm run lint            # Run ESLint for code quality
```

## Usage Guide

### Getting Started

1. **Register a new account** or **login** with existing credentials
2. **Create tasks** using the "Add Task" button
3. **Manage tasks** with edit, delete, and completion toggle features
4. **Invite collaborators** by clicking the invite button on any task you own
5. **Receive real-time notifications** when invited to collaborate on tasks, or when you're removed from a task

### Task Collaboration

- **Owned Tasks**: Tasks you created will have a "Owner" tag in the task list
- **Invited Tasks**: Tasks you're invited to collaborate on will have a "Invitee" tag in the task list
- **Real-time Updates**: When someone invites you to a task, you'll see an instant notification and the task list will refresh automatically

## Troubleshooting

### Common Issues

**Database Connection Issues:**

- Ensure PostgreSQL is running: `docker-compose up -d`
- Check that your `api/.env` credentials match the root `/.env` file
- Verify the `DATABASE_URL` format in `api/.env`

**WebSocket Connection Errors:**

- Ensure the backend server is running on the correct port (default: 3000)
- Check browser console for specific WebSocket error messages
- Verify JWT token is valid (try logging out and back in)

**Frontend Build Issues:**

- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check for TypeScript errors: `npm run build`

**Port Conflicts:**

- API default port: 3000 (configurable via `PORT` in `api/.env`)
- Frontend default port: 5173 (Vite will use next available port)
- Database default port: 5432 (Docker container)

### Environment Variables Checklist

**Root `.env**:

```env
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydatabase
```

**API `.env**:

```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydatabase?schema=public"
JWT_SECRET="your_very_strong_and_random_jwt_secret"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

\*\*Frontend `.env` (optional):

```env
VITE_API_URL=http://localhost:3000/api
```

## Technology Stack

### Backend

- **Node.js** with **TypeScript**
- **Express.js** web framework
- **Prisma** ORM with PostgreSQL
- **Socket.IO** for WebSocket communication
- **JWT** for authentication
- **Zod** for validation
- **Jest** for testing
- **Swagger/OpenAPI** for documentation

### Frontend

- **React 18** with **TypeScript**
- **Vite** for build tooling
- **Ant Design** (antd) UI components
- **Socket.IO Client** for real-time features
- **Axios** for HTTP requests
- **React Router** for navigation

### Development Tools

- **Docker Compose** for database
- **ESLint** for code quality
- **Concurrently** for running multiple processes
- **Nodemon** for development server

## License

This project is part of the Curotec Integration Challenge.
