project Structure:

The-Daily-Drift-Backend/
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── models/
│   ├── User.js          # User schema
│   ├── Post.js          # Post schema
│   ├── Comment.js       # Comment schema
│   └── Analytic.js      # Analytics schema
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User management routes
│   ├── posts.js         # Post routes
│   ├── comments.js      # Comment routes
│   ├── analytics.js     # Analytics routes
│   └── admin.js         # Admin routes
├── .env                 # Environment variables
├── .gitignore           # Git ignore file
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation

-------------------------------------\
The Daily Drift Backend

The Daily Drift Backend is the server-side component of a modern blog platform, built with Node.js, Express, and MongoDB. 
It provides a robust API for user authentication, blog post management, comments, analytics, and admin functionalities. 
This project is designed for scalability and collaboration, with a development branch for ongoing work and pull requests to the main branch.
Table of Contents

Features
Tech Stack
Prerequisites
Installation

Environment Variables

Running the Application

API Endpoints

Project Structure


Contributing

License

Features

User Authentication: Register, login, and JWT-based authorization.

Blog Posts: Create, read, update, delete (CRUD) posts with search and like functionality.



Comments: Add and delete comments on posts.



Analytics: Track views, likes, and comments per post.



Admin Controls: Manage users and content (admin-only routes).



Rate Limiting: Prevent abuse with express-rate-limit.



MongoDB Integration: Persistent storage with MongoDB Atlas.



Scalable Architecture: Modular routes, middleware, and models.

Tech Stack





Node.js: v22.12.0



Express: v4.19.2



MongoDB: Atlas cloud database



Mongoose: v8.7.0 for MongoDB object modeling



JWT: jsonwebtoken v9.0.2 for authentication



bcryptjs: v2.4.3 for password hashing



express-rate-limit: v7.4.0 for rate limiting



nodemon: v3.1.7 for development



dotenv: v16.4.5 for environment variables

Prerequisites





Node.js: Install Node.js v22.12.0 or use nvm:

nvm install 22
nvm use 22



MongoDB Atlas: Create an account and set up a cluster at MongoDB Atlas.



Git: Install Git and configure your GitHub credentials.



GitHub CLI (optional): For easier PR creation.

Installation





Clone the Repository:

git clone https://github.com/Sabbirbracu/The-Daily-Drift-Backend.git
cd The-Daily-Drift-Backend



Switch to Development Branch:

git checkout development



Install Dependencies:

npm install



Set Up Environment Variables: Create a .env file in the root directory:

PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/blog?retryWrites=true&w=majority
JWT_SECRET=<your_jwt_secret>
