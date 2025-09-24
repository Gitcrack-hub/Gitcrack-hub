# FULXERPRO API & Backend Structure

This document outlines the proposed backend directory structure and core API endpoints for the FULXERPRO platform.

## Backend Directory Structure (Scaffold)

This structure is based on modern backend development principles, promoting separation of concerns, testability, and scalability. It is framework-agnostic but borrows from best practices seen in frameworks like Play (Scala), NestJS (Node.js), and Django (Python).

```bash
fulxerpro-backend/
├── .github/              # CI/CD workflows (e.g., GitHub Actions)
├── .env.example          # Example environment variables
├── build.sbt             # (If Scala) Build definition
├── package.json          # (If Node.js) Project manifest
├── requirements.txt      # (If Python) Dependencies
└── src/
    ├── main/
    │   ├── scala/        # Or javascript/, python/
    │   │   └── com/
    │   │       └── fulxerpro/
    │   │           ├── Application.scala     # Main application entry point
    │   │           ├── config/               # Application configuration bindings
    │   │           ├── controllers/          # Handles HTTP requests, routes to services
    │   │           │   ├── AuthController.scala
    │   │           │   ├── PortfolioController.scala
    │   │           │   ├── AiStudioController.scala
    │   │           │   └── UserController.scala
    │   │           ├── models/               # Data structures, case classes, DTOs
    │   │           │   ├── User.scala
    │   │           │   ├── Portfolio.scala
    │   │           │   └── Transaction.scala
    │   │           ├── repositories/         # Data Access Layer (interacts with DB)
    │   │           │   ├── UserRepository.scala
    │   │           │   └── PortfolioRepository.scala
    │   │           ├── services/             # Business logic
    │   │           │   ├── AuthService.scala
    │   │           │   ├── PortfolioService.scala
    │   │           │   ├── GeminiService.scala # Service to interact with Google GenAI
    │   │           │   └── ReportingService.scala
    │   │           └── utils/                # Helper functions, constants
    │   └── resources/
    │       ├── application.conf              # Main configuration file
    │       └── logback.xml                   # Logging configuration
    └── test/
        └── scala/
            └── com/
                └── fulxerpro/
                    ├── controllers/
                    └── services/
```

## Core API Endpoints

The following is a preliminary list of RESTful API endpoints.

| Method | Endpoint                             | Description                                            | Auth Required |
|--------|--------------------------------------|--------------------------------------------------------|---------------|
| `POST` | `/auth/login`                        | Authenticate a user and return a JWT.                  | No            |
| `POST` | `/auth/register`                     | Create a new user account.                             | No            |
| `POST` | `/auth/logout`                       | Invalidate user's session/token.                       | Yes           |
| `POST` | `/auth/2fa/verify`                   | Verify a 2FA code.                                     | Yes (pre-auth)|
| `GET`  | `/api/v1/user/profile`               | Get the profile of the currently authenticated user.   | Yes           |
| `GET`  | `/api/v1/portfolio/overview`         | Get high-level portfolio metrics (total value, change).| Yes           |
| `GET`  | `/api/v1/portfolio/allocations`      | Get asset allocation breakdown.                        | Yes           |
| `GET`  | `/api/v1/portfolio/activity`         | Get a list of recent transactions.                     | Yes           |
| `GET`  | `/api/v1/insights/strategic`         | Fetch AI-generated strategic opportunities.            | Yes           |
| `POST` | `/api/v1/ai-studio/generate/image`   | Generate a financial visualization image via AI.       | Yes           |
| `GET`  | `/api/v1/social/traders`             | Get a list of top traders to follow.                   | Yes           |
| `POST` | `/api/v1/social/traders/{id}/follow` | Follow or unfollow a trader.                           | Yes           |

---
_This is a foundational document and is subject to change as development progresses._