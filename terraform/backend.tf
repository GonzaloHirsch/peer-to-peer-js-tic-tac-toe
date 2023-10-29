terraform {
  backend "s3" {
    bucket = "alexa-skill-terraform-backend"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}
