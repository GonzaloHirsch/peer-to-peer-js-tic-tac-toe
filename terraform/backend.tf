terraform {
  backend "s3" {
    bucket = "tictactoe-terraform-backend"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}
