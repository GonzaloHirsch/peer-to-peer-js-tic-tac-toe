variable "account_id" {
  type        = string
  description = "ID of the AWS project."
}
variable "region" {
  type        = string
  description = "Region of the resources."
}
variable "base_server_key" {
  type        = string
  description = "Server key to be used in connections."
}
variable "gcp_region" {
  type        = string
  description = "Region to use for GCP. By default is `europe-west1`."
  default     = "europe-west1"
}
variable "gcp_project_id" {
  type        = string
  description = "ID for the GCP project compute resources."
}
