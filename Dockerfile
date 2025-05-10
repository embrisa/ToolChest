# Stage 1: Build
FROM eclipse-temurin:21-jdk as build

WORKDIR /app

COPY build.gradle.kts settings.gradle.kts gradlew ./
COPY gradle ./gradle
RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon || true

COPY . .
RUN ./gradlew shadowJar --no-daemon

# Stage 2: Run
FROM eclipse-temurin:21-jre

ARG PORT=8080
ENV PORT=${PORT}

WORKDIR /app

COPY --from=build /app/build/libs/ToolChest-all.jar /app/app.jar

# Create a non-root user and group (Debian/Ubuntu compatible)
RUN groupadd --system nonroot && \
    useradd --system --gid nonroot --no-create-home --shell /sbin/nologin nonroot
USER nonroot

EXPOSE ${PORT}

ENTRYPOINT ["java", "-Dio.ktor.development=false", "-jar", "/app/app.jar"]