# AREA

AREA is a flexible, highly-scalable service-automation platform inspired by tools such as IFTTT and Zapier.
It enables users to construct automated workflows called **Actions and Reactions** (AREA). This allows events in one service to seamlessly and instantaneously trigger responses in another isolated service.

The platform is designed with a monolithic microservices approach and consists of:
- **A Spring Boot backend** powered by Java 21, exposing a robust REST JSON API.
- **A modern React-based web client** providing the main user interface.

## ✨ Project Overview
The architecture is modular; users connect external OAuth-driven services (such as GitHub, Google, Calendars, etc.) and seamlessly automate tasks:

- **Actions (Triggers):** Events that init an automation (e.g., "When a new GitHub commit is pushed…")
- **Reactions (Responses):** The automatic execution (e.g., "…send a custom email warning the team")

## 🔧 Available Services
| Service | Description                               | OAuth Required |
|---------|-------------------------------------------|----------------|
| Timer   | Schedule automations at specific times    | No             |
| Mail    | Send emails as part of your automations   | No             |
| GitHub  | Connect to GitHub for repository triggers | Yes            |

### Actions (Triggers)
| Service | Action      | Description |
|---------|-------------|-------------|
| Timer   | time_at     | Trigger at a specific time (HH:mm) |
| GitHub  | new_push    | Trigger when code is pushed to a repository |
| GitHub  | new_issue   | Trigger when a new issue is created |

### Reactions (Responses)
| Service | Reaction       | Description |
|---------|----------------|-------------|
| Mail    | send_email     | Send an email to a recipient |
| GitHub  | create_issue   | Create a new issue in a repository |
| GitHub  | create_comment | Add a comment to an existing issue |

## 📡 API Endpoints
| Endpoint | Description |
|----------|-------------|
| `/about.json` | Returns server info, client IP, and available mapped services |
| `/swagger-ui.html` | Interactive interactive API OpenAPI documentation |
| `/services` | List all available internal and external services |

## 🏗️ Project Structure
```text
AREA
├── API/area/        # Spring Boot backend API
├── UI/area/         # React web client Application
├── nixpacks.toml    # CI/CD Production Build Instructions
├── README.md        # Documentation
└── HowToContribute.md
```

## 💻 Technical Requirements
If you intend to host or build this platform manually from source:
- **Java 21 Distribution** (OpenJDK 21 recommended)
- **Apache Maven** (`mvnw` wrapper provided)
- **Node.js** (v20+)

## 📚 Documentation

Detailed documentation is available in the **[docs/](docs/)** folder:

-   **[Setup Guide](docs/SETUP.md):** How to get the platform running locally.
-   **[Architecture](docs/ARCHITECTURE.md):** Detailed technical overview of the Action-Reaction model.
-   **[Available Services](docs/SERVICES.md):** List of supported Actions and Reactions.
-   **[Security Policy](docs/SECURITY.md):: How to report vulnerabilities and supported versions.
-   **[Contributing](docs/CONTRIBUTING.md):** Guidelines for adding new features or services.

## 🚀 Deployment (Railway AI Container)
This project natively implements a `nixpacks.toml` file to effortlessly deploy on Nixpacks-compatible hosts (such as Railway).
Pushing code to the `main` branch will automatically invoke the CI/CD pipeline, downloading the strict JDK-21 environment, allocating Memory-Optimized Maven instances, and compiling target JARs.