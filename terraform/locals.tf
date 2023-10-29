locals {
  payload_name  = "build.zip"
  display_name  = "tictactoe"
  function_name = "alexa-skill-movie-stream"
  # GCP APIS
  apis = ["billingbudgets.googleapis.com", "run.googleapis.com", "iam.googleapis.com", "cloudresourcemanager.googleapis.com", "cloudbilling.googleapis.com"]
  # Server locals
  server_name  = "${local.display_name}-server"
  server_image = "docker.io/peerjs/peerjs-server:latest"
  server_key   = md5(var.base_server_key)
  # App tag
  app_tag = "${local.display_name}.gonzalohirsch.com"
  # Other names
  bucket_name        = "${local.display_name}-terraform-backend"
  role_name          = "alexa-skill-movies-lambda-role"
  policy_dynamo_name = "policy-alexa-lambda-dynamod"
  policy_logs_name   = "policy-alexa-lambda-execution"
  target_location    = "../.build/${local.payload_name}"
  package_excludes   = [".github", ".git", ".build", ".releaserc.json", ".env", ".eslintrc.json", "docs", ".prettierrc", "terraform", ".gitignore", "README.md", "LICENSE"]
}
