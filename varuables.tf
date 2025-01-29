variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name (e.g. Staging, RC, Production)"
  type        = string
  default     = "Staging"
}
