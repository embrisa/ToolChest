# 🔍 Refactoring Research Phase

## Objective
Identify the most critical areas for refactoring in the ToolChest codebase and develop a comprehensive plan for implementation.

## Context Management Instructions

### Managing Limited Context Window
LLM code agents can only process 3-5 files in memory at once. Follow these guidelines:
- **Incremental Analysis**: Analyze the codebase in logical batches (e.g., by package or feature)
- **Prioritized Loading**: Load core/critical files first, then peripheral files
- **Context Clearing**: Document when you're clearing your context to load new files
- **Checkpoint Summaries**: Create brief summaries after analyzing each component

### File Processing Strategy
1. Start with high-level architecture files (Application.kt, config files)
2. Process files in related functional groups (e.g., one service + related routes)
3. Examine test files to understand expected behavior
4. For larger files (>200 lines), focus on structure before details
5. Document intermediate findings before moving to the next batch

## Output Format Requirements

### File Naming Convention
Each research iteration must generate uniquely named files to track progress over time:

1. Generate a timestamp in the format `YYYYMMDD_HHMMSS` (e.g., `20250412_143027`)
2. Use this timestamp consistently in all file names for a given research iteration
3. Include a brief slug describing the research focus when appropriate

### Structured Research Output
Save your analysis in a machine-readable JSON format file at `.github/refactoring/research_findings_{timestamp}.json` with the following structure:

```json
{
  "meta": {
    "timestamp": "YYYY-MM-DD HH:MM:SS",
    "version": "1.0",
    "iteration_id": "{timestamp}",
    "focus": "Brief description of research focus"
  },
  "summary": {
    "criticalIssues": [
      {
        "title": "Brief issue title",
        "description": "Detailed description",
        "severity": 1-10,
        "effortRequired": 1-10,
        "impactRating": 1-10
      }
    ],
    "overallAssessment": "Brief overview of codebase health"
  },
  "codebaseAnalysis": {
    "architecture": {
      "findings": [],
      "recommendations": []
    },
    "technicalDebt": {
      "findings": [],
      "recommendations": []
    },
    "performance": {
      "findings": [],
      "recommendations": []
    },
    "maintainability": {
      "findings": [],
      "recommendations": []
    },
    "testability": {
      "findings": [],
      "recommendations": []
    }
  },
  "prioritizedRefactorings": [
    {
      "id": "unique-id",
      "title": "Refactoring title",
      "description": "Detailed description",
      "affectedComponents": ["list of files/components"],
      "priority": 1-10,
      "effort": 1-10,
      "impact": 1-10,
      "risk": 1-10,
      "implementationSteps": []
    }
  ],
  "detailedFindings": {
    "codeSmells": [
      {
        "type": "Smell type (duplication, large class, etc.)",
        "location": "File/class/method",
        "description": "Description of the issue",
        "remediation": "How to fix"
      }
    ],
    "architecturalIssues": [],
    "performanceBottlenecks": [],
    "testingGaps": []
  },
  "previousFindings": {
    "references": [
      {
        "timestamp": "YYYY-MM-DD HH:MM:SS", 
        "filePath": ".github/refactoring/research_findings_{previous_timestamp}.json",
        "focus": "Brief description of previous research focus"
      }
    ],
    "progressSummary": "Brief description of progress since last research iteration"
  }
}
```

## Instructions

### Research Requirements
- Thoroughly analyze the current codebase architecture and structure
- Identify code smells, technical debt, and architectural issues
- Evaluate performance bottlenecks and scalability constraints
- Assess maintainability, testability, and readability of the codebase
- Research best practices and patterns applicable to Ktor/Kotlin monoliths

### Key Questions to Answer
- What are the most pressing architectural or structural issues in the codebase?
- Which components have the highest technical debt or complexity?
- Are there performance bottlenecks that impact user experience or scalability?
- Which refactoring would provide the greatest benefit with minimal risk?
- How do the proposed changes align with the project's architectural principles?
- What code duplication or violation of DRY principles exists?
- Are there areas where the separation of concerns could be improved?
- How can testability be enhanced through the refactoring?

