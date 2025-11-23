# Node.js Server Boilerplate

A modern Node.js server boilerplate with TypeScript, Express, and best practices for rapid development.

## Features

- 🚀 TypeScript for type safety and better developer experience
- 🔒 Built-in security with Helmet, CORS, and rate limiting
- 📝 Winston for logging
- 🔑 Authentication ready with JWT, Passport (Google & Apple OAuth)
- ✉️ Email service integration with Nodemailer
- 📦 MongoDB integration with Mongoose
- ✅ Testing with Jest
- 🎯 ESLint and Prettier for code quality
- 🔄 Hot reload for development
- 🌍 Environment variables management with dotenvx
- 🪝 Git hooks with Husky

## Prerequisites

- Node.js 22.20 or above (LTS recommended)
- npm 11.5 or above
- MongoDB (local or remote instance)

## Getting Started

1. Clone the repository:

```bash
git clone [repository-url]
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Update environment variables:
   - keep all the development related environment variables in `.env.dev`
   - keep all the production related environment variables in `.env.prod`
   - Update the variables according to your setup

## Available Scripts

### Development

```bash
npm run dev
```

Starts the development server with hot reload.

### Production

```bash
npm run build
npm start
```

Builds the project and starts the production server.

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run all checks (lint, test, build)
npm run check
```

## Project Structure

```
src/
├── config/         # Configuration files
├── constants/      # Constants and enums
├── controllers/    # Route controllers
├── helpers/        # Helper functions
├── middleware/     # Express middleware
├── routes/         # API routes
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── app.ts         # Express app setup
└── server.ts      # Server entry point
```

---

Always pull from this boilerplate repository and extend it to fit your current project’s requirements. Please review all folders and files to understand the existing code structure, and then begin extending or reusing the code according to the requirements.
