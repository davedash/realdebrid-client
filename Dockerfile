# Start with a base image that has Bun installed
FROM oven/bun:latest

RUN apt-get update && apt-get install -y inotify-tools

# Set the working directory in the container
WORKDIR /app

# Copy your Bun script into the container
COPY . /app

# Install any dependencies (if you have a bun.json file)
RUN bun install

# Make sure the processing script is executable
RUN chmod +x /app/script/process.sh

# Use the processing script as the entry point
ENTRYPOINT ["/app/script/process.sh"]