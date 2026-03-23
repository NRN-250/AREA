# Contributing to AREA

This guide outlines the process for contributing to the **AREA** project.

## Branching Strategy

-   `main` – Production-ready code. Direct commits are restricted.
-   `dev` – Active development branch. All Pull Requests must target this branch first.
-   `feature/<feature-name>` – Branches for new services, actions, or reactions.

## Commit Guidelines

Use deterministic commit messages with the following tags:
-   `feat:` – A new platform feature.
-   `fix:` – A bug fix.
-   `docs:` – Documentation updates.
-   `style:` – Code formatting.
-   `test:` – Adding or patching tests.
-   `chore:` – Infrastructure or dependency updates.

## 🧩 Adding a New Service

### 1. Backend Integration (`API/area/`)

When creating a new service (e.g., `SpotifyService.java`):
1.  **OAuth Registration:** Add API Client ID and Secret to your `.env` and `application.properties`.
2.  **Core Logic:** Implement the execution service in the `service/` package.
3.  **Polling (Actions):** Create a polling service with `@Scheduled` methods if the service requires periodic triggers.
4.  **Expose:** Add the service metadata to the `AboutController.java` to update the `/about.json` specification.

### 2. Frontend Integration (`UI/area/`)

1.  **Auth Button:** Add an OAuth linking button in the user settings or dashboard.
2.  **Form Components:** create input fields for the specific Action/Reaction configuration in the workflow wizard.
3.  **Mapping:** Ensure the UI labels match the Action/Reaction names defined in the backend.

## Deployment

The project uses **Railway** for CI/CD. Pushing to the `main` branch automatically triggers a build via `nixpacks.toml`.
