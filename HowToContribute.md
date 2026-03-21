# How to Contribute to AREA

This document provides definitive instructions for contributing to the AREA project. Adhere strictly to these protocols to guarantee fluid integration and rapid CI/CD deployment.

## Branching Strategy

- `main` – The production-ready code. Commits made here instantly trigger Railway CI builds. Direct commits are restricted unless explicitly performing infrastructure hotfixes!
- `dev` – Active development branch. All Pull Requests must target this branch first.
- `feature/<feature-name>` – Ephemeral branches for constructing new services, actions, or reactions.

## Commit Guidelines

Use clear, deterministic commit messages. Prefix your commits based on their type, so Automated Changelogs can parse them accurately:

- **feat:** – A new platform feature (e.g. adding the Spotify service)
- **fix:** – A bug fix or memory leak resolution
- **docs:** – Updates to architectural documentation or README
- **style:** – Code formatting or whitespace optimization
- **test:** – Adding or patching JUnit system tests
- **chore:** – Infrastructure, Nixpacks updates, or dependency management

### Formatting Example:
`[fix]: repair the SMTP mail routing port bounds to avoid silent STARTTLS timeouts`

## 🧩 Adding a New Service (Action / Reaction)

The AREA platform is designed to be highly modular. If you are developing a new integration (e.g., Spotify, Discord, Weather), you must implement it across both the Backend API and the frontend UI.

### 1. Backend Integration (`API/area/`)

When creating a new service, you need to establish its foundation, configure authentication, and wire up its specific components:

1. **Environment & OAuth:** 
   - Add your newly generated API Client ID and Secret to the `.env` file.
   - Register the OAuth2 provider (if required) inside `application.properties` under `spring.security.oauth2.client.registration`.
   - Update `CustomOAuth2SuccessHandler.java` if the service issues user-specific Access Tokens that need persistence.

2. **Core Service Logic (`src/main/java/.../service/`):**
   - Create a execution service (e.g., `SpotifyService.java`) that handles outgoing REST API calls (Reactions).
   - *If your service has triggers (Actions):* Create a polling service (e.g., `SpotifyPollingService.java`) equipped with `@Scheduled` methods to check for new events (like a song changing), or set up a Webhook controller.

3. **Exposing the Service:**
   - Add the service metadata (name, description, available Actions, available Reactions) to the components that generate the `/about.json` specification.
   - Update database seed scripts if your app dynamically loads Actions/Reactions from an SQL table on startup.

### 2. Frontend Integration (`UI/area/`)

To make the service accessible to users:

1. **OAuth Linking Button:** 
   - In your settings or dashboard page, add a button that redirects to the Spring Boot OAuth endpoint: `http://localhost:8080/oauth2/authorization/<service-name>`.

2. **Trigger / Reaction UI Forms:** 
   - Add the new service's specific input fields (e.g., "Enter a Playlist ID") in the workflow creation wizard.
   - Make sure your UI maps the user's input directly to the exact string name of the Action/Reaction defined in the backend `about.json`.
