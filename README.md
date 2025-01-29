# k6 Starter

A small sample repository to get started using k6 to load test a sample URL. This project is setup to run in AWS Lambda and is accessible via API Gateway.

## Requirements

- [Terraform](https://www.terraform.io/)
- [Docker](https://www.docker.com/)
- [Node.js 20.x](https://nodejs.org/en) or above (for development)
- [k6](https://k6.io/) (for development)

## Getting Started

```zsh
# Clone the repository
git clone git@github.com:thehouseplant/k6-starter.git

# Build the Docker image
docker build -t k6-starter .

# Run the container
docker run -i k6-starter
```

### Development

```zsh
# Clone the repository
git clone git@github.com:thehouseplant/k6-starter.git

# Install the dependencies
npm install

# Run local test runner
k6 run index.js
````
