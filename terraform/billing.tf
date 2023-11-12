data "google_billing_account" "account" {
  provider     = google
  display_name = "My Billing Account"
}

# Billing limits for the GCP project
resource "google_billing_budget" "budget" {
  billing_account = data.google_billing_account.account.id
  display_name    = "Billing Budget"
  amount {
    specified_amount {
      currency_code = "USD"
      units         = "1"
    }
  }
  threshold_rules {
    threshold_percent = 0.5
  }
  depends_on = [google_project_service.apis]
}
