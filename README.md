# Blog REST API

This is a simple REST API for a blog, built using Node.js and Express. It provides basic functionality for user authentication, post creation, retrieval, updating, and deletion. The API utilizes JSON Web Tokens (JWT) for user authentication and authorization.

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

### Installation

1. Clone the repository:

   `git clone https://github.com/yourusername/blog-api.git`

2. Navigate to the project directory:

   `cd blog-api`

3. Install dependencies:

   `npm install`

4. Create a `.env` file in the project root and set the following variables:

   `JWT_SECRET=your_secret_key`

5. Start the server:

   `npm start`

The server will be running at `http://localhost:3000`.

## API Endpoints

### 1. Welcome

- **Endpoint:** `/`
- **Method:** `GET`
- **Description:** Returns a welcome message.

### 2. User Login

- **Endpoint:** `/login`
- **Method:** `POST`
- **Description:** Authenticates the user and returns a JWT.

### 3. User Registration

- **Endpoint:** `/register`
- **Method:** `POST`
- **Description:** Registers a new user.

### 4. Get All Posts

- **Endpoint:** `/posts`
- **Method:** `GET`
- **Description:** Retrieves all blog posts.

### 5. Get Post Detail

- **Endpoint:** `/posts/:id`
- **Method:** `GET`
- **Description:** Retrieves details of a specific blog post.

### 6. Create Post (Protected)

- **Endpoint:** `/posts/create`
- **Method:** `POST`
- **Description:** Creates a new blog post.

### 7. Delete Post (Protected)

- **Endpoint:** `/posts/:id`
- **Method:** `DELETE`
- **Description:** Deletes a blog post.

### 8. Edit Post (Protected)

- **Endpoint:** `/posts/:id`
- **Method:** `PATCH`
- **Description:** Edits an existing blog post.

## Middleware

### 1. Set Token

- **Description:** Middleware for setting the JWT token for authenticated routes.

## Controllers

### 1. Auth Controller

- **Description:** Handles user authentication and registration.

### 2. Posts Controller

- **Description:** Manages CRUD operations for blog posts.

## Validation

Validation is implemented using express-validator for creating and editing posts.

## Note

- The API uses MongoDB as the database.

Feel free to customize and extend this API based on your project requirements. If you have any questions or suggestions, please open an issue or submit a pull request. Happy coding!
