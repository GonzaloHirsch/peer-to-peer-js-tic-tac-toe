output "arn" {
  value       = aws_lambda_function.default.arn
  description = "ARN of the Lambda function to be executed."
}
