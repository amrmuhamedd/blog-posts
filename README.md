# Blog REST API Documentation

## Introduction

Welcome to the Blog REST API documentation. This API allows users to register, log in, create posts, list posts, edit user-related posts, and delete user-related posts. It provides basic functionality for managing a blog.

## Tech Stack

The Blog REST API is built using the following technologies:

- **Node.js**: The server-side environment for running JavaScript.
- **Express.js**: A fast and minimalist web framework for Node.js.
- **Prisma**: An ORM (Object-Relational Mapping) for database interactions.
- **PostgreSQL**: A powerful, open-source relational database.
- **JWT (JSON Web Tokens)**: For secure authentication and authorization.
- **Swagger**: For API documentation.
- **Docker**: For containerization and deployment.

## Thought Process

### Project Structure

The project is organized into the following components:

- **Controllers**: Responsible for handling HTTP requests and responses.
- **Routes**: Define the API endpoints and connect them to controller functions.
- **Middleware**: Contains custom middleware functions, such as authentication.
- **Validators**: Define input validation schemas using libraries like express-validator.
- **Prisma Schema**: Defines the database schema and model relationships.
- **Docker Configuration**: Provides Dockerfile and docker-compose.yml for containerization.
- **Environment Variables**: Utilizes a `.env` file for sensitive configuration.
- **Swagger Configuration**: For auto-generating API documentation.

### Assumptions

- It's assumed that you have Docker and Node.js installed on your development machine.
- PostgreSQL is used as the preferred database, but you can switch to MongoDB by modifying the Prisma schema and database configuration.
- The project assumes a basic understanding of RESTful APIs and JavaScript/Node.js development.

## Getting Started

Follow these instructions to run the project locally using Node js:

1. Clone the project repository to your local machine:

   ```bash
   git clone <repository_url>
   cd <project_directory>

1. Create a .env file in the project root and configure the following environment variables:

```bash
PORT=3000
DATABASE_URL= postgres://<db_user>:<db_password>@<db_host>:<db_port>/<db_name>
SECRET_KEY=<your_secret_key>
```
2. install debndaceis

```bash
yarn install
```
3. Run database migrations: 
```bash
yarn migrate
```

4. Start the development server:
   
```bash
yarn dev
```

Now you can see your API docs at: `http://localhost:3000/api-docs/#/`
## Running with Docker

after cloning the repo just run: 
```bash
docker-compose up --build
```
Now you can see your API docs at: `http://localhost:3000/api-docs/#/`


## live preview 

you can see the live preview [here](https://blog-post-ppzc.onrender.com/api-docs/#/)

### Note: this is free host so it may take some time to launch instance
## At the end 
Please refer to the Swagger documentation for detailed information on each endpoint and how to use them.

If you have any questions or encounter issues, feel free to reach out for assistance. Happy coding!
