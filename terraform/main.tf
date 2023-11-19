# Infrastructure for the static website
module "website" {
  source             = "git::https://github.com/GonzaloHirsch/terraform-infrastructure//static-website?ref=b35ec5244e2ebac66deb7595f634a188073c238e"
  tag_app            = local.app_tag
  app_url            = local.app_tag
  aws_hosted_zone_id = var.hosted_zone_id
  aws_region         = var.region
}
