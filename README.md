# Cricket Score Frontend

This is a Next.js application for viewing live cricket scores and match details.

## Features

*   **Live Match Scores:** Get real-time updates on live cricket matches.
*   **Match Details:** View detailed information for each match, including team scores and commentary.
*   **User Authentication:** Secure user authentication powered by Clerk.
*   **Modern UI:** A clean and modern user interface built with Tailwind CSS and animations by Framer Motion.
*   **Responsive Design:** The application is optimized for all screen sizes.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v20 or later)
*   [pnpm](https://pnpm.io/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/cricket-score-frontend.git
    cd cricket-score-frontend
    ```

2.  Install the dependencies:
    ```bash
    pnpm install
    ```

3.  Set up your environment variables. Create a `.env.local` file by copying the example:
    ```bash
    cp .env.example .env.local
    ```
    Update the `.env.local` file with your Clerk credentials and API URL. See the [Environment Variables](#environment-variables) section for more details.

4.  Run the development server:
    ```bash
    pnpm dev
    ```

The application will be available at `http://localhost:3000`.

## Available Scripts

In the project directory, you can run:

*   `pnpm dev`: Runs the app in development mode.
*   `pnpm build`: Builds the app for production.
*   `pnpm start`: Starts a production server.
*   `pnpm lint`: Lints the code using Next.js' built-in ESLint configuration.

## Environment Variables

The following environment variables are required to run the application. These should be placed in a `.env.local` file in the root of the project.

*   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your publishable API key from Clerk.
*   `CLERK_SECRET_KEY`: Your secret API key from Clerk.
*   `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: The sign-in URL for your Clerk application (e.g., `/sign-in`).
*   `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: The sign-up URL for your Clerk application (e.g., `/sign-up`).
*   `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: The URL to redirect to after sign-in (e.g., `/`).
*   `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: The URL to redirect to after sign-up (e.g., `/`).
*   `NEXT_PUBLIC_API_URL`: The base URL of the cricket score API.

## Technologies Used

*   [Next.js](https://nextjs.org/) - React framework
*   [React](https://reactjs.org/) - JavaScript library for building user interfaces
*   [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
*   [Clerk](https://clerk.com/) - User authentication and management
*   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
*   [Framer Motion](https://www.framer.com/motion/) - Animation library for React
*   [pnpm](https://pnpm.io/) - Package manager