# Local Development Setup

Follow these steps to get the **AREA** platform running on your local machine.

> [!IMPORTANT]
> **Security & Ownership:** This setup guide requires you to provide your own OAuth credentials and API keys. These keys are **private** and unique to your specific development environment. **Never share these credentials** or commit them to source control. Providing your own keys is what allows you to link the software to your personal or organization's service registrations (Google Cloud, GitHub OAuth Apps, etc.).

## Prerequisites

- **Java 21 JDK** (OpenJDK recommended)
- **Node.js v20+**
- **Apache Maven** (or use the provided `./mvnw` wrapper)
- **Git**

## Backend Setup (Spring Boot)

1.  Navigate to the backend directory:
    ```bash
    cd API/area
    ```
2.  Configure environment variables. Create a `.env` file or set them in your environment:
    - `GOOGLE_CLIENT_ID`: Google OAuth Client ID
    - `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret
    - `GITHUB_CLIENT_ID`: GitHub OAuth Client ID
    - `GITHUB_CLIENT_SECRET`: GitHub OAuth Client Secret
    - `BREVO_API_KEY`: API Key for mail sending (Brevo)

3.  Run the application using Maven:
    ```bash
    ./mvnw spring-boot:run
    ```
    The API will be available at `http://localhost:8080`.

## Frontend Setup (React)

1.  Navigate to the frontend directory:
    ```bash
    cd UI/area
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The web interface will be available at `http://localhost:5173`.

## Database

By default, the application uses an **H2 file-based database**.
- The database file is stored in `/data/area_db` (or as configured in `application.properties`).
- You can access the H2 console at `http://localhost:8080/h2-console` during development.
- **JDBC URL:** `jdbc:h2:file:/data/area_db`
- **Username:** `sa`
- **Password:** (leave empty)

## Troubleshooting

- **OAuth Redirects:** Ensure your OAuth provider redirect URIs match your local development port (usually `http://localhost:8080/login/oauth2/code/<provider>`).
- **Nixpacks:** If deploying to Railway, the `nixpacks.toml` and `railway.toml` files handle the production build automatically.
