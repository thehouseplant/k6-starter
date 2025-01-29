# Use official k6 image as base
FROM grafana/k6:latest

# Create working directory
WORKDIR /scripts

# Copy k6 test script into container
COPY index.js .

# Set entry point to run k6 with the test script
CMD [ "k6", "run", "index.js" ]
