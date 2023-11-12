resource "aws_s3_bucket" "state" {
  bucket = local.bucket_name

  tags = {
    Name = local.bucket_name
    app  = local.app_tag
  }
}
