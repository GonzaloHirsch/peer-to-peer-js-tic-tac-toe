resource "google_project_service" "apis" {
  project            = var.gcp_project_id
  for_each           = toset(local.apis)
  service            = each.key
  disable_on_destroy = false
}
