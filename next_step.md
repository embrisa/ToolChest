## 2. Error Handling & Custom Error Pages (High Priority)

The current error handling is basic and lacks user-friendly error pages.

### Recommendations:

- Create custom error templates for common HTTP status codes:
  - Create `/templates/pages/error.ftl` with dynamic content based on error code
  - Enhance StatusPages plugin to use these templates
  
- Implement structured error responses for both UI and API endpoints:
  ```kotlin
  install(StatusPages) {
      status(HttpStatusCode.NotFound) { call, _ ->
          call.respond(FreeMarkerContent(
              "pages/error.ftl",
              mapOf(
                  "errorCode" to 404,
                  "errorTitle" to "Page Not Found",
                  "errorMessage" to "The page you're looking for doesn't exist."
              )
          ))
      }
      
      exception<Throwable> { call, cause ->
          // Log the error with structured information
          call.application.log.error("Unhandled exception", cause)
          
          call.respond(FreeMarkerContent(
              "pages/error.ftl",
              mapOf(
                  "errorCode" to 500,
                  "errorTitle" to "Internal Server Error",
                  "errorMessage" to "Something went wrong on our end. Please try again later."
              )
          ))
      }
  }
  ```