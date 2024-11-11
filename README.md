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

## Project Overview

The project is composed of three main services:

1. **Next.js App** - Acts as both the frontend and backend for the legislative news aggregator. It provides the user interface for viewing, filtering, and searching legislative news. The backend in Next.js handles API requests and serves content for the frontend.

2. **NestJS Service** - A backend service responsible for importing news articles from external sources. This service continuously pulls data from public news APIs, stores the latest news in the MySQL database, and uses WebSockets to update the Next.js client in real-time.

3. **MySQL Database** - Stores all application data, including news articles, topics, and user preferences.

All services are defined and orchestrated using Docker Compose, simplifying the deployment and management process.

## Prerequisites

Ensure the following software is installed on your local machine:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Configuration

### Environment Variables

All environment variables are stored in a `.env` file in the root of the project. This file is loaded by Docker Compose for both the Next.js app and the NestJS service.

**Sample `.env` file**:

```dotenv
# Database
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=legislative_news
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password

# Application
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Important:** Never commit sensitive information (e.g., database passwords) to version control. Use tools like Docker secrets or environment variable management solutions in production if needed.

## Setup and Run

### Development Environment

1. **Prepare the `.env` file**:
   Ensure that all necessary environment variables are set in the `.env` file in the root of the project.

2. **Run Docker Compose for Development**:
   Use the following command to start the services in development mode. The configuration file `docker-compose.dev.yml` should define mappings to local files to support hot-reloading.

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

   This will:
    - Start the Next.js app (frontend and backend) on [http://localhost:3000](http://localhost:3000).
    - Start the NestJS service for news import and WebSocket updates on [http://localhost:3001](http://localhost:3001).
    - Start the MySQL database and persist data to a local volume (`mysql_data`).

### Production Environment

1. **Prepare Environment Variables**:
   Ensure that all environment variables for production are set in the `.env` file or environment management solution.

2. **Run Docker Compose for Production**:
   Use the following command to start the services in production mode, which should run with optimizations and without local file mappings.

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

*docker-compose -f docker-compose.dev.yml up --build*
<br>
*docker-compose -f docker-compose.prod.yml down -v*

- **Build and start the containers**:
  ```bash
  docker-compose up --build
  ```

- **Stop and remove all containers**:
  ```bash
  docker-compose down
  ```

- **Stop and remove all containers, networks, and volumes** (useful for a fresh setup):
  ```bash
  docker-compose down -v
  ```

- **View logs**:
  ```bash
  docker-compose logs -f
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

Aquí tienes una sección adicional para el `README.md` que explica cómo utilizar el prefijo de proyecto en Docker Compose para ejecutar múltiples entornos simultáneamente:

---

### Running Multiple Environments Simultaneously

In some cases, you may want to run both the development and production environments at the same time. Docker Compose allows you to set a custom project name using the `--project-name` (or `-p`) option, which changes the prefix of container names. This helps you differentiate containers between environments, avoiding naming conflicts and enabling parallel execution.

#### Usage

To run the development and production environments simultaneously, use the following commands:

- **Development Environment**:

  ```bash
  docker-compose -f docker-compose.dev.yml --project-name state-affairs-dev up --build
  ```

- **Production Environment**:

  ```bash
  docker-compose -f docker-compose.prod.yml --project-name state-affairs-prod up --build
  ```

#### Utility

Using custom project names allows you to:
- **Avoid naming conflicts** between containers in different environments.
- **Run multiple environments simultaneously**, enabling you to test both setups on the same machine without interference.

This feature is especially useful for **testing** and **debugging** both development and production environments side-by-side.

## Troubleshooting

- **Can't connect to MySQL**:
  Ensure `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, and other related environment variables are correctly set in `.env`. Verify that the database service is running with `docker-compose ps`.

- **Updating Code in Development**:
  If code changes are not reflected, ensure that volumes are correctly mapped for hot-reloading in the `docker-compose.dev.yml` configuration.

### Stay in touch

- Author - [Rafael Leyva](https://github.com/rafaelleiv)

### License

Free to use and modify. 
