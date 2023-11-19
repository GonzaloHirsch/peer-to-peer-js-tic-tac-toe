# Infrastructure for the static website
module "website" {
  source             = "github.com/GonzaloHirsch/terraform-infrastructure/static-website"
  tag_app            = local.app_tag
  app_url            = local.app_tag
  aws_hosted_zone_id = var.hosted_zone_id
  aws_region         = var.region
}
