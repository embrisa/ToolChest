# 🚀 Execute Refactoring Implementation

## Objective
Execute the approved implementation plan with precision, ensuring successful deployment of refactoring changes while maintaining system stability.

## Context Management Instructions

### Limited Context Window Management
Since LLM code agents can only maintain 3-5 files in memory at once:

- **Batch-by-Batch Processing**: Execute implementation steps in logical batches of 3-5 related files
- **Checkpoint System**: Create explicit checkpoints after each batch execution
- **Context Refresh Strategy**: Clear and refresh context between implementation batches
- **Progress Persistence**: Document progress after each step to enable resuming work

### File Context Management
1. **Prioritized Loading**: Load only files needed for the current step/batch
2. **Context Unloading**: Explicitly unload files from context when no longer needed
3. **Partial Processing**: For large files (>200 lines), process them in logical chunks
4. **Structure First**: Review file structure before implementing detailed changes
5. **State Tracking**: Track file changes across context refreshes using the progress JSON

## Input Requirements
- Path to the implementation plan JSON file (`.github/refactoring/implementation_plan_{timestamp}.json`)
- Path to the implementation plan markdown file (`.github/refactoring/implementation_plan_{timestamp}.md`)

## Output Format Requirements

### Implementation Progress Tracking
Track implementation progress in `.github/refactoring/implementation_progress_{timestamp}.json`:

```json
{
  "meta": {
    "timestamp": "YYYY-MM-DD HH:MM:SS",
    "version": "1.0",
    "plan_id": "{timestamp}-implementation-plan",
    "execution_id": "{timestamp}-execution",
    "contextWindowRefreshes": 0
  },
  "progress": {
    "status": "IN_PROGRESS|COMPLETED|FAILED",
    "completedSteps": ["step-1", "step-2"],
    "currentStep": "step-3",
    "remainingSteps": ["step-4", "step-5"],
    "percentComplete": 40,
    "currentBatch": "batch-2",
    "completedBatches": ["batch-1"],
    "currentContextFiles": ["path/to/file1.kt", "path/to/file2.kt"]
  },
  "batchProgress": [
    {
      "batchId": "batch-1",
      "status": "COMPLETED",
      "steps": ["step-1", "step-2"],
      "startTime": "YYYY-MM-DD HH:MM:SS",
      "endTime": "YYYY-MM-DD HH:MM:SS",
      "validationStatus": "PASSED"
    }
  ],
  "stepResults": [
    {
      "stepId": "step-1",
      "status": "COMPLETED|FAILED",
      "startTime": "YYYY-MM-DD HH:MM:SS",
      "endTime": "YYYY-MM-DD HH:MM:SS",
      "validationResult": "PASSED|FAILED",
      "issues": [],
      "filesModified": ["path/to/file1.kt"],
      "contextWindowState": "Files in context during execution"
    }
  ],
  "validationResults": {
    "testsRun": 15,
    "testsPassed": 15,
    "testsFailed": 0,
    "coveragePercent": 85.5,
    "lastValidationTimestamp": "YYYY-MM-DD HH:MM:SS"
  },
  "contextRefreshHistory": [
    {
      "timestamp": "YYYY-MM-DD HH:MM:SS",
      "beforeBatchId": "batch-2",
      "afterBatchId": "batch-1",
      "statePreservationNotes": "Key state preserved across context refresh"
    }
  ]
}
```

## Execution Instructions

### Implementation Process
1. Load and parse the implementation plan
2. Extract the next logical batch of steps to implement
3. Load only the files needed for that batch
4. Execute each step in the batch sequentially
5. Validate the batch as a whole before proceeding
6. Document progress and save checkpoint
7. Clear context and reload for the next batch
8. Repeat until all batches are complete

### Batch Processing Guidelines
1. **Batch Size**: Process up to 3-5 files per batch
2. **Logical Grouping**: Keep related changes together in the same batch
3. **Validation Boundaries**: Validate after each batch completion
4. **Context Refresh**: Clear context between batches
5. **State Preservation**: Document key state before clearing context 
6. **Progress Updates**: Update progress tracking JSON after each batch

### Validation Requirements
For each implementation step:
1. Apply the specified validation method
2. Run relevant unit tests for affected components
3. Document validation results before proceeding
4. Execute batch-level validation after all steps in a batch

### Code Quality Standards
- Follow Kotlin coding conventions
- Maintain or improve test coverage
- Document public APIs and complex logic
- Preserve architectural patterns
- Ensure backward compatibility

## Final Verification
Before marking implementation as complete:
1. Run the full test suite
2. Verify all completion criteria are met
3. Perform manual validation if specified
4. Generate final documentation of changes
5. Update the progress tracking to COMPLETED status

## Context Window Refresh Process

### When to Refresh Context
1. After completing a batch of related changes
2. When moving to a different component or module
3. After implementing a significant change that requires validation
4. When approaching the context window limit

### How to Refresh Context
1. **Document State**: Update the progress JSON with current state
2. **Save Checkpoint**: Save all necessary files and changes
3. **Run Validation**: Verify changes before clearing context
4. **Clear Context**: Explicitly note you're clearing context
5. **Reload Critical State**: Load the progress JSON and plan JSON
6. **Resume Implementation**: Continue from the saved checkpoint

### Context Window Management
1. **Track Loaded Files**: Maintain a list of currently loaded files
2. **Prioritize Core Changes**: Load the most critical files first
3. **Unload Peripheral Files**: Remove files from context when no longer needed
4. **Use File Outlines**: Work with file structure outlines for large files
5. **Reference Documentation**: Create lightweight references to implementation details

---

When execution is complete or a checkpoint is reached, provide a summary of:
1. Total steps completed
2. Testing metrics (tests passed/total)
3. Key improvements implemented
4. Any follow-up tasks identified
5. Overall implementation status
6. Next batch to implement (if not complete)