# Legislative News Aggregator Project

This project is a legislative news aggregator application built with Next.js (frontend and backend) and NestJS (external data service), with MySQL as the database. Docker is used to containerize the services for both development and production environments.

## Table of Contents
- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Setup and Run](#setup-and-run)
    - [Development Environment](#development-environment)
    - [Production Environment](#production-environment)
- [Docker Commands](#docker-commands)
- [Troubleshooting](#troubleshooting)
- [Repository Structure and Submodule Management](#repository-structure-and-submodule-management)
- [Stay in touch](#stay-in-touch)

## Project Overview

The project is composed of three main services:

1. **Next.js App** - Acts as both the frontend and backend for the legislative news aggregator. It provides the user interface for viewing, filtering, and searching legislative news. The backend in Next.js handles API requests and serves content for the frontend.

2. **NestJS Service** - A backend service responsible for importing news articles from external sources. This service continuously pulls data from public news APIs, stores the latest news in the MySQL database, and uses WebSockets to update the Next.js client in real-time.

3. **MySQL Database** - Stores all application data, including news articles, topics, and user preferences.

All services are defined and orchestrated using Docker Compose, simplifying the deployment and management process.

#### Subproject Documentation

1. **Next.js Application** (`legislative-news-aggregator-app/`): This is the main frontend and backend interface for the legislative news aggregator. It provides the user interface for viewing, filtering, and searching legislative news. The backend in Next.js handles API requests and serves content for the frontend.

2. **NestJS Service** (`news-aggregator-service/`): This backend service is responsible for importing news articles from external sources. It continuously pulls data from public news APIs, stores the latest news in the MySQL database, and uses WebSockets to update the Next.js client in real-time.

Each subproject has its own `README.md` file located within its directory, which provides detailed information about specific setup instructions, architectural details, and unique configuration options:

- [**Next.js Application README**](./legislative-news-aggregator-app/README.md)
- [**NestJS Service README**](./news-aggregator-service/README.md)

### Why It’s Important to Review Each README

Each `README.md` in the subprojects contains information specific to that service, including:

- **Unique Environment Variables**: Each service may require different or additional environment variables, which are explained in their respective documentation.
- **Service-Specific Commands**: Some Docker or development commands may differ between services.
- **Architectural Details**: Understanding the structure and purpose of each subproject helps in making modifications, debugging, and deploying changes more efficiently.

By reading the individual `README.md` files, you’ll gain a deeper understanding of each subproject's role, how they interact within the monorepo, and how to configure and run them independently if needed. This will help ensure that you have a complete understanding of the entire application.

## Prerequisites

Ensure the following software is installed on your local machine:

- Docker
- Docker Compose

## Configuration

### Environment Variables

Environment variables are managed using a `.env` file. A sample environment file (`.env.local`) is included in the repository. To configure the application, you can either:

1. **Rename the sample file**: Copy or rename `.env.local` to `.env` and update the values as needed.
2. **Create a new `.env` file**: Use `.env.local` as a reference for the variables and their default values.

This ensures that the correct environment variables are loaded for Docker Compose in both development and production environments.

### Sample `.env.local` Content

```plaintext
# MySQL Database Configuration
MYSQL_ROOT_PASSWORD=password
MYSQL_DATABASE=legislative_news

# Database URL, used in both projects
DATABASE_URL="mysql://user:password@mysql:3306/legislative_news"

# Next.js environment variables
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_PAGINATION_LIMIT=10

# WebSocket URL for real-time updates
NEXT_PUBLIC_WS_URL=http://news-aggregator-service:3001/news
# For local testing, uncomment the following line
# NEXT_PUBLIC_WS_URL=http://localhost:3001/news

# Authentication (for testing, contact rafaelleivwk@gmail.com for API key)
AUTH_SECRET=""  # Added by `npx auth`. Read more: https://cli.authjs.dev
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# NestJS API Configuration
NEST_API_PORT=3001

# External News API Configuration
NEWS_API_KEY=""
NEWS_API_URL="https://newsapi.org/v2/top-headlines"

# Swagger Documentation
SWAGGER_TITLE="Legislative News API"
SWAGGER_DESCRIPTION="API for managing legislative news"
```

### Environment Variables Description

- **`MYSQL_ROOT_PASSWORD`**, **`MYSQL_DATABASE`**, **`DATABASE_URL`**: Configuration settings for the MySQL database, where all news articles, topics, and user data are stored.
- **`NEXT_PUBLIC_API_URL`**: The base URL for the Next.js API, used for making API calls from the frontend.
- **`NEXT_PUBLIC_PAGINATION_LIMIT`**: The maximum number of articles displayed per page in paginated views.
- **`NEXT_PUBLIC_WS_URL`**: WebSocket URL for real-time updates on news articles.
- **`AUTH_SECRET`**, **`AUTH_GITHUB_ID`**, **`AUTH_GITHUB_SECRET`**: Credentials for GitHub OAuth integration and session security.
- **`NEST_API_PORT`**: Port for the NestJS API service.
- **`NEWS_API_KEY`** and **`NEWS_API_URL`**: # News api key (https://newsapi.org/) Configuration for connecting to an external news API.
- **`SWAGGER_TITLE`** and **`SWAGGER_DESCRIPTION`**: Metadata for Swagger API documentation.

**Important**: Never commit sensitive information (e.g., database passwords, API keys) to version control. Use tools like Docker secrets or environment variable management solutions in production if needed.

## Setup and Run

### Development Environment

1. **Prepare the `.env` file**: Ensure that all necessary environment variables are set in the `.env` file in the root of the project.

2. **Run Docker Compose for Development**: Use the following command to start the services in development mode. The configuration file `docker-compose.dev.yml` should define mappings to local files to support hot-reloading.

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

   This will:
    - Start the Next.js app (frontend and backend) on `http://localhost:3000`.
    - Start the NestJS service for news import and WebSocket updates on `http://localhost:3001`.
    - Start the MySQL database and persist data to a local volume (`mysql_data`).

### Production Environment

1. **Prepare Environment Variables**: Ensure that all environment variables for production are set in the `.env` file or environment management solution.

2. **Run Docker Compose for Production**: Use the following command to start the services in production mode, which should run with optimizations and without local file mappings.

   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

   This will:
    - Run the services in detached mode (`-d`), allowing them to continue running in the background.
    - Build and optimize the Next.js and NestJS images for production.
    - Use the `.env` file for environment-specific configuration.

## Docker Commands

### Common Commands

You will need to specify the configuration file when running Docker Compose commands to ensure the correct environment settings are used.

```bash
# Start services in development mode
docker-compose -f docker-compose.dev.yml up --build

# Stop and remove production containers
docker-compose -f docker-compose.prod.yml down -v
```

### Individual Service Commands

- **Restart Next.js service**:
  ```bash
  docker-compose restart legislative-news-app
  ```

- **Restart NestJS service**:
  ```bash
  docker-compose restart news-aggregator-service
  ```

- **Access MySQL CLI**:
  ```bash
  docker exec -it legislative-news-mysql mysql -u root -p
  ```

## Troubleshooting

- **Can't connect to MySQL**: Ensure `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, and other related environment variables are correctly set in `.env`. Verify that the database service is running with `docker-compose ps`.

- **Updating Code in Development**: If code changes are not reflected, ensure that volumes are correctly mapped for hot-reloading in the `docker-compose.dev.yml` configuration.

## Repository Structure and Submodule Management

This project uses a monorepo setup with Git submodules to manage multiple projects independently within a single repository:

- `legislative-news-aggregator-app/`: Next.js application.
- `news-aggregator-service/`: NestJS service for external news aggregation.

Using Git submodules allows each project to have its own repository, enabling independent version control, isolated deployments, and centralized management of shared configurations.

## !! Important !!

# Use this credential to log in manual or use Github OAuth
email = 'johndoe@example.com'
password = 'test123'

Using a seed file, the user will be created with the email and password above.

## Stay in touch

- **Author**: Rafael Leyva
- **License**: Free to use and modify.
- **Contact**: rafaelleiv@gmail.com
