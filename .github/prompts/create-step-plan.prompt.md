# 📋 Refactoring Implementation Plan Creation

## Objective
Transform the approved critical refactoring into a detailed, step-by-step implementation plan that can be followed by developers or executed by an automated system.

## Context Management Instructions

### Limited Context Window Management
Since LLM code agents can only maintain 3-5 files in memory at once:

- **Step-Focused Planning**: Plan each implementation step with only the necessary files in context
- **Component Batch Processing**: Group related files into logical batches of 3-5 files
- **Dependency Simplification**: Use simplified representations of cross-file dependencies
- **Progressive Planning**: Create the plan incrementally, starting with core components

### File Processing Guidelines
1. **File Chunking**: For files larger than 200 lines, process in logical chunks
2. **Structure Over Details**: Focus on overall file structure before detailed implementation
3. **Context Preservation**: Document key insights before clearing context for new files
4. **Prioritization**: Address core/critical files first, then peripheral files
5. **Dependency Mapping**: Create a simple dependency graph to track relationships

## Output Format Requirements

### File Naming Convention
Each implementation plan must generate uniquely named files to track execution:

1. Use the same timestamp as the critical review being implemented
2. Add `-implementation-plan` suffix to differentiate from the research and review files
3. Include the specific refactoring focus in the slug (e.g., `service-layer-implementation`)

### Structured Implementation Plan Output
Save your implementation plan in a machine-readable JSON format file at `.github/refactoring/implementation_plan_{timestamp}.json` with the following structure:

```json
{
  "meta": {
    "timestamp": "YYYY-MM-DD HH:MM:SS",
    "version": "1.0",
    "plan_id": "{timestamp}-implementation-plan",
    "critical_review_id": "{timestamp}-critical-review",
    "refactoring_title": "Title from critical review"
  },
  "summary": {
    "title": "Brief title of implementation plan",
    "description": "Overview of what will be implemented",
    "estimatedEffort": "X person-hours",
    "dependencies": [
      "Any prerequisite tasks or knowledge"
    ],
    "componentGroups": [
      {
        "groupId": "group-1",
        "name": "Core Services",
        "files": ["path/to/file1.kt", "path/to/file2.kt"],
        "description": "Group of related files that should be processed together"
      }
    ]
  },
  "implementationSteps": [
    {
      "id": "step-1",
      "title": "Step title",
      "description": "Detailed description of the step",
      "componentGroupId": "group-1", 
      "files": [
        {
          "path": "Full file path",
          "changeType": "MODIFY|CREATE|DELETE",
          "changeDescription": "Description of changes"
        }
      ],
      "codeChanges": [
        {
          "filePath": "Full file path",
          "lineRangeStart": 10,
          "lineRangeEnd": 20,
          "beforeCode": "Code snippet before change",
          "afterCode": "Code snippet after change",
          "explanation": "Explanation of the change"
        }
      ],
      "validationMethod": "How to validate this step was successful",
      "rollbackProcedure": "How to undo this step if needed",
      "estimatedEffort": "X minutes",
      "dependsOn": ["step-id"] // IDs of steps this step depends on
    }
  ],
  "batchExecutionPlan": [
    {
      "batchId": "batch-1",
      "description": "First logical batch of changes",
      "steps": ["step-1", "step-2"],
      "validationCheckpoint": "Validation to perform after this batch"
    }
  ],
  "testingStrategy": {
    "existingTests": [
      "Paths to existing tests that validate functionality"
    ],
    "newTests": [
      {
        "path": "Path to new test file",
        "description": "Description of what the test validates",
        "testCode": "Example test code"
      }
    ],
    "manualValidationSteps": [
      "Steps for manual validation if needed"
    ]
  },
  "rolloutStrategy": {
    "approach": "Incremental|Complete",
    "validationCheckpoints": [
      "Points in the implementation where overall validation should occur"
    ],
    "fallbackPlan": "What to do if implementation fails"
  },
  "completionCriteria": [
    "Specific measurable criteria that indicate successful implementation"
  ]
}
```

## Instructions

### Plan Development Requirements
- Parse the critical refactoring review JSON to understand the approved refactoring
- Break down the implementation into clear, logical steps
- Specify exact file paths and code changes for each step
- Include both automated tests and manual validation procedures
- Ensure each step has a clear rollback procedure
- Validate that the overall plan aligns with architectural principles

### Step Definition Guidelines

Each implementation step should include:

