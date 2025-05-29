# Curotec Integration Challenge

This project is a basic Node.js application with TypeScript, Express, Prisma, and PostgreSQL.

## API Setup

The API is located in the `api` directory.

### Prerequisites

- Node.js (v16 or higher recommended)
- npm
- PostgreSQL

### Getting Started

1.  **Navigate to the API directory:**

    ```bash
    cd api
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Prisma requires a `.env` file in the `api/prisma` directory with your database connection string. Create this file and add your `DATABASE_URL`:

    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    ```

    Replace `USER`, `PASSWORD`, `HOST`, `PORT`, and `DATABASE` with your PostgreSQL credentials.

4.  **Initialize the database (if you have an existing schema):**

    ```bash
    npx prisma db pull
    ```

5.  **Generate Prisma Client:**
    ```bash
    npx prisma generate
    ```

### Available Scripts

In the `api` directory, you can run the following scripts:

- `npm run dev`
  Starts the development server using `nodemon`. The server will automatically restart when code changes are detected.

- `npm run build`
  Compiles the TypeScript code to JavaScript in the `dist` directory.

- `npm start`
  Starts the production server from the compiled code in the `dist` directory.

- `npm test`
  (Currently a placeholder - echo "Error: no test specified" && exit 1)

### Project Structure (api directory)

```
api/
├── prisma/
│   ├── schema.prisma  # Prisma schema file
│   └── .env           # Environment variables (DATABASE_URL)
├── src/
│   └── index.ts     # Main application entry point
├── .env               # General environment variables (e.g., PORT)
├── package.json
├── package-lock.json
└── tsconfig.json
```
