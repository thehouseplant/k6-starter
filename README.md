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

# Run testing scenarios
docker run -i k6-starter --scenario smoke
docker run -i k6-starter --scenario load
docker run -i k6-starter --scenario stress
docker run -i k6-starter --scenario spike
docker run -i k6-starter --scenario soak
```

### Development

#### Setup Local Environment
```zsh
# Clone the repository
git clone git@github.com:thehouseplant/k6-starter.git

# Install the dependencies
npm install
```

#### Running Development Server
```zsh
# Start the local test server
npm run start
```

#### Running k6
```zsh
# Run testing scenarios
k6 run script.js --scenario smoke
k6 run script.js --scenario load
k6 run script.js --scenario stress
k6 run script.js --scenario spike
k6 run script.js --scenario soak
````
