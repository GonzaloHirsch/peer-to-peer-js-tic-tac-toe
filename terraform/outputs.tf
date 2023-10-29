output "server_url" {
  value       = google_cloud_run_service.default.status[0].url
  description = "URL of the Cloud Run server."
}
output "server_key" {
  value       = local.server_key
  description = "Key for the server."
}
