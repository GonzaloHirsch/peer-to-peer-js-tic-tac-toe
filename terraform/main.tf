data "archive_file" "payload" {
  type        = "zip"
  output_path = "${path.module}/${local.target_location}"
  source_dir  = "${path.module}/.."
  # Local to the source dir, avoid trailing slashes as well for directories
  excludes = local.package_excludes
}

resource "aws_lambda_function" "default" {
  filename      = "${path.module}/${local.target_location}"
  function_name = local.function_name
  role          = aws_iam_role.default.arn
  handler       = "src/index.handler"

  source_code_hash = data.archive_file.payload.output_base64sha256

  runtime = "nodejs18.x"

  memory_size = 256
  timeout     = 20

  environment {
    variables = {
      BACKEND_URL = var.backend_url
      BACKEND_KEY = var.backend_key
    }
  }

  tags = {
    Name = local.function_name
    app  = "movie-map.alexa.gonzalohirsch.com"
  }
}

resource "aws_cloudwatch_log_group" "default" {
  name              = "/aws/lambda/${local.function_name}"
  retention_in_days = 90
  tags = {
    Name = "/aws/lambda/${local.function_name}"
    app  = "movie-map.alexa.gonzalohirsch.com"
  }
}

# create the Alexa trigger
resource "aws_lambda_permission" "alexa_trigger" {
  statement_id       = "AllowExecutionFromAlexa"
  action             = "lambda:InvokeFunction"
  function_name      = local.function_name
  principal          = "alexa-appkit.amazon.com"
  event_source_token = var.skill_id
}
