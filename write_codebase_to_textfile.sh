#!/bin/bash

# --- Configuration ---
OUTPUT_FILE="codebase_output.txt"
SEARCH_PATH="."
DEBUG_MODE=0
FILE_TYPE=".lua"        # Default file type
ROOT_TAG_NAME="Codebase" # Default root tag name
BLACKLIST_PREFIX=""     # Default: no prefix blacklisted

# Directories to ignore (relative to SEARCH_PATH)
IGNORE_DIRS=( "vendor" "assets" )

# --- Helper Functions ---
log_debug() {
    if [[ "$DEBUG_MODE" -eq 1 ]]; then
        echo "[DEBUG] $(date +'%Y-%m-%d %H:%M:%S') - $1" >&2
    fi
}

log_error() {
    echo "[ERROR] $(date +'%Y-%m-%d %H:%M:%S') - $1" >&2
}

log_info() {
     echo "[INFO] $(date +'%Y-%m-%d %H:%M:%S') - $1" >&2
}

log_progress() {
     echo "[PROGRESS] $(date +'%Y-%m-%d %H:%M:%S') - $1" >&2
}

usage() {
    echo "Usage: $0 [-t <file_extension>] [-r <root_tag>] [-o <output_file>] [-s <search_path>] [-b <blacklist_prefix>] [-d] [-h]" >&2
    echo "  -t <file_extension>:   Specify the file extension to search for (e.g., .py, .kt). Default: '$FILE_TYPE'." >&2
    echo "                         The leading dot is recommended but will be added if missing." >&2
    echo "  -r <root_tag>:         Specify the name for the root XML tag. Default: '$ROOT_TAG_NAME'." >&2
    echo "  -o <output_file>:      Specify the output file name. Default: '$OUTPUT_FILE'." >&2
    echo "  -s <search_path>:      Specify the starting directory for the search. Default: '$SEARCH_PATH'." >&2
    echo "  -b <blacklist_prefix>: Ignore lines starting with this prefix (e.g., 'import', '//'). Default: None." >&2
    echo "  -d:                    Enable debug mode for verbose logging." >&2
    echo "  -h:                    Display this help message." >&2
    exit 1
}

# --- Argument Parsing ---
# Reset OPTIND just in case
OPTIND=1
# Add 'b:' to the getopts string
while getopts ":t:r:o:s:b:dh" opt; do
  case ${opt} in
    t )
      FILE_TYPE="$OPTARG"
      # Ensure the file type starts with a dot
      if [[ "$FILE_TYPE" != .* ]]; then
          log_debug "Prepending dot to provided file type '$FILE_TYPE'."
          FILE_TYPE=".$FILE_TYPE"
      fi
      ;;
    r )
      ROOT_TAG_NAME="$OPTARG"
      # Basic validation for the tag name
      if [[ "$ROOT_TAG_NAME" =~ [[:space:]] || "$ROOT_TAG_NAME" =~ "[<>/]" || -z "$ROOT_TAG_NAME" ]]; then
          log_error "Invalid root tag name '$ROOT_TAG_NAME'. Cannot be empty, contain spaces, or '<', '>', '/'."
          usage
      fi
      ;;
    o )
      OUTPUT_FILE="$OPTARG"
      ;;
    s )
      SEARCH_PATH="$OPTARG"
      ;;
    b ) # Handle the new -b option for blacklisting prefix
      BLACKLIST_PREFIX="$OPTARG"
      ;;
    d )
      DEBUG_MODE=1
      ;;
    h )
      usage
      ;;
    \? )
      log_error "Invalid Option: -$OPTARG"
      usage
      ;;
    : )
      log_error "Invalid Option: -$OPTARG requires an argument"
      usage
      ;;
  esac
done
shift $((OPTIND -1)) # Remove parsed options and arguments

# Check if SEARCH_PATH exists and is a directory
if [[ ! -d "$SEARCH_PATH" ]]; then
    log_error "Search path '$SEARCH_PATH' does not exist or is not a directory."
    exit 1
