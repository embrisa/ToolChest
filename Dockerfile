# Stage 1: Build
FROM eclipse-temurin:21-jdk as build

WORKDIR /app
COPY . .
RUN ./gradlew shadowJar --no-daemon

# Stage 2: Run
FROM eclipse-temurin:21-jre

# If you want to support Railway's $PORT environment variable
ARG PORT=8080
ENV PORT=${PORT}

WORKDIR /app
COPY --from=build /app/build/libs/*-all.jar app.jar

# Optional security: run as non-root
RUN useradd runtime
USER runtime

EXPOSE ${PORT}

ENTRYPOINT ["java", "-Dio.ktor.development=false", "-port=8080", "-jar", "app.jar"]