# Cricket Score API

Welcome to the Cricket Score API! This project is designed to provide real-time cricket scores using TypeScript and npm.

## Status

[![Run Tests](https://github.com/deveshsangwan/cricketScoreApi/actions/workflows/test.yml/badge.svg)](https://github.com/deveshsangwan/cricketScoreApi/actions/workflows/test.yml)

## Code Coverage

Our aim is to maintain high code coverage to ensure the quality of the project. Here are our current stats:

![Functions](https://img.shields.io/badge/functions-87.85%25-yellow.svg?style=flat)
![Lines](https://img.shields.io/badge/lines-84.11%25-yellow.svg?style=flat)

## Getting Started

To get a copy of the project up and running on your local machine, follow these steps:

1. Clone the repository: `git clone https://github.com/deveshsangwan/cricketScoreApi.git`
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`

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