1. **Clear Purpose**: What this step accomplishes
2. **File Changes**: Exact files being modified, created, or deleted
3. **Code Changes**: Specific code modifications with before/after snippets
4. **Order Dependencies**: Whether this step depends on previous steps
5. **Validation Method**: How to verify this step was successful
6. **Rollback Procedure**: How to undo this specific step if needed
7. **Estimated Effort**: Approximate time required for this step
8. **Context Requirements**: Which files need to be loaded together to implement this step

### Code Change Specifications

For each code change:

1. **Be Specific**: Provide exact line numbers or method names when possible
2. **Show Context**: Include enough unchanged code to identify the location
3. **Complete Snippets**: Ensure code snippets are syntactically complete
4. **Formatting**: Maintain consistent code formatting with existing codebase
5. **Comments**: Add comments explaining complex changes

### Testing Requirements

The testing strategy should include:

1. **Existing Tests**: Identify tests that should pass before and after changes
2. **New Tests**: Provide specific test cases for new or modified functionality
3. **Edge Cases**: Include tests for boundary conditions and error scenarios
4. **Integration Tests**: Verify components work together correctly
5. **Performance Tests**: When applicable, include tests to verify performance improvements

### Validation Checkpoints

Include validation checkpoints throughout the implementation:

1. **Unit Level**: Validate individual components work correctly
2. **Integration Level**: Verify components work together properly
3. **System Level**: Ensure the overall system functions as expected
4. **Performance Level**: Verify performance metrics meet expectations
5. **User Experience Level**: Confirm user-facing functionality works correctly

## ToolChest Implementation Context

### Code Structure Guidelines
- Maintain package structure: `com.toolchest.[config|routes|services]`
- Keep consistent naming conventions for files and classes
- Follow Kotlin best practices for nullability and immutability
- Use dependency injection via Koin for all services

### Implementation Best Practices
- Make incremental changes that can be tested individually
- Use explicit typing for better IDE support and readability
- Maintain existing architectural patterns
- Document public APIs and complex logic
- Keep changes focused on the approved refactoring scope

### Testing Guidelines
- Write tests before or alongside implementation
- Maintain test class naming convention: `{ClassUnderTest}Test`
- Follow existing test patterns for consistency
- Test both success and error scenarios
- Validate HTMX responses where appropriate

## Implementation Verification Requirements

### Functionality Verification
- All existing features should continue to work as before
- New features or improved functionality should be well-tested
- Error handling should be verified for all code paths

### Performance Verification
- Performance should be maintained or improved
- Resource usage should not increase significantly
- Response times should remain within acceptable ranges

### Code Quality Verification
- Static analysis tools should show improved metrics
- Technical debt should decrease or remain constant
- Maintainability index should improve

## Final Deliverables

Your implementation plan should result in:

1. **Machine-Readable JSON Plan**: Complete specification of all changes
2. **Testing Strategy**: Clear verification approach
3. **Rollback Procedures**: Safety mechanisms for each step
4. **Completion Criteria**: Clear definition of done

The implementation plan should be comprehensive enough that a developer could execute it without needing to refer back to the original research or review documents.

## Context Window Management Guidelines

### Batch-Oriented Approach
To manage limited context efficiently:

1. **Logical Batching**: Group steps that modify related files into logical batches
2. **Batch Size Limits**: Keep each batch limited to 3-5 files maximum
3. **Checkpointing**: Add validation checkpoints after each batch
4. **Context Reset Planning**: Plan explicit points where context can be cleared

### Dependency Graph Simplification
Rather than maintaining a complex dependency graph in memory:

1. **Simple Representation**: Use a simplified list-based representation of dependencies
2. **Direct Dependencies Only**: Focus on immediate dependencies, not transitive ones
3. **Group-Level Dependencies**: Track dependencies between component groups, not just files
4. **Validation Boundaries**: Design validation points that form natural context boundaries

### Incremental Planning Strategy
Create your plan following this incremental approach:

1. **Core Component Identification**: Identify the core component(s) affected by the refactoring
2. **Core Plan First**: Create the implementation plan for core components only
3. **Dependency Extension**: Extend the plan to directly dependent components
4. **Outward Expansion**: Continue expanding until all affected components are covered
5. **Batch Definition**: Define logical batches only after all steps are identified


!!DO NOT UNDER ANY CIRCUMSTANCES CHANGE ANY CODE IN THE CODEBASE - ONLY WRITE REVIEW!!