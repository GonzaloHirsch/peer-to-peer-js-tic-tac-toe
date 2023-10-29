output "server_url" {
  value       = google_cloud_run_service.default.traffic[0].url
  description = "URL of the Cloud Run server."
}
