# 🏏 Cricket Score API

Welcome to the Cricket Score API! This project is designed to provide real-time cricket scores using TypeScript and pnpm. It uses technologies like Cheerio for web scraping, Prisma for accessing MongoDB, Express-jwt for authentication, and Chai and Mocha for testing. The project is also Dockerized for easy setup and deployment.

## 📚 Table of Contents

- [🏏 Cricket Score API](#-cricket-score-api)
  - [📚 Table of Contents](#-table-of-contents)
  - [🚀 Status](#-status)
  - [📊 Code Coverage](#-code-coverage)
  - [🚀 Getting Started](#-getting-started)
  - [🛠️ Technologies Used](#️-technologies-used)
  - [📝 Usage](#-usage)
    - [Protected Routes (Require Authentication)](#protected-routes-require-authentication)
    - [Authentication](#authentication)
  - [🧪 Running Tests](#-running-tests)
  - [📜 License](#-license)

## 🚀 Status

[![Run Tests](https://github.com/deveshsangwan/cricketScoreApi/actions/workflows/test.yml/badge.svg)](https://github.com/deveshsangwan/cricketScoreApi/actions/workflows/test.yml)

## 📊 Code Coverage

Our aim is to maintain high code coverage to ensure the quality of the project. Here are our current stats:

[![codecov](https://codecov.io/gh/deveshsangwan/cricketScoreApi/graph/badge.svg?token=A3JMLLNTG4)](https://codecov.io/gh/deveshsangwan/cricketScoreApi)
![Functions](https://img.shields.io/badge/functions-97.33%25-brightgreen.svg?style=flat)
![Lines](https://img.shields.io/badge/lines-92.77%25-brightgreen.svg?style=flat)

## 🚀 Getting Started

To get a copy of the project up and running on your local machine, follow these steps:

1. Clone the repository: `git clone https://github.com/deveshsangwan/cricketScoreApi.git`
2. Install pnpm if you haven't already: `npm install -g pnpm`
3. Install dependencies: `pnpm install`
4. Create a `.env` file in the root directory of the project. Add the MongoDB URL like so: `DATABASE_URL=<your-mongodb-url>`. Replace `<your-mongodb-url>` with your actual MongoDB URL.
5. Generate Prisma client: `pnpm prisma generate`
6. Start the server: `pnpm dev`

You can also run the project with Docker:

1. Build the Docker image: `docker build -t cricket-score-api .`
2. Run the Docker container, passing the MongoDB URL as an environment variable: `docker run -p 3000:3000 -d -e DATABASE_URL=<your-mongodb-url> cricket-score-api`

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

All API endpoints except for public routes require authentication via Clerk. You'll need to include the Clerk session token in your requests.

### Protected Routes (Require Authentication)
- Make a GET request to `/liveMatches` to get the URLs of all the current live matches.
- Make a GET request to `/matchStats` to get the statistics for all matches.
- Make a GET request to `/matchStats/:matchId` to get the statistics for a single match. Replace `:matchId` with the ID of the match you want statistics for.

### Authentication
This API uses Clerk for authentication. To use the protected endpoints:

1. Sign up and sign in using Clerk in your frontend application
2. Clerk will automatically handle the authentication tokens
3. Make requests from your frontend application with the Clerk session

## 🧪 Running Tests

After setting up the project, you can run the tests to ensure everything is working as expected. Follow these steps:

1. Run the test command: `pnpm test`

This command will run the test suite for the project.

2. If you want to check the code coverage of your tests, you can run: `pnpm test:coverage`

This command will run the tests and generate a coverage report.

## 📜 License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License. See the [LICENSE.md](LICENSE.md) file for details.