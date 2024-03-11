# Cricket Score API

Welcome to the Cricket Score API! This project is designed to provide real-time cricket scores using TypeScript and npm.

## Table of Contents

- [Cricket Score API](#cricket-score-api)
- [Status](#status)
- [Code Coverage](#code-coverage)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Running Tests](#running-tests)
- [License](#license)

## Status

<!-- [![Firebase Deployment](https://github.com/deveshsangwan/cricketScoreApi/actions/workflows/firebase-hosting-merge.yml/badge.svg?branch=main)](https://github.com/deveshsangwan/cricketScoreApi/actions/workflows/firebase-hosting-merge.yml) -->

[![Run Tests](https://github.com/deveshsangwan/cricketScoreApi/actions/workflows/test.yml/badge.svg)](https://github.com/deveshsangwan/cricketScoreApi/actions/workflows/test.yml)

## Code Coverage

Our aim is to maintain high code coverage to ensure the quality of the project. Here are our current stats:

[![codecov](https://codecov.io/gh/deveshsangwan/cricketScoreApi/graph/badge.svg?token=A3JMLLNTG4)](https://codecov.io/gh/deveshsangwan/cricketScoreApi)
![Functions](https://img.shields.io/badge/functions-98.03%25-brightgreen.svg?style=flat)
![Lines](https://img.shields.io/badge/lines-91%25-brightgreen.svg?style=flat)

## Getting Started

To get a copy of the project up and running on your local machine, follow these steps:

1. Clone the repository: `git clone https://github.com/deveshsangwan/cricketScoreApi.git`
2. Install dependencies: `npm install`
3. Create a `.env` file in the root directory of the project. Add the MongoDB URL like so: `MONGO_URL=<your-mongodb-url>`. Replace `<your-mongodb-url>` with your actual MongoDB URL.
4. Start the server: `npm run dev`

You can also run the project with Docker:

1. Build the Docker image: `docker build -t cricket-score-api .`
2. Run the Docker container, passing the MongoDB URL as an environment variable: `docker run -p 3000:3000 -d -e MONGO_URL=<your-mongodb-url> cricket-score-api`

Remember to replace `<your-mongodb-url>` with your actual MongoDB URL.

## Usage

- Make a GET request to `/liveMatches` to get the URLs of all the current live matches.
- Make a GET request to `/matchStats` to get the statistics for all matches.
- Make a GET request to `/matchStats/:matchId` to get the statistics for a single match. Replace `:matchId` with the ID of the match you want statistics for.

## Running Tests

After setting up the project, you can run the tests to ensure everything is working as expected. Follow these steps:

1. Run the test command: `npm run test`

This command will run the test suite for the project.

2. If you want to check the code coverage of your tests, you can run: `npm run test:coverage`

This command will run the tests and generate a coverage report.

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License. See the [LICENSE.md](LICENSE.md) file for details.