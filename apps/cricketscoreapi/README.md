# 🏏 Cricket Score API

Welcome to the Cricket Score API! This project is designed to provide real-time cricket scores using TypeScript and pnpm. It uses technologies like Cheerio for web scraping, Prisma for accessing MongoDB, Express-jwt for authentication, and Chai and Mocha for testing. The project is also Dockerized for easy setup and deployment.

## 📚 Table of Contents

- [🏏 Cricket Score API](#-cricket-score-api)
  - [📚 Table of Contents](#-table-of-contents)
  - [🚀 Status](#-status)
  - [📊 Code Coverage](#-code-coverage)
  - [🚀 Getting Started](#-getting-started)
    - [Environment Variables](#environment-variables)
  - [🛠️ Technologies Used](#️-technologies-used)
  - [📝 Usage](#-usage)
    - [Available Procedures](#available-procedures)
    - [Authentication](#authentication)
  - [🧪 Running Tests](#-running-tests)
  - [📜 License](#-license)

## 🚀 Status

[![Run Tests](https://github.com/deveshsangwan/cricketScoreApi/actions/workflows/test.yml/badge.svg)](https://github.com/deveshsangwan/cricketScoreApi/actions/workflows/test.yml)

## 📊 Code Coverage

Our aim is to maintain high code coverage to ensure the quality of the project. Here are our current stats:

[![codecov](https://codecov.io/gh/deveshsangwan/cricketScoreApi/graph/badge.svg?token=A3JMLLNTG4)](https://codecov.io/gh/deveshsangwan/cricketScoreApi)
![Functions](https://img.shields.io/badge/functions-90.1%25-brightgreen.svg?style=flat)
![Lines](https://img.shields.io/badge/lines-93.82%25-brightgreen.svg?style=flat)

## 🚀 Getting Started

To run this service locally inside the monorepo:

1. Clone the repository: `git clone https://github.com/deveshsangwan/cricketScoreApi.git`
2. Install pnpm if you haven't already: `npm install -g pnpm`
3. From the repo root, install dependencies: `pnpm install`
4. Create a `.env` file in `apps/cricketscoreapi/` with the required environment variables (see below)
5. Generate Prisma client (from `apps/cricketscoreapi/`): `pnpm prisma generate`
6. Start the backend server:
   - From repo root: `pnpm backend:dev`
   - Or from `apps/cricketscoreapi/`: `pnpm dev`

### Environment Variables

Create `apps/cricketscoreapi/.env` with at least:

```env
# Required
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority"
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key"

# Optional
NODE_PORT=3001               # Defaults to 3001
OPTIMIZE_API_KEY=            # Optional Prisma Optimize key
```

You can also run the project with Docker:

1. Build the Docker image (run inside `apps/cricketscoreapi`): `docker build -t cricket-score-api .`
2. Run the Docker container (default port 3001) with required env vars:
   ```bash
   docker run -d \
     -p 3001:3001 \
     -e NODE_PORT=3001 \
     -e DATABASE_URL="<your-mongodb-url>" \
     -e CLERK_SECRET_KEY="<your-clerk-secret>" \
     --name cricket-score-api cricket-score-api
   ```

Remember to replace `<your-mongodb-url>` with your actual MongoDB URL.


## 🛠️ Technologies Used

This project uses a number of technologies and tools:

![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![Cheerio](https://img.shields.io/badge/Cheerio-E85A4F?style=for-the-badge&logo=javascript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Chai](https://img.shields.io/badge/Chai-A30701?style=for-the-badge&logo=chai&logoColor=white)
![Mocha](https://img.shields.io/badge/Mocha-8D6748?style=for-the-badge&logo=mocha&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

- **pnpm**: Used as the package manager for better dependency management and disk space efficiency
- **Cheerio**: Used for web scraping to fetch live cricket match data
- **Prisma**: Used as an ORM for accessing MongoDB to improve performance
- **Clerk**: Used for authentication and user management. Protected endpoints require Clerk authentication
- **Chai and Mocha**: These libraries are used for writing and running tests to ensure the quality of the project
- **Docker**: Used for creating a containerized version of the application, ensuring that it runs the same way in every environment

## 📝 Usage

This service exposes a **tRPC API** mounted at `/trpc` on the configured port (defaults to `3001`). All procedures are protected by Clerk authentication.

### Available Procedures

- `getLiveMatches` (query)
- `getMatchStats` (query)
- `getMatchStatsById` (query) — input: `{ matchId: string }` where `matchId` must be 16 alphanumeric characters
- `subscribeMatchStatsById` (subscription) — input: `{ matchId: string }`, streams periodic updates via SSE

<!-- Sequence Diagram moved to root README -->

### Authentication

All procedures require a valid Clerk session. Include the token in the `Authorization` header:

```
Authorization: Bearer <CLERK_SESSION_TOKEN>
```

When used from the frontend in this monorepo, the token is automatically attached by the TRPC client (see `apps/cricket-score-frontend/src/components/providers/TrpcProvider.tsx`).

## 🧪 Running Tests

After setting up the project, you can run the tests to ensure everything is working as expected. Follow these steps:

1. Run the test command: `pnpm test`

This command will run the test suite for the project.

2. If you want to check the code coverage of your tests, you can run: `pnpm test:coverage`

This command will run the tests and generate a coverage report.

## 📜 License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License. See the [LICENSE.md](LICENSE.md) file for details.