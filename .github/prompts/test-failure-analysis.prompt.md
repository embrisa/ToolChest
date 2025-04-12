# 🔍 Test Failure Analysis & Fix Planning

## Objective
Investigate failing tests in the ToolChest codebase, understand the root causes, and develop a comprehensive plan for fixing them.

## Context Management Instructions

### Managing Limited Context Window
LLM code agents can only process 3-5 files in memory at once. Follow these guidelines:
- **Incremental Analysis**: Analyze test failures in logical batches (e.g., by test class or functional area)
- **Prioritized Loading**: Load failing tests first, then related implementation files
- **Context Clearing**: Document when you're clearing your context to load new files
- **Checkpoint Summaries**: Create brief summaries after analyzing each test failure

### File Processing Strategy
1. Start with test output logs to identify failing tests
2. Load failing test files to understand expected behavior
3. Load the related implementation files being tested
4. Examine any dependency files that might contribute to failures
5. Document findings before moving to the next test failure

### Project Structure
Use following commands to see project structure: `find src/ -type f`

## Output Format Requirements

### File Naming Convention
Each analysis must generate uniquely named files to track progress:

1. Generate a timestamp in the format `YYYYMMDD_HHMMSS` (e.g., `20250412_143027`)
2. Use this timestamp consistently in all file names for a given analysis
3. Include a brief slug describing the test failures when appropriate

### Structured Analysis Output
Save your analysis in a machine-readable JSON format file at `.github/test-fixes/test_failure_analysis.json` (overwrite existing file - .github/test-fixes also already exist) with the following structure:

```json
{
  "meta": {
    "timestamp": "YYYY-MM-DD HH:MM:SS",
    "version": "1.0",
    "iteration_id": "{timestamp}",
    "focus": "Analysis of failing tests"
  },
  "summary": {
    "failingTests": [
      {
        "testClass": "ClassName",
        "testMethod": "methodName",
        "errorMessage": "Error message from test output",
        "severity": 1-10,
        "fixComplexity": 1-10,
        "priority": 1-10
      }
    ],
    "overallAssessment": "Brief overview of test failures"
  },
  "testAnalysis": {
    "diagnostics": {
      "findings": [],
      "commonPatterns": []
    },
    "rootCauses": {
      "findings": [],
      "categories": []
    },
    "dependencies": {
      "findings": [],
      "impactedComponents": []
    },
    "dataIssues": {
      "findings": [],
      "missingTestData": []
    }
  },
  "detailedFindings": [
    {
      "testId": "com.toolchest.TestClass.testMethod",
      "failureType": "AssertionError|NullPointerException|etc",
      "stackTrace": "Relevant portion of stack trace",
      "description": "Detailed description of the failure",
      "relatedFiles": ["path/to/implementation.kt", "path/to/test.kt"],
      "rootCause": "Description of root cause",
      "potentialFixes": [
        {
          "approach": "Description of fix approach",
          "complexity": 1-10,
          "impact": "What side effects this fix might have",
          "confidenceLevel": 1-10
        }
      ]
    }
  ],
  "fixPlan": {
    "prioritizedFixes": [
      {
        "id": "fix-1",
        "testId": "com.toolchest.TestClass.testMethod",
        "title": "Brief title of the fix",
        "description": "Detailed description of the fix",
        "files": ["path/to/file1.kt", "path/to/file2.kt"],
        "steps": [
          {
            "stepId": "step-1",
            "description": "Detailed description of this step",
            "fileChanges": [
              {
                "filePath": "path/to/file.kt",
                "changeType": "MODIFY|CREATE",
                "lineRange": "10-20",
                "codeChange": "Description of code change"
              }
            ]
          }
        ],
        "validation": "How to validate this fix works",
        "priority": 1-10,
        "effort": 1-10,
        "risk": 1-10
      }
    ],
    "testingStrategy": "Overall approach to testing the fixes",
    "implementationOrder": "Recommended order of implementation",
    "riskMitigation": "Strategies to mitigate any risks"
  }
}
```

## Instructions

### Analysis Requirements
- Thoroughly analyze test failure logs and error messages
- Identify the exact location in the code where failures occur
- Determine whether failures are in the test code or implementation code
- Identify common patterns or shared root causes across multiple failures
- Research dependencies and environmental factors that might contribute to failures

