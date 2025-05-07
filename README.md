# The Daily Drift - Blog Platform Backend

## Description
This is the backend API for **The Daily Drift** blog platform, built using **Node.js**, **Express**, **MongoDB**, and **JWT** for authentication. The platform allows users to register, log in, manage their blog posts, and reset passwords.

### Features
- **User Registration**: Create an account with email, password, and name.
- **User Login**: Authenticate and get a JWT access token.
- **Password Reset**: Secure password reset using a token sent via email.
- **Email Verification**: Verify email during registration.
- **Role-Based Access**: Roles for users and admins.

## Table of Contents
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Password Reset Functionality](#password-reset-functionality)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Technologies Used
- **Node.js**: JavaScript runtime for building the server.
- **Express**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing user and post data.
- **Mongoose**: MongoDB object modeling for Node.js.
- **JWT**: For secure user authentication.
- **Nodemailer**: For sending email notifications like password reset links.
- **bcryptjs**: For hashing passwords.

## Installation
Follow these steps to set up the project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/the-daily-drift-backend.git
Install dependencies:
Navigate to the project directory and install the required dependencies:

bash
Copy
Edit
cd the-daily-drift-backend
npm install
Set up environment variables:
Create a .env file in the root directory of the project and add the following variables:

bash
Copy
Edit
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
Start the server:
Run the application using nodemon for automatic restarts during development:

bash
Copy
Edit
npm run dev
The server will be running on http://localhost:5000.

Environment Variables
MONGO_URI: MongoDB connection string (required).

JWT_SECRET: Secret key for signing JWT tokens (required).

PORT: The port on which the backend will run (default: 5000).

FRONTEND: The URL of the frontend application (for CORS).

EMAIL_USER: The email address from which reset password emails will be sent.

EMAIL_PASS: The password of the email address from which reset password emails will be sent.

API Endpoints
Authentication
POST /api/auth/register
Description: Register a new user.

Request Body:

json
Copy
Edit
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
POST /api/auth/login
Description: Log in a user and receive a JWT token.

Request Body:

json
Copy
Edit
{
  "email": "user@example.com",
  "password": "password123"
}
POST /api/auth/forgot-password
Description: Request a password reset email.

Request Body:

json
Copy
Edit
{
  "email": "user@example.com"
}
POST /api/auth/reset-password/:token
Description: Reset password using the reset token.

Request Body:

json
Copy
Edit
{
  "newPassword": "newpassword123"
}
User Routes
GET /api/users: Get a list of users.

GET /api/users/:id: Get user details by ID.

Post Routes
GET /api/posts: Get all blog posts.

GET /api/posts/:id: Get details of a specific post.

POST /api/posts: Create a new post (admin only).

PUT /api/posts/:id: Update a post (admin only).

DELETE /api/posts/:id: Delete a post (admin only).

Password Reset Functionality
Forgot Password
When a user forgets their password, they can request a password reset email by providing their email.

A reset token is generated, hashed, and stored in the database.

The user receives a reset link containing the token in the email.

The reset link expires after 1 hour.

Endpoint:

POST /api/auth/forgot-password

Request Body:

json
Copy
Edit
{
  "email": "user@example.com"
}
Response:

json
Copy
Edit
{
  "message": "Reset link sent",
  "resetURL": "http://yourfrontend.com/reset-password/:token"
}
Reset Password
The user clicks the reset password link, which contains the reset token.

The user provides a new password.

The server validates the token and its expiration.

The new password is hashed and saved, and the reset token is cleared.

Endpoint:

POST /api/auth/reset-password/:token

Request Body:

json
Copy
Edit
{
  "newPassword": "newpassword123"
}
Response:

json
Copy
Edit
{
  "message": "Password successfully reset"
}
Testing
You can test the password reset functionality with the following steps:

Forgot Password:

Send a POST request to /api/auth/forgot-password with the user's email.

Check the email for the reset link.

Reset Password:

Click the reset link from the email.

Send a POST request to /api/auth/reset-password/:token with the new password.
