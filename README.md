# Travelmate AI Server

A NestJS-based backend server for the Travelmate AI application that provides intelligent travel planning and recommendation services.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user registration, login, and profile management
- **Password Reset**: Secure email-based password reset functionality
- **Database Integration**: MongoDB with Mongoose ODM and PostgreSQL with TypeORM
- **Email Services**: Automated email notifications using Gmail SMTP
- **Health Checks**: Application health monitoring endpoints
- **Global Error Handling**: Comprehensive error handling and logging
- **API Response Standardization**: Consistent API response format
- **CORS Support**: Cross-origin resource sharing configuration

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Databases**:
  - MongoDB (Primary database with Mongoose)
  - PostgreSQL (Additional database with TypeORM)
- **Authentication**: JWT (JSON Web Tokens) with Passport.js
- **Email Service**: Nodemailer with Gmail SMTP
- **Validation**: Class-validator and Class-transformer
- **Testing**: Jest
- **Code Quality**: ESLint + Prettier

## 📁 Project Structure

```
src/
├── app.controller.ts          # Main application controller
├── app.module.ts              # Root application module
├── app.service.ts             # Main application service
├── main.ts                    # Application entry point
├── common/                    # Shared utilities and components
│   ├── decorators/           # Custom decorators (roles, request-info)
│   ├── enums/                # Application enums
│   ├── filters/              # Exception filters
│   ├── guards/               # Authorization guards
│   ├── interceptors/         # Request/response interceptors
│   ├── interfaces/           # TypeScript interfaces
│   └── middlewares/          # Custom middlewares (logger)
├── config/                   # Configuration files
├── database/                 # Database configuration
├── modules/                  # Feature modules
│   ├── auth/                 # Authentication module
│   │   ├── dto/              # Data transfer objects
│   │   ├── guards/           # JWT and local auth guards
│   │   ├── schemas/          # MongoDB schemas
│   │   ├── services/         # Email, password reset, refresh token services
│   │   └── strategies/       # Passport strategies
│   ├── health/               # Health check module
│   └── users/                # User management module
│       ├── dto/              # User DTOs
│       ├── entities/         # User entities (TypeORM)
│       └── schemas/          # User schemas (Mongoose)
├── examples/                 # Code examples and imports
postman/                      # Postman collections
└── test/                     # E2E tests
```

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (v5.0 or higher)
- **PostgreSQL** (v13 or higher)
- **Gmail account** with App Password for email services

## ⚡ Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/nhanbernie/travelmate-ai-server.git
cd travelmate-ai-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=1d
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3333

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DATABASE=travelmateai

# Email Configuration (Gmail)
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

### 4. Database Setup

**MongoDB:**

```bash
# Start MongoDB service
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**PostgreSQL:**

```bash
# Create database
createdb travelmateai

# Or using Docker
docker run -d -p 5432:5432 --name postgres -e POSTGRES_DB=travelmateai -e POSTGRES_PASSWORD=yourpassword postgres:13
```

### 5. Start the application

```bash
# Development mode with auto-reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The application will be available at `http://localhost:3333`

## 🔗 API Endpoints

### 🔐 Authentication

| Method | Endpoint                | Description               | Protected |
| ------ | ----------------------- | ------------------------- | --------- |
| `POST` | `/auth/login`           | User login                | ❌        |
| `POST` | `/auth/register`        | User registration         | ❌        |
| `POST` | `/auth/refresh`         | Refresh access token      | ❌        |
| `POST` | `/auth/logout`          | User logout               | ✅        |
| `POST` | `/auth/forgot-password` | Request password reset    | ❌        |
| `POST` | `/auth/reset-password`  | Reset password with token | ❌        |

### 👤 Users

| Method | Endpoint         | Description         | Protected |
| ------ | ---------------- | ------------------- | --------- |
| `GET`  | `/users/profile` | Get user profile    | ✅        |
| `PUT`  | `/users/profile` | Update user profile | ✅        |

### 🏥 Health

| Method | Endpoint  | Description              | Protected |
| ------ | --------- | ------------------------ | --------- |
| `GET`  | `/health` | Application health check | ❌        |

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run test coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Start development server
npm run start:dev

# Start test environment
npm run start:test
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Global exception filters
- **Rate Limiting**: Built-in protection against abuse
- **Role-Based Access**: Fine-grained permission control

## 📧 Email Services

The application uses Gmail SMTP for sending emails:

- **Password Reset**: Secure token-based password reset emails
- **Account Verification**: Email verification for new accounts
- **Notifications**: System notifications and alerts

To set up Gmail integration:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password in your Google Account settings
3. Use the App Password in your `.env` file

## 🚀 Deployment

### Using Docker

```dockerfile
# Dockerfile example
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3333

CMD ["npm", "run", "start:prod"]
```

### Environment Variables for Production

| Variable                 | Description              | Required | Default     |
| ------------------------ | ------------------------ | -------- | ----------- |
| `NODE_ENV`               | Environment mode         | No       | development |
| `DATABASE_HOST`          | PostgreSQL host          | Yes      | localhost   |
| `DATABASE_PORT`          | PostgreSQL port          | Yes      | 5432        |
| `JWT_SECRET`             | JWT secret key           | Yes      | -           |
| `JWT_ACCESS_EXPIRES_IN`  | Access token expiration  | No       | 15m         |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | No       | 7d          |
| `PORT`                   | Server port              | No       | 3333        |
| `MONGODB_URI`            | MongoDB connection URI   | Yes      | -           |
| `MONGODB_DATABASE`       | MongoDB database name    | Yes      | -           |
| `GMAIL_USER`             | Gmail username           | Yes      | -           |
| `GMAIL_APP_PASSWORD`     | Gmail app password       | Yes      | -           |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages
- Ensure all tests pass before submitting

## 📝 License

This project is **UNLICENSED** - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: travelmateaijourney@gmail.com
- **Issues**: [GitHub Issues](https://github.com/nhanbernie/travelmate-ai-server/issues)
- **Documentation**: [Wiki](https://github.com/nhanbernie/travelmate-ai-server/wiki)

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Powered by [TypeScript](https://www.typescriptlang.org/)
- Database integration with [MongoDB](https://www.mongodb.com/) and [PostgreSQL](https://www.postgresql.org/)

---

**Built with ❤️ for the Travelmate AI Project**
