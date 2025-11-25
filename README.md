# PocketLLM

USC CSCI 578 Final Project

# Environment Setup

## Create Anything

1. Install node v22.20.0.
2. Go to `./create-anything/apps/web` and run `npm install --legacy-peer-deps` to install dependencies.
3. run `npm run dev` to start the development server.

## Java

1. Download Intellij Community Edition from [here](https://www.jetbrains.com/idea/download/other.html) and install it.
2. Install Java JDK 17 and set `CLASSPATH`.
3. Open `backend` directory in Intellij. Add `spring-boot:run` as maven Run and set `JDK 17` as Java Options.
4. Build and run the project either through IntelliJ’s run button or via terminal using `mvn install` followed by `mvn spring-boot:run`.
   * On first startup, the application will automatically create `./backend/sqlite.db` and generate all tables defined by your JPA Entities.
   * To avoid race conditions when writing to `sqlite.db`, the database uses `journal_mode=WAL`.
5. Open your browser and go to [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) to try creating, reading, updating, and deleting Users directly from the Swagger UI.

### Project Structure

```
.
├── controller
│   # Controllers handle HTTP requests from the frontend (GET, POST, PUT, DELETE)
│   # They call Repositories (or Services) to fetch/store data and return it to the frontend
│
├── model
│   # This folder contains all data models used in the project (Entities, Request objects)
│   ├── entity
│   │   # Stores JPA Entity classes. Each Entity corresponds to a database table
│   │   # Example: User.java corresponds to the 'users' table
│   │
│   └── req
│       # Used to receive data sent from the frontend (e.g., CreateUserReq)
│
├── PocketllmApplication.java
│   # Main entry point of the Spring Boot application
│
└── repository
    # Repositories handle database operations (CRUD). Usually extend JpaRepository or CrudRepository
    # Example: UserRepository provides methods like findAll(), findById(), save(), delete(), etc.
```