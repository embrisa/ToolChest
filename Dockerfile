# Stage 1: Build the application
FROM gradle:8.3.0-jdk17 AS build
WORKDIR /app
COPY . .
RUN gradle shadowJar --no-daemon

# Stage 2: Run the application
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/ToolChest-all.jar /app/ToolChest-all.jar
EXPOSE 8080
CMD ["java", "-jar", "/app/ToolChest-all.jar"]