locals {
  payload_name       = "build.zip"
  function_name      = "alexa-skill-movie-stream"
  bucket_name        = "alexa-skill-terraform-backend"
  role_name          = "alexa-skill-movies-lambda-role"
  policy_dynamo_name = "policy-alexa-lambda-dynamod"
  policy_logs_name   = "policy-alexa-lambda-execution"
  target_location    = "../.build/${local.payload_name}"
  package_excludes   = [".github", ".git", ".build", ".releaserc.json", ".env", ".eslintrc.json", "docs", ".prettierrc", "terraform", ".gitignore", "README.md", "LICENSE"]
}
