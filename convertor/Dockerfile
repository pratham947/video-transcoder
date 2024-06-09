# Use Ubuntu Focal as the base image
FROM ubuntu:focal

# Set environment variable to prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update package lists and install ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg

# Copy the main.sh script into the container
COPY main.sh main.sh

# Set the entry point to run the main.sh script when the container starts
ENTRYPOINT [ "./main.sh" ]