### Analysis Process
1. **Code Structure Review**: Analyze the organization of packages, classes, and files
   - Process each package directory separately
   - Create summary notes before moving to the next package
2. **Dependency Analysis**: Identify problematic coupling between components
   - Map dependencies between 3-5 related components at a time
   - Document relationships before loading the next component group
3. **Complexity Assessment**: Locate overly complex methods or classes
   - For large files, scan headers/signatures first, then explore details
   - Checkpoint your findings after each significant file
4. **Test Coverage Evaluation**: Find undertested or difficult-to-test areas
5. **Performance Profiling**: Identify inefficient algorithms or resource usage
6. **Pattern Consistency**: Check for inconsistent implementation patterns
   - Document patterns by component before comparing across components

### Deliverables
- **Priority-Ranked Issues**: List of refactoring opportunities ranked by impact/effort
- **Root Cause Analysis**: Explanation of why these issues exist and their consequences
- **Refactoring Proposal**: Detailed plan for implementing the most critical refactoring
- **Migration Strategy**: How to implement changes while minimizing disruption
- **Test Strategy**: Approach for verifying refactoring doesn't introduce regressions
- **Timeline Estimate**: Rough estimation of effort required for implementation

### Incremental Analysis Guidelines
When analyzing large codebases, follow this incremental process:
1. **First Pass**: Catalog all files and create a component relationship map (without loading file contents)
2. **Component Focus**: Select a core component and load only its related 3-5 files
3. **Document & Clear**: Save findings about that component before clearing context
4. **Integration Analysis**: After all components are analyzed, load only the summary findings to identify cross-component issues
5. **Sample-Based Analysis**: For pattern consistency, select representative samples rather than trying to examine all instances

## ToolChest Architecture Context

### Project Structure
Use following commands to see project structure: `find src/ -type f`

### Key Architectural Principles
- **Monolithic Design**: Single Ktor application with all routes, services, and rendering
- **Server-Side Rendering**: FreeMarker templates with HTMX for dynamic interactions
- **Service Layer Pattern**: Business logic encapsulated in service classes
- **Dependency Injection**: Koin for managing dependencies
- **Caching Strategy**: Local Caffeine Cache + browser caching with HTTP headers
- **SEO-Friendly**: Server-side rendering first with semantic HTML

### Technology Stack
- **Backend**: Kotlin with Ktor framework
- **Frontend**: HTMX + Tailwind CSS (via CDN)
- **Templates**: FreeMarker for server-side rendering
- **Database**: SQLite initially (migration path to PostgreSQL)
- **Caching**: Caffeine Cache (in-memory)
- **Deployment**: Direct PaaS deployment (no Docker)

## Refactoring Evaluation Criteria

### Impact Assessment
Rate each potential refactoring by:
- **User Impact**: How much it improves user experience
- **Developer Experience**: How much it improves code maintainability
- **Performance Gain**: Expected performance improvement
- **Risk Level**: Potential for introducing regressions
- **Effort Required**: Complexity and time needed for implementation

### Code Quality Metrics
Look for improvements in:
- **Cyclomatic Complexity**: Reducing conditional complexity
- **Coupling**: Reducing dependencies between components
- **Cohesion**: Ensuring classes have single responsibilities
- **Test Coverage**: Improving testability and actual coverage
- **Duplication**: Eliminating repeated code
- **Readability**: Enhancing naming, documentation, and structure

## Refactoring Guidelines

### Architecture Considerations
- Maintain monolithic design while improving internal modularity
- Ensure changes support the SSR + HTMX approach
- Consider impact on caching and performance
- Preserve SEO-friendliness of the solution


!!DO NOT UNDER ANY CIRCUMSTANCES CHANGE ANY CODE IN THE CODEBASE - ONLY WRITE RESEARCH!!