# 🏏 CricketScore Frontend

> Your ultimate source for real-time cricket scores and updates

A modern Next.js frontend application that connects to the [Cricket Score API](https://github.com/deveshsangwan/cricketScoreApi) backend for live cricket data and match statistics.

![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0--rc-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)
![Clerk](https://img.shields.io/badge/Clerk-6.23.1-6C47FF?style=for-the-badge&logo=clerk)

[![Build Status](https://img.shields.io/github/actions/workflow/status/deveshsangwan/cricket-score-frontend/ci.yml?branch=main&style=flat-square)](https://github.com/deveshsangwan/cricket-score-frontend/actions)
[![Code Style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Deploy Status](https://img.shields.io/badge/deploy-vercel-000000.svg?style=flat-square&logo=vercel)](https://vercel.com)

## 📋 Table of Contents

- [🏏 CricketScore Frontend](#-cricketscore-frontend)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
    - [🔥 Core Features](#-core-features)
    - [🚀 Technical Features](#-technical-features)
  - [🔗 Backend API](#-backend-api)
    - [🏏 API Features](#-api-features)
    - [📡 Available Endpoints](#-available-endpoints)
    - [🔧 Backend Tech Stack](#-backend-tech-stack)
  - [🚀 Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
      - [🔗 About the Backend API](#-about-the-backend-api)
    - [Development](#development)
  - [📦 Available Scripts](#-available-scripts)
  - [🛠️ Tech Stack](#️-tech-stack)
    - [Frontend Core](#frontend-core)
    - [Styling \& UI](#styling--ui)
    - [Authentication \& Security](#authentication--security)
    - [Development Tools](#development-tools)
    - [Backend Integration](#backend-integration)
  - [🏗️ Project Structure](#️-project-structure)
  - [🎨 Theming](#-theming)
    - [Theme Customization](#theme-customization)
  - [🔒 Authentication](#-authentication)
  - [📱 Responsive Design](#-responsive-design)
  - [🚀 Deployment](#-deployment)
    - [Vercel (Recommended)](#vercel-recommended)
    - [Manual Deployment](#manual-deployment)
  - [⚙️ CI Pipeline](#️-ci-pipeline)
    - [🔄 Continuous Integration](#-continuous-integration)
    - [🚀 Automated Workflow (Build \& Lint)](#-automated-workflow-build--lint)
    - [📊 Workflow Features](#-workflow-features)

## ✨ Features

### 🔥 Core Features
- **⚡ Real-time Updates** - Get live cricket scores and updates as matches happen
- **📊 Detailed Statistics** - Comprehensive match statistics and player performance data
- **🔐 Secure Authentication** - Cross-platform user authentication powered by Clerk
- **📱 Mobile-First Design** - Fully responsive design optimized for all devices
- **🌙 Dark/Light Theme** - Beautiful theme system with automatic system preference detection
- **🎯 Live Match Tracking** - Real-time score updates with live indicators

### 🚀 Technical Features
- **Next.js 15** - Latest Next.js with App Router and React Server Components
- **React 19 RC** - Cutting-edge React features and performance improvements
- **TypeScript** - Full type safety and enhanced developer experience
- **Tailwind CSS** - Modern utility-first CSS framework
- **Framer Motion** - Smooth animations and micro-interactions
- **Error Boundaries** - Robust error handling and user feedback
- **Performance Optimized** - Code splitting, image optimization, and fast loading

## 🔗 Backend API

This frontend application is powered by the **[Cricket Score API](https://github.com/deveshsangwan/cricketScoreApi)** - a robust TypeScript-based backend that provides:

### 🏏 API Features
- **Real-time Data Scraping** - Live cricket match data using Cheerio web scraping
- **MongoDB Integration** - Efficient data storage with Prisma ORM
- **Clerk Authentication** - Secure user authentication (matches frontend auth)
- **RESTful Endpoints** - Clean API design with comprehensive cricket data
- **Docker Support** - Containerized deployment for easy scaling
- **High Test Coverage** - Quality assured with Mocha and Chai testing

### 📡 Available Endpoints
- `GET /liveMatches` - Fetch URLs of all current live matches
- `GET /matchStats` - Get statistics for all matches  
- `GET /matchStats/:matchId` - Get detailed statistics for a specific match

### 🔧 Backend Tech Stack
- **TypeScript** - Type-safe backend development
- **Express.js** - Fast web framework
- **Prisma** - Modern database toolkit
- **MongoDB** - NoSQL database for cricket data
- **Cheerio** - Server-side HTML parsing for web scraping
- **Docker** - Containerization for deployment

> **Repository**: [github.com/deveshsangwan/cricketScoreApi](https://github.com/deveshsangwan/cricketScoreApi)  
> **License**: Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)

## 🚀 Getting Started

### Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v20 or later) - [Download here](https://nodejs.org/)
- **pnpm** (v9.13.2 or later) - [Installation guide](https://pnpm.io/installation)
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/deveshsangwan/cricket-score-frontend.git
   cd cricket-score-frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your configuration values.

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# API Configuration - Cricket Score API Backend
# Use the deployed API or run locally: http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=https://cricketapi-r9zv.onrender.com

# App Configuration
NEXT_PUBLIC_APP_NAME=CricketScore
NEXT_PUBLIC_APP_DESCRIPTION=Your ultimate source for real-time cricket scores and updates
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=false

# Environment
NODE_ENV=development
```

> **⚠️ Important**: Never commit your `.env.local` file to version control. The actual values should be kept secure.

#### 🔗 About the Backend API
This frontend connects to the [Cricket Score API](https://github.com/deveshsangwan/cricketScoreApi) backend. You can:
- **Use the deployed API** at `https://cricketapi-r9zv.onrender.com` (default)
- **Run locally** by cloning the backend repo and setting `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`
- **Deploy your own** instance using the backend repository's Docker setup

### Development

1. **Start the development server**
   ```bash
   pnpm dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

3. **Start developing!**
   The app will automatically reload when you make changes to the code.

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Starts development server on port 3000 |
| `pnpm build` | Creates optimized production build |
| `pnpm start` | Starts production server |
| `pnpm lint` | Runs ESLint to check code quality |
| `pnpm lint:fix` | Runs ESLint and automatically fixes issues |
| `pnpm type-check` | Runs TypeScript type checking |
| `pnpm ci` | Runs complete CI pipeline (type-check + lint + build) |

## 🛠️ Tech Stack

### Frontend Core
- **[Next.js 15.3.4](https://nextjs.org/)** - React framework with App Router
- **[React 19 RC](https://reactjs.org/)** - Modern React with latest features
- **[TypeScript 5.8.3](https://typescriptlang.org/)** - Type-safe JavaScript

### Styling & UI
- **[Tailwind CSS 3.4.17](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion 12.19.2](https://framer.com/motion/)** - Animation library
- **[Geist Font](https://vercel.com/font)** - Modern typography

### Authentication & Security
- **[Clerk 6.23.1](https://clerk.com/)** - Complete authentication solution
- Security headers and CSRF protection

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **[PostCSS](https://postcss.org/)** - CSS processing
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager

### Backend Integration
- **[Cricket Score API](https://github.com/deveshsangwan/cricketScoreApi)** - Custom TypeScript backend
- **RESTful API** - Clean endpoints for cricket data
- **MongoDB** - Database via Prisma ORM
- **Docker** - Containerized backend deployment

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and theme variables
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── matches/           # Match-related pages
├── components/            # Reusable UI components
│   ├── Navbar.tsx         # Navigation component
│   ├── ErrorBoundary.tsx  # Error handling
│   ├── ThemeProvider.tsx  # Theme context
│   └── ClerkWrapper.tsx   # Authentication wrapper
├── config/                # Configuration files
│   └── env.ts             # Environment variable handling
├── hooks/                 # Custom React hooks
│   └── useTheme.ts        # Theme management hook
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── constants/             # Application constants
```

## 🎨 Theming

The application features a sophisticated theming system with:

- **🌙 Dark Mode** - Default elegant dark theme
- **☀️ Light Mode** - Clean and bright light theme  
- **🔄 Auto Detection** - Respects system preferences
- **💾 Persistence** - Remembers user's theme choice
- **🎨 CSS Custom Properties** - Dynamic theme switching

### Theme Customization

Themes are defined using CSS custom properties in `src/app/globals.css`:

```css
:root {
  --background: 255 255 255;
  --foreground: 15 23 42;
  /* ... more theme variables */
}

[data-theme="dark"] {
  --background: 10 25 47;
  --foreground: 241 245 249;
  /* ... dark theme overrides */
}
```

## 🔒 Authentication

Authentication is handled by [Clerk](https://clerk.com/) which provides:

- **🔐 Secure Sign-in/Sign-up** - Multiple authentication methods
- **👤 User Management** - Complete user profile management
- **🔄 Session Management** - Automatic session handling
- **🛡️ Security** - Built-in security features and best practices
- **📱 Cross-platform** - Works seamlessly across all devices

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **📱 Mobile Optimized** - Perfect experience on all mobile devices
- **💻 Desktop Enhanced** - Rich experience on larger screens
- **🔄 Adaptive Layouts** - Layouts adapt to screen size and orientation
- **⚡ Performance** - Optimized for fast loading on all devices

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Automatic deployments on every push

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/deveshsangwan/cricket-score-frontend)

### Manual Deployment

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Start the production server**
   ```bash
   pnpm start
   ```

## ⚙️ CI Pipeline

This project includes a streamlined GitHub Actions workflow that automatically ensures code quality:

### 🔄 Continuous Integration
- **🔍 Code Quality** - ESLint linting with automatic error detection
- **🔨 Type Safety** - TypeScript type checking to catch errors early
- **🏗️ Build Verification** - Ensures the application builds successfully
- **📦 Dependency Caching** - Optimized builds with pnpm cache
- **⚡ Fast Execution** - Efficient CI with minimal overhead

### 🚀 Automated Workflow (Build & Lint)
- **Trigger Conditions** - Runs on push to `main`/`develop` and pull requests
- **Node.js 20** - Uses the recommended Node.js version
- **Status Reporting** - Clear build status with detailed feedback
- **Concurrent Jobs** - Parallel execution for faster feedback

### 📊 Workflow Features
```yaml
# Runs on every push and PR
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
```

The CI pipeline ensures code quality and build integrity. Deployment is handled automatically by Vercel when code is pushed to the `main` branch.

---
<div align="center">

**Built with ❤️ using Next.js and TypeScript**
<div>