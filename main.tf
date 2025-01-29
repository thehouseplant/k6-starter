# Configure AWS provider
provider "aws" {
  region = var.aws_region
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "k6_api" {
  name        = "k6-load-test-api"
  description = "API Gateway for k6 load testing"
}

# API Gateway Resource
resource "aws_api_gateway_resource" "k6_api_resource" {
  rest_api_id = aws_api_gateway_rest_api.k6_api.id
  parent_id   = aws_api_gateway_rest_api.k6_api.root_resource_id
  path_part   = "test"
}

# API Gateway Method
resource "aws_api_gateway_method" "k6_method" {
  rest_api_id   = aws_api_gateway_rest_api.k6_api.id
  resource_id   = aws_api_gateway_resource.k6_api_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

# Lambda function role
resource "aws_iam_role" "lambda_role" {
  name = "k6_lambda_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Lambda execution role
resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda function
resource "aws_lmabda_function" "k6_lambda" {
  filename = "k6-lambda.zip"
  function_name = "k6-load-test"
  role = aws_iam_role.lambda_role.arn
  handler = "index.handler"
  runtime = "nodejs20x.x"
  timeout = 300

  environment {
    variables = {
      STAGE = var.environment
    }
  }
}

# API Gateway integration
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.k6_api.id
  resource_id = aws_api_gateway_resource.k6_resource.id
  http_method = aws_api_gateway_method.k6_method.http_method
  type        = "AWS_PROXY"
  integration_http_method = "POST"
  uri         = aws_lambda_function.k6_lambda.invoke_arn
}

# API Gateway deployment
resource "aws_api_gateway_deployment" "k6_deployment" {
  depends_on  = [aws_api_gateway_integration.lambda_integration]
  rest_api_id = aws_api_gateway_rest_api.k6_api.id
  stage_name  = var.environment
}

# Lambda API Gateway permission
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.k6_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.k6_api.execution_arn}/*/${aws_api_gateway_method.k6_method.http_method}${aws_api_gateway_resource.k6_resource.path}"
}

# Output the API Gateway URL
output "api_gateway_url" {
  value = "${aws_api_gateway_deployment.k6_deployment.invoke_url}${aws_api_gateway_resource.k6_resource.path}"
}
