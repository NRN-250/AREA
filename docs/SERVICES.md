# Available Services

The **AREA** platform is built on a modular service architecture. Below are the currently supported services, along with their available Actions (Triggers) and Reactions (Responses).

## 🕒 Timer Service
Allows you to schedule automations based on time.

-   **Action:** `time_at` – Triggered when the current time matches the specified time (HH:mm format).
-   **Reaction:** (None specifically, often used as a trigger for other reactions).

## 📧 Mail Service (Brevo)
Automate email sending as a response to triggers.

-   **Action:** (None).
-   **Reaction:** `send_email` – Sends an email with a custom subject and body.

## 🐙 GitHub Service
Connect your GitHub account to automate repository-related tasks.

-   **Actions:**
    -   `new_push` – Triggered when a new commit is pushed to a repository.
    -   `new_issue` – Triggered when a new issue is opened in a repository.
-   **Reactions:**
    -   `create_issue` – Creates a new issue in a repository.
    -   `create_comment` – Adds a comment to an existing issue.

## 🔑 Authentication Services
External authentication providers for logging in and linking accounts:
-   **Google**
-   **GitHub**

## Adding a New Service
Interested in adding a new integration (e.g., Spotify, Discord, Weather)? Refer to the **[CONTRIBUTING.md](CONTRIBUTING.md)** guide for a step-by-step walkthrough on backend and frontend integration.
