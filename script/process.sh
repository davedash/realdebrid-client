#!/bin/bash

# Directories for processing and retiring files
PROCESSING_FOLDER="/data"
PROCESSED_FOLDER="/data/processed"

# Function to process a single file, now also checking for the .magnet extension
process_file() {
  local file=$1

  # Check if file is in the processed folder or not a .magnet file
  if [[ "$file" == "$PROCESSED_FOLDER"* || "${file: -7}" != ".magnet" ]]; then
    echo "Skipping $file due to location or file extension."
    return
  fi

  echo "Processing $file..."
  bun run src/index.ts add-magnet "$file"
  mv "$file" "$PROCESSED_FOLDER"
  echo "Moved $file to $PROCESSED_FOLDER"
}

# Process all existing .magnet files in the directory, excluding the processed folder
process_existing_files() {
  find "$PROCESSING_FOLDER" -type f -not -path "$PROCESSED_FOLDER/*" -name "*.magnet" | while read -r file; do
    process_file "$file"
  done
}

# Watch for new files and process them, utilizing process_file which includes all necessary checks
watch_and_process() {
  inotifywait -m -e create --format '%w%f' "$PROCESSING_FOLDER" | while read -r file; do
    process_file "$file"
  done
}

# Main function to tie all the steps together
main() {
  # Ensure the processed folder exists before we start our operations
  mkdir -p "$PROCESSED_FOLDER"
  process_existing_files
  watch_and_process
}

# Invoke the main function to start the script
main