fi

# --- Construct Full Root Tags (after options are parsed) ---
ROOT_TAG_OPEN="<${ROOT_TAG_NAME}${FILE_TYPE}>"
ROOT_TAG_CLOSE="</${ROOT_TAG_NAME}${FILE_TYPE}>"


# --- Script Start ---
SCRIPT_START_TIME=$(date +%s)
log_info "Starting Code Aggregator script..."
log_info "Output file: '$OUTPUT_FILE'"
# Build ignore message string
ignore_dirs_string=""
if [[ ${#IGNORE_DIRS[@]} -gt 0 ]]; then
    for dir in "${IGNORE_DIRS[@]}"; do
      ignore_dirs_string+="'$dir/', "
    done
    ignore_dirs_string=${ignore_dirs_string%, } # Remove trailing comma and space
    log_info "Ignoring directories: $ignore_dirs_string"
else
    log_info "Ignoring directories: None specified."
fi
log_info "Search path: '$SEARCH_PATH'"
log_info "Searching for file type: '$FILE_TYPE'"
if [[ -n "$BLACKLIST_PREFIX" ]]; then
    log_info "Ignoring lines starting with prefix: '$BLACKLIST_PREFIX'"
else
    log_info "Ignoring lines starting with prefix: None"
fi
log_info "Using root tag name: '$ROOT_TAG_NAME'"
[[ "$DEBUG_MODE" -eq 1 ]] && log_debug "Debug mode enabled."


# --- File Initialization ---
log_info "Initializing output file '$OUTPUT_FILE'..."
# Creates the file or overwrites it if it exists
if ! > "$OUTPUT_FILE"; then
    log_error "Failed to create or truncate output file '$OUTPUT_FILE'. Check permissions."
    exit 1
fi
log_info "Output file initialized successfully."

# --- Build 'find' command arguments for ignoring directories ---
find_ignore_args=()
for dir in "${IGNORE_DIRS[@]}"; do
  ignore_path_target="$SEARCH_PATH/$dir"
  ignore_path_target=$(echo "$ignore_path_target" | sed 's#///*#/#g; s#^\./##') # Clean path

  if [[ ${#find_ignore_args[@]} -gt 0 ]]; then
    find_ignore_args+=("-o")
  fi
  find_ignore_args+=("-path" "$ignore_path_target" "-prune")
  log_debug "Adding ignore rule for path: '$ignore_path_target'"
done
log_debug "Find ignore arguments: ${find_ignore_args[*]}"

# --- Find and Process Files ---
log_info "Searching for and processing *$FILE_TYPE files recursively..."

# Redirect find's stderr to debug log
exec 3> >(
    while IFS= read -r line; do
        log_debug "find stderr: $line"
    done
)

# Initialize counters
TOTAL_FILES_PROCESSED=0
ERRORS_ENCOUNTERED=0

# Dynamically build the find command parts
find_command=("find" "$SEARCH_PATH")
if [[ ${#find_ignore_args[@]} -gt 0 ]]; then
    find_command+=("${find_ignore_args[@]}" "-o")
fi
find_command+=("-type" "f" "-name" "*$FILE_TYPE" "-print0")

log_debug "Executing find command: ${find_command[*]}"

# Write the opening root tag to the output file (using the variable)
echo "$ROOT_TAG_OPEN" >> "$OUTPUT_FILE"

# Process the files found by 'find'
while IFS= read -r -d $'\0' file_path; do
    [[ -z "$file_path" ]] && continue

    TOTAL_FILES_PROCESSED=$((TOTAL_FILES_PROCESSED + 1))

    # Get the relative path
    if [[ "$SEARCH_PATH" == "." ]]; then
        relative_path=${file_path#./}
    else
        relative_path=${file_path#"$SEARCH_PATH/"}
        if [[ "$relative_path" == "$file_path" ]]; then
             relative_path=$(basename "$file_path")
        fi
    fi
    tag_name="$relative_path"

    log_progress "(File $TOTAL_FILES_PROCESSED) Processing: '$relative_path'"
    log_debug "Using tag: <$tag_name>"

    # Append opening file tag
    echo "<$tag_name>" >> "$OUTPUT_FILE"

    # --- Append file content safely, potentially filtering lines ---
    append_command=()
    if [[ -n "$BLACKLIST_PREFIX" ]]; then
        # If a blacklist prefix is set, use grep -v to filter lines starting with it
        # Note: Using ^ ensures we only match the start of the line.
        # Quoting "$BLACKLIST_PREFIX" handles potential spaces or special chars in the prefix itself.
        log_debug "Applying blacklist filter: Ignoring lines starting with '$BLACKLIST_PREFIX'"
        append_command=(grep -v "^${BLACKLIST_PREFIX}" "$file_path")
    else
        # If no blacklist prefix, just use cat
        append_command=(cat "$file_path")
    fi

    log_debug "Executing append command: ${append_command[*]} >> $OUTPUT_FILE"

    # Execute the chosen command (cat or grep) and append to the output file
    if ! "${append_command[@]}" >> "$OUTPUT_FILE"; then
        # Check if the error was specifically due to grep finding no matches (exit code 1)
        # or a genuine read error (other non-zero exit code for cat/grep)
        grep_no_match_exit_code=1
        cat_read_error_exit_code=1 # Also 1 for cat typically if file unreadable
        cmd_exit_status=$?

        if [[ -n "$BLACKLIST_PREFIX" && $cmd_exit_status -eq $grep_no_match_exit_code ]]; then
            # Grep exited with 1, which usually means no lines matched the *inverted* pattern.
            # This means *all* lines started with the blacklist prefix (or the file was empty).
            # This is not necessarily an error in our context, just means nothing was appended.
            log_debug "No content appended for '$relative_path' after filtering lines starting with '$BLACKLIST_PREFIX'."
        else
            # An actual error occurred during reading or processing
            log_error "Failed to read or process content from '$file_path' (Exit code: $cmd_exit_status). Adding error comment to output."
            echo "<!-- ERROR: Failed to read/process file content for $tag_name -->" >> "$OUTPUT_FILE"
            ERRORS_ENCOUNTERED=$((ERRORS_ENCOUNTERED + 1))
        fi
    else
         log_debug "Successfully appended content for '$relative_path'."
    fi
    # --- End of content appending block ---

    # Append closing file tag
    echo "</$tag_name>" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE" # Blank line

done < <("${find_command[@]}" 2>&3)

find_exit_status=$?

# Write the closing root tag to the output file (using the variable)
echo "$ROOT_TAG_CLOSE" >> "$OUTPUT_FILE"

# Close FD 3
exec 3>&-

# --- Final Check and Report ---
if [[ $TOTAL_FILES_PROCESSED -eq 0 ]]; then
    if [[ $find_exit_status -ne 0 ]]; then
         log_error "The 'find' command exited with status $find_exit_status. Check debug logs if enabled."
    fi
    echo "[WARN] No '$FILE_TYPE' files found (or processed) outside the ignored directories ($ignore_dirs_string) in '$SEARCH_PATH'." >&2
fi

SCRIPT_END_TIME=$(date +%s)
DURATION=$((SCRIPT_END_TIME - SCRIPT_START_TIME))

log_info "--- Aggregation Complete ---"
log_info "Processed $TOTAL_FILES_PROCESSED '$FILE_TYPE' files."
if [[ "$ERRORS_ENCOUNTERED" -gt 0 ]]; then
    echo "[WARN] Encountered $ERRORS_ENCOUNTERED errors while reading/processing file contents. Check logs and '$OUTPUT_FILE'." >&2
else
    log_info "All found files processed successfully."
fi
log_info "Output written to '$OUTPUT_FILE'"
log_info "Script finished in $DURATION seconds."

# Exit with appropriate status code
if [[ $ERRORS_ENCOUNTERED -gt 0 || $find_exit_status -ne 0 ]]; then
    exit 1
else
    exit 0
fi