resource "google_cloud_run_service" "default" {
  name     = local.server_name
  project  = var.gcp_project_id
  location = var.gcp_region

  # Metadata to note allow all
  metadata {
    annotations = {
      "run.googleapis.com/ingress"        = "all"
      "run.googleapis.com/ingress-status" = "all"
    }
  }

  # Container template
  template {
    metadata {
      # Ensure the correct annotations for scale
      annotations = {
        "run.googleapis.com/startup-cpu-boost" = false
        "autoscaling.knative.dev/maxScale"     = 1
      }
    }
    spec {
      container_concurrency = 50
      timeout_seconds       = 300
      containers {
        image = local.server_image
        ports {
          container_port = 9000
        }
        args = ["--allow_discovery", "--key", "${local.server_key}"]
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
        startup_probe {
          timeout_seconds   = 240
          period_seconds    = 240
          failure_threshold = 1
          tcp_socket {
            port = 9000
          }
        }

      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Policy for no authentication
data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

# Policy to allow unauthenticated requests
resource "google_cloud_run_service_iam_policy" "noauth" {
  location = google_cloud_run_service.default.location
  project  = google_cloud_run_service.default.project
  service  = google_cloud_run_service.default.name

  policy_data = data.google_iam_policy.noauth.policy_data
}
