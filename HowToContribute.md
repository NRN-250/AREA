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
