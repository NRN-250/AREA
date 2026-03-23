# Architecture Overview

## The Action-Reaction (AREA) Model

**AREA** is a service-automation platform inspired by IFTTT/Zapier. It operates on a simple but powerful trigger-response mechanism:

1.  **Action (Trigger):** An event detected in an external or internal service (e.g., a new GitHub commit, a specific time reached).
2.  **Reaction (Response):** An automated execution in another service (e.g., sending an email, creating a GitHub issue).

## System Architecture

The project follows a modern web application structure:

### Backend (Spring Boot)
- **Language:** Java 21
- **Framework:** Spring Boot 3.4
- **Database:** H2 (File-based for local development)
- **Security:** OAuth2 for external service integration + JWT for application-level authentication.
- **Service Layer:** 
    - **Polling Services:** Background tasks (using `@Scheduled`) that periodically check external APIs for new events (Actions).
    - **Execution Services:** Modular classes that handle the logic for performing Reactions.

### Frontend (React)
- **Framework:** React 19 + Vite
- **State Management:** React Context API (e.g., `ThemeContext`)
- **API Communication:** Axios with interceptors for JWT handling.
- **Styling:** Tailwind CSS

## Data Flow

1.  The user configures an **Area** (Action + Reaction) via the React UI.
2.  The UI sends a request to the `/areas` API endpoint.
3.  The Backend saves the configuration to the H2 database.
4.  Relevant **Polling Services** monitor for the configured Action.
5.  When an Action is detected, the Backend triggers the corresponding **Reaction**.

## Modular Design
Adding a new service involves:
1.  Defining the Service metadata in `AboutController.java`.
2.  Implementing the Logic in the `service/` package.
3.  Adding UI components for configuration in the React application.