### Analysis Process
1. **Failure Classification**: Categorize failures by type (assertion, exception, timeout, etc.)
2. **Stack Trace Analysis**: Locate the exact point of failure in code
3. **Test-Implementation Comparison**: Check if test expectations match implementation reality
4. **Dependency Investigation**: Check if library or service dependencies are causing issues
5. **Code Evolution Analysis**: Look for recent changes that could have introduced failures
6. **Pattern Recognition**: Identify common patterns across multiple failures

### Core Components to Investigate
For each failing test:
1. **Test File**: Understand what the test is expecting
2. **Implementation File**: Check if the code implements what the test expects
3. **Related Services**: Check if the services the code relies on are working correctly
4. **Test Data**: Verify if test data is valid and available
5. **Environment Config**: Check if environment-specific settings are correct

### Fix Planning Process
1. **Prioritize Failures**: Rank failures by impact, difficulty, and dependencies
2. **Group Related Fixes**: Identify failures that can be fixed together
3. **Create Detailed Steps**: Break each fix into specific code change steps
4. **Consider Side Effects**: Identify potential impacts of each fix
5. **Define Validation Methods**: Specify how to verify each fix works
6. **Create Implementation Order**: Determine the optimal sequence for fixes

## ToolChest Testing Context

### ToolChest Test Framework Architecture
- **Kotlin Test**: Primary testing framework with `@Test`, `@BeforeTest`, and `@AfterTest` annotations
- **Ktor Testing**: Server-side testing with `testApplication` and `ApplicationTestBuilder`
- **MockK**: Mocking library with `mockk()`, `every`, `verify` functions for service mocks
- **Koin DI**: Dependency injection with special test module configuration
- **Jsoup**: HTML parsing for template/UI component verification
- **Exposed**: SQL framework with SQLite for database tests

### ToolChest Test Base Classes & Utilities
- **KoinBaseTest**: Base class that provides automatic Koin setup/teardown
  - Crucial `setupKoin()` and `tearDownKoin()` methods using `@BeforeTest` and `@AfterTest`
  - `provideTestModules()` method for test-specific dependency configuration
- **MockServices**: Helper object for creating standard mock services
  - `setupMockKoin()` method creates and configures test dependencies
  - `tearDownKoin()` method ensures cleanup after tests
- **Test Utility Functions**:
  - `configureFreeMarkerForTests()`: Sets up template engine for isolated tests
  - `configureApplicationForTests()`: Configures app without initializing Koin
  - `createTestApp()`: Creates isolated test application environments
  - `tableExists()`: Helper for database table verification

### Key Test Types in ToolChest
1. **Service Tests**: 
   - Test service implementations directly
   - Use mockk for dependencies
   - Example: `Base64ServiceImplTest.kt`

2. **Route Tests**:
   - Test HTTP endpoints within `testApplication` blocks
   - Verify status codes and response content
   - Example: `HomeRoutesTest.kt`

3. **Template Tests**:
   - Verify HTML output from FreeMarker templates
   - Use Jsoup for parsing and validating content
   - Example: `UIComponentsTest.kt`

4. **Database Tests**:
   - Use in-memory SQLite for isolation
   - Set up/tear down database files in `@BeforeTest`/`@AfterTest`
   - Example: `DatabaseConfigTest.kt`

5. **Error Handling Tests**:
   - Custom status pages and exception handling
   - HTMX-specific error response patterns
   - Example: `ErrorHandlingTest.kt`

### Common ToolChest Testing Pitfalls
1. **Koin State Leakage**:
   - Missing `stopKoin()` calls between tests
   - Not using `KoinBaseTest` for proper cleanup
   - Not checking `GlobalContext.getOrNull()` before stopping Koin

2. **Database Resource Cleanup**:
   - Not deleting test database files in `@AfterTest`
   - Missing parent directory creation with `mkdirs()`

3. **Template Resource Access**:
   - Missing template resources in test context
   - Incorrect template loader configuration

4. **Test Isolation Issues**:
   - Tests that depend on global state
   - Tests that don't reset environment between runs

5. **HTMX Testing Challenges**:
   - Missing HTMX request headers in test requests
   - Not handling both full page and partial responses


!!DO NOT UNDER ANY CIRCUMSTANCES CHANGE ANY CODE IN THE CODEBASE - ONLY WRITE A PLAN FOR CHANGES!!
!!THE FINAL STEP IS TO CREATE A JSON FILE WITH THE ANALYSIS AND FIX PLAN - SUPER IMPORTANT!!