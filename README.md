<p align="center">
  <h1 align="center">Pollify</h1>
  <p align="center">Modern web application for creating and managing polls with AI-powered features</p>
  <p align="center">
    <a href="https://polls-ai.ru/" target="_blank">🌐 Live Demo</a>
  </p>
</p>

## Project Description

Pollify is a modern web application for creating and conducting polls with AI-powered features. The project is developed using a cutting-edge technology stack and follows best development practices. Users can register, create polls with AI assistance, vote, and view detailed analytics with real-time insights.

**🚀 Live Application**: [https://polls-ai.ru/](https://polls-ai.ru/)

## Technology Stack

### Core Technologies

- **NestJS** - a progressive Node.js framework for building efficient and scalable server-side applications. Used as the foundation for the entire backend, providing a modular architecture and adherence to SOLID principles.

- **TypeScript** - a typed programming language that compiles to JavaScript. Provides static typing, which helps avoid errors during development.

- **MongoDB** - a NoSQL database used to store data about users, polls, and votes. Chosen for its schema flexibility and good scalability.

- **Mongoose** - an ODM (Object Data Modeling) library for MongoDB and Node.js. Provides a convenient way to model data and interact with the database.

### Authentication and Authorization

- **JWT (JSON Web Tokens)** - used for secure user authentication and protection of API endpoints.

- **Passport** - middleware for authentication in Node.js. Integrated with NestJS to provide various authentication strategies.

- **bcrypt** - a library for password hashing, ensuring secure storage of user credentials.

### Queues and Background Tasks

- **BullMQ** - a library for managing task queues in Node.js. Used for processing asynchronous operations such as sending emails and processing poll results.

- **Redis** - an in-memory data store used by BullMQ for managing task queues.

- **@nestjs/schedule** - a module for scheduling tasks in NestJS, used for periodic operations such as cleaning up outdated data.

### Email Sending

- **Nodemailer** - a module for sending emails from Node.js applications. Used to send registration confirmation and password reset emails.

- **Handlebars** - a templating engine for creating HTML email templates.

### Artificial Intelligence

- **Google Gemini AI** - Google's artificial intelligence API used for analyzing poll results and generating insights.

### Data Validation and Transformation

- **class-validator** - a library for validating incoming data based on decorators.

- **class-transformer** - a library for transforming plain objects into class instances and vice versa.

### Development and Deployment

- **Docker** - containerization platform for consistent deployment across environments.

- **ESLint** - static code analysis tool for identifying and fixing code quality issues.

- **Prettier** - code formatter for maintaining consistent code style across the project.

## Project Structure

```
src/
├── app.controller.spec.ts # Unit tests for the main application controller
├── app.controller.ts      # Main application controller with basic endpoints
├── app.module.ts          # Root module that imports and configures all other modules
├── app.service.ts         # Main application service with core business logic
├── auth/                  # Authentication and authorization module
│   ├── dto/               # Data Transfer Objects for authentication
│   ├── entities/          # User and token entities
│   ├── guards/            # Guards for route protection
│   └── interfaces/        # Interfaces for typing
├── decorators/            # Custom decorators for enhanced functionality
├── polls/                 # Polls module
│   ├── dto/               # DTOs for creating polls and voting
│   └── entities/          # Poll entities
├── templates/             # HTML templates for emails
├── configs/               # Configuration files
└── main.ts               # Application entry point
```

## Functionality

### Core Features
- **User Authentication**: registration, login, email confirmation, password recovery
- **Poll Management**: creating, editing, deleting polls with intuitive interface
- **Voting System**: secure and anonymous voting with real-time updates
- **Advanced Analytics**: interactive charts, real-time results, and data export
- **Email Notifications**: automated notifications for important events

### AI-Powered Features
- **Smart Poll Generation**: AI-assisted poll creation with intelligent question suggestions
- **Result Analysis**: AI-powered insights and trend analysis
- **Question Optimization**: AI recommendations for better poll engagement
- **Audience Insights**: AI-driven audience behavior analysis

### Real-Time Features
- **Live Results**: watch poll results update in real-time
- **Interactive Charts**: beautiful, responsive data visualizations
- **Instant Notifications**: real-time updates for poll creators and participants

## Installation and Running

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Redis (Bull MQ)

### Installing Dependencies

```bash
$ npm install
```


### Running the Application

```bash
# Development mode
$ npm run start:dev

# Debug mode
$ npm run start:debug

# Production mode
$ npm run build
$ npm run start:prod
```

### Running with Docker

The project includes Docker configuration for quick deployment:

```bash
$ docker-compose up -d
```

This will start MongoDB, Redis, and the application itself in Docker containers.

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/verify-email` - Confirm email address with verification code
- `POST /auth/resend-verification-email` - Resend email verification code
- `POST /auth/login` - Log in to the system
- `POST /auth/refresh` - Refresh JWT token using refresh token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with verification code
- `POST /auth/logout` - Log out and clear refresh token
- `GET /auth/validate` - Validate current JWT token (requires authentication)

### Polls

- `GET /polls` - Get all polls for the authenticated user
- `GET /polls/:id` - Get detailed information about a specific poll
- `GET /polls/short/:id` - Get short information about a specific poll
- `POST /polls` - Create a new poll
- `POST /polls/generate` - Generate a poll using AI
- `PUT /polls/:id/update` - Update an existing poll
- `DELETE /polls/:id` - Delete a poll
- `POST /polls/:id/vote` - Submit a vote for a poll
- `GET /polls/:id/check-vote` - Check if user has voted for a specific poll

## Global AI Access

This application includes built-in proxy support for AI requests to Google Gemini API. All AI-related functionality works seamlessly from any location worldwide, bypassing geographical restrictions and ensuring consistent performance for poll generation features.
