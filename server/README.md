# SwimSphere Server Documentation

## Overview
SwimSphere is a full-stack web application designed to provide a platform for users to manage their swimming activities, track progress, and connect with other swimmers. This document outlines the server-side architecture, setup instructions, and API endpoints.

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT for authentication

## Project Structure
```
server
├── src
│   ├── controllers       # Contains request handlers for routes
│   ├── models            # Mongoose models for MongoDB
│   ├── routes            # API route definitions
│   ├── middleware        # Custom middleware for authentication and error handling
│   ├── config            # Configuration files (e.g., database connection)
│   ├── utils             # Utility functions
│   └── app.js            # Main application file
├── package.json          # NPM dependencies and scripts
└── README.md             # Project documentation
```

## Setup Instructions
1. **Clone the repository**
   ```
   git clone <repository-url>
   cd SwimSphere/server
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Configure the database**
   - Update the database connection settings in `src/config/database.js` to match your MongoDB setup.

4. **Run the server**
   ```
   npm start
   ```
   The server will start on the specified port (default is 5000).

## API Endpoints
### Authentication
- **POST /api/auth/register**: Register a new user.
- **POST /api/auth/login**: Authenticate a user and return a JWT.

### User Management
- **GET /api/user/profile**: Retrieve the authenticated user's profile.
- **PUT /api/user/profile**: Update the authenticated user's profile.

## Middleware
- **auth.js**: Middleware for protecting routes that require authentication.
- **errorHandler.js**: Middleware for handling errors throughout the application.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.