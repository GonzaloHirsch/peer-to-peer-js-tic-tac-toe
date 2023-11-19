# Infrastructure for the static website
module "website" {
  source             = "git::https://github.com/GonzaloHirsch/terraform-infrastructure//static-website?ref=99923841c1883da90517b6085069a3c10b9b53fb"
  tag_app            = local.app_tag
  app_url            = local.app_tag
  aws_hosted_zone_id = var.hosted_zone_id
  aws_region         = var.region
}
