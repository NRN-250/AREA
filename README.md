AREA
AREA is a service-automation platform inspired by tools such as IFTTT and Zapier.
It allows users to create automated workflows called Actions and Reactions (AREA = Action – Reaction), where an event in one service automatically triggers a response in another.

The project includes:

A Spring Boot backend exposing REST APIs and persisting data in an H2 database.
A React Native (Expo) mobile application, acting as the main user interface.
A React-based web client used for additional interactions, APK browsing, and feature testing.
A complete Dockerized environment to build and run all components together.
This repository contains everything needed to develop, test, and run AREA locally during and after MVP development.

✨ Project Overview
The goal of AREA is to allow users to connect external services (such as GitHub, Gmail, Calendar, Weather, etc.) and create automated workflows:

Actions: Events that trigger something
(e.g., "When a GitHub commit is pushed…")

Reactions: Automatic responses
(e.g., "…send a notification to my phone")

The MVP focuses on the core foundation:

Backend API
Mobile UI
Web APK viewer
Dockerized local environment
Database persistence
Service skeleton for future actions/reactions
🔧 Available Services
Service	Description	OAuth Required
Timer	Schedule automations at specific times	No
Mail	Send emails as part of your automations	No
GitHub	Connect to GitHub for repository automation	Yes
Actions (Triggers)
Service	Action	Description
Timer	time_at	Trigger at a specific time (HH:mm)
GitHub	new_push	Trigger when code is pushed to a repository
GitHub	new_issue	Trigger when a new issue is created
Reactions (Responses)
Service	Reaction	Description
Mail	send_email	Send an email to a recipient
GitHub	create_issue	Create a new issue in a repository
GitHub	create_comment	Add a comment to an existing issue
Total: 3 Actions + 3 Reactions = 6 A&R

📡 API Endpoints
Endpoint	Description
/about.json	Returns server info and available services (required by AREA spec)
/client.apk	Downloads the mobile APK file
/client.apk/status	Check APK availability
/swagger-ui.html	Interactive API documentation
/services	List all available services
🏗️ Project Structure
AREA
├── API/area/ # Spring Boot backend
├── mobile/areamobile/ # React Native Expo mobile app
├── UI/area/ # React web client
├── docker-compose.yml # Local development environment
├── README.md
└── HowToContribute.md
Components
Backend

Java 21 / Spring Boot
REST endpoints
H2 database persisted in Docker volume
H2 console available for debugging
Mobile App

React Native + Expo
Connects to backend through local IP
Able to export APKs (shared via Docker volume)
Web Client

React-based interface
Reads APKs from shared volume
Runs independently but communicates with backend
💻 Requirements
Before running AREA locally, ensure you have:

Docker & Docker Compose
Java 21
Node.js ≥ 20
npm or yarn
Expo CLI
🚀 Setup & Running (Local Development)
1. Clone the Repository
git@github.com:EpitechPGE3-2025/G-DEV-500-LIL-5-2-area-2.git cd AREA

2. Start the Full Environment with Docker
docker-compose up --build

3. Access Services
Backend (Spring Boot)

Base URL → http://localhost:8080

H2 Console → http://localhost:8080/h2-console

JDBC URL → jdbc:h2:file:/data/area_db

Mobile App (Expo) To open the Expo project:

Use Expo Go on a phone or emulator

Enter the Expo URL manually using the local IP of the machine running Docker

Web Client

Web UI → http://localhost:8081