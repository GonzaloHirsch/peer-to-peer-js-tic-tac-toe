# Allow assuming the role from the Lambda
data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

# Actual role for the lambda
resource "aws_iam_role" "default" {
  name                = local.role_name
  assume_role_policy  = data.aws_iam_policy_document.assume_role.json
  managed_policy_arns = [aws_iam_policy.dynamo_db.arn, aws_iam_policy.logs.arn]
  tags = {
    Name = local.role_name
    app  = "movie-map.alexa.gonzalohirsch.com"
  }
}

# Policies attached to the role
resource "aws_iam_policy" "dynamo_db" {
  name = local.policy_dynamo_name

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Scan",
          "dynamodb:UpdateItem"
        ],
        "Resource" : "arn:aws:dynamodb:${var.region}:${var.account_id}:table/*"
      }
    ]
  })

  tags = {
    Name = local.policy_dynamo_name
    app  = "movie-map.alexa.gonzalohirsch.com"
  }
}

resource "aws_iam_policy" "logs" {
  name = local.policy_logs_name

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : "logs:CreateLogGroup",
        "Resource" : "arn:aws:logs:${var.region}:${var.account_id}:*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Resource" : [
          "arn:aws:logs:${var.region}:${var.account_id}:log-group:/aws/lambda/${local.function_name}:*"
        ]
      }
    ]
  })

  tags = {
    Name = local.policy_logs_name
    app  = "movie-map.alexa.gonzalohirsch.com"
  }
}
