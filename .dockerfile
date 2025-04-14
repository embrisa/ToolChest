# Use an official OpenJDK 17 image as build environment
FROM gradle:8.3.0-jdk17 AS build
WORKDIR /app
COPY . .
RUN gradle shadowJar --no-daemon

# Use a smaller JRE image for running the app
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/ToolChest-all.jar /app/ToolChest-all.jar

# Expose the port your app runs on (Railway will set $PORT)
EXPOSE 8080

# Start the app
CMD ["java", "-jar", "/app/ToolChest-all.jar"]