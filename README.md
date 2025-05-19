<p align="center">
  <h1 align="center">Pollify</h1>
  <p align="center">Educational project for creating and managing polls</p>
</p>

## Project Description

Pollify is an educational web application for creating and conducting polls. The project is developed using a modern technology stack and follows best development practices. Users can register, create polls, vote, and view results.

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

## Project Structure

```
src/
├── auth/                  # Authentication and authorization module
│   ├── dto/               # Data Transfer Objects for authentication
│   ├── entities/          # User and token entities
│   ├── guards/            # Guards for route protection
│   └── interfaces/        # Interfaces for typing
├── polls/                 # Polls module
│   ├── dto/               # DTOs for creating polls and voting
│   └── entities/          # Poll entities
├── templates/             # HTML templates for emails
├── config/                # Configuration files
└── main.ts               # Application entry point
```

## Functionality

- **User Authentication**: registration, login, email confirmation, password recovery
- **Poll Management**: creating, editing, deleting polls
- **Voting**: ability to vote in polls
- **Analytics**: viewing poll results with analytical data
- **Notifications**: sending email notifications about important events

## Installation and Running

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Redis

### Installing Dependencies

```bash
$ npm install
```

### Environment Setup

Create a `.env` file in the project root with the following variables:

```
APP_PORT=
MONGO_PORT=
MONGO_INITDB_ROOT_USERNAME=
MONGO_INITDB_ROOT_PASSWORD=
MONGO_USER=
MONGO_PASSWORD=
MONGO_DB=
USER_NAME=
USER_PASSWORD=
FRONTEND_URL=
GEMINI_API_KEY=
JWT_SECRET=
CLIENT_ID=
CLIENT_SECRET=
REFRESH_TOKEN=
ACCESS_TOKEN=
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
- `POST /auth/login` - Log in to the system
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/verify-email` - Confirm email
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Polls

- `GET /polls` - Get a list of polls
- `GET /polls/:id` - Get information about a poll
- `POST /polls` - Create a new poll
- `PUT /polls/:id` - Update a poll
- `DELETE /polls/:id` - Delete a poll
- `POST /polls/:id/vote` - Vote in a poll
- `GET /polls/:id/results` - Get poll results

## License

This project is educational and is distributed under the [MIT](LICENSE) license.
