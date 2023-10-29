variable "account_id" {
  type        = string
  description = "ID of the AWS project."
}
variable "region" {
  type        = string
  description = "Region of the resources."
}
variable "backend_url" {
  type        = string
  description = "URL of the backend service."
}
variable "backend_key" {
  type        = string
  description = "API key for the backend service."
}
variable "skill_id" {
  type        = string
  description = "ID for the skill verification."
}
