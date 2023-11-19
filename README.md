# Peer to Peer Ultimate Tic Tac Toe

P2P JavaScript game utilizing GCP and AWS for seamless multiplayer experiences. Collaborative, fast-paced, and cloud-powered gaming.

---

- [Peer.js](#peerjs)
- [Terraform](#terraform)
  - [AWS](#aws)
    - [Accounts](#accounts)
  - [GCP](#gcp)
    - [Cloud Run](#cloud-run)
    - [Billing Limits](#billing-limits)
  - [Variables](#variables)
  - [Running Terraform](#running-terraform)
- [Frontend](#frontend)
  - [Building](#building)
  - [Local Testing](#local-testing)
  - [Deployment](#deployment)
- [GitHub](#github)
  - [Branch Protections](#branch-protections)
  - [Workflows](#workflows)

---

## Peer.js

This game uses [Peer.js](https://peerjs.com/) as the engine to power the peer-to-peer mechanism. The signaling server is hosted on GCP. For more information about that, head to the [GCP section](#gcp).

## Terraform

### AWS

AWS is used to host the state for Terraform and to host the frontend for the game. This is mostly done via the Terraform module I have for [static websites on AWS](https://github.com/GonzaloHirsch/terraform-infrastructure/tree/main/static-website).

#### Accounts

An account to deploy the website contents and invalidate the CDN cache is required. The following policy will ensure the Principle of Least Priviledge on the account:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:ListBucket",
        "s3:DeleteObject",
        "cloudfront:CreateInvalidation"
      ],
      "Resource": [
        "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID",
        "arn:aws:s3:::BUCKET_NAME/*",
        "arn:aws:s3:::BUCKET_NAME"
      ]
    }
  ]
}
```

You only need to export a set of credentials to load into GitHub Actions as specified in the [workflows](#workflows) section.

### GCP

To minimise the cost of this solution, I used [Cloud Run](https://cloud.google.com/run?hl=en) as the platfor to host the signaling server that Peer.js requires.

To allow Terraform to interact with the GCP infrastructure, it's necesary to do the following:

1. Log in with `gcloud` (also install `gcloud` CLI).
2. Set a quota project `gcloud auth application-default set-quota-project PROJECT_ID`.
3. Manually enable cloud billing on the project (`cloudbilling.googleapis.com`).

After that is done, you should be able to interact with the Terraform infrastructure against GCP.

#### Cloud Run

For Cloud Run, we use the open source Peer.js image, `docker.io/peerjs/peerjs-server:latest`. There's not much configuration necessary to run this image, but it's important to note:

1. The server needs to allow unauthenticated requests (this involves creating some extra policies, already included with Terraform).
2. You have to configure the `--allow_discovery` and `--key` flags for the server, setting the corresponding values when necessary.
3. Configure the specific port for the container, which is `9000`.

#### Billing Limits

To ensure the solution is low cost, a billing budget was set for 1 dollar. This way you can receive notifications of possible misusses without having to pay a hefty bill.

### Variables

A `terraform.tfvars` file is heavily encouraged as to simplify the development process and secret management. The contents should be the following:

```
account_id      = "XXXX"
region          = "XXXX"
hosted_zone_id  = "XXXX"
# Gen via openssl rand -base64 64
base_server_key = "XXXX"
gcp_region      = "XXXX"
gcp_project_id  = "XXXX"
```

### Running Terraform

If you intend to run Terraform for the first time before migrating the state to a backend. Follow these steps:

1. Temporarily remove the `backend.tf` file from your configuration.
2. Initialize the stack (`terraform init`, or `terraform init -upgrade`).
3. Run the stack (`terraform apply`).
4. Add back the `backend.tf` file.
5. Initialize the stack again (`terraform init`) and opt to migrate the state to the backend.

## Frontend

All the frontend for the game lives under the `frontend` directory. The [local testing](#local-testing) guide can provide more information on how to test the frontend and the game locally.

### Building

To build the site, you can simply run the following command. Which will prepare all the files to upload to the object storage.

```bash
npm run generate
```

Note that the build script does CSS and JS uglification and minification. After that, it computes the file MD5 to add it to the name. This will result in the following scheme:

```bash
FILENAME.[css|js] --> FILENAME_[MD5].[css|js]
```

After that, the build script will change the names of the imports in the HTML code. This helps automatically invalidate browser caches and speeds up the site.

The `version` NPM script handles updating the version at the bottom of the page. To run this, you should do it the following way:

```bash
npm run version --- [YOUR_VERSION]
```

Note: It's best to run this in the automatic release workflow, as it can take the output of Semantic Versioning as the version input.

### Local Testing

Start by generating a new certificate using OpenSSL:

```bash
openssl req -x509 -newkey rsa:4096 -keyout ./secure/key.pem -out ./secure/cert.pem -sha256 -days 3650 -nodes -subj "/C=XX/ST=London/L=London/O=GonzaloHirsch/OU=GonzaloHirsch/CN=localhost"
```

After that, you can run the `serve` NPM script. You can run:

```bash
npm run serve
```

Note: Remember to first run an `npm i` to install all the necessary dependencies. Also note that this command needs `Python3` installed, as it runs a Python HTTPs server.

You can then head to the browser and load `https://localhost:4443` to test the game (if you see a page that says `This is unsafe`, ignore it. That's because the certificate is self-signed).

### Deployment

## GitHub

To fully take advantage of Semantic Release, it's necessary to configure the GitHub App for OAuth. To install this app in this repository, you need to do the following:

1. Go to `Profile > Applications (under Integrations) > Semantic Release @ Gonzalo Hirsch (name of your app) > Configure`.
2. Include this repository in the list of allowed repositories.
3. Go to `Repository Name (the name of your repository) > Settings > Branches` and click on the branch protection rule you have.
4. Set allow force pushes and select the principal as the application.

This will ensure that Semantic Release can bypass branch protections and push the new versions

### Branch Protections

For a more secure implementation, I heavily recommend you create a branch protection rule on your `main` branch. These are my recommended configurations:

- Require a pull request before merging
  - Dismiss stale pull request approvals when new commits are pushed
  - Require review from Code Owners
- Require status checks to pass before merging
  - Require branches to be up to date before merging
- The configuration described in the [GitHub section above](#github) for the GitHub App.

### Workflows

This repository contains 3 main workflows:

1. [`automatic-release`](.github/workflows/automatic-release.yml) --> Runs the site generation, deployment, and generates a new release with release notes.
2. [`linting`](.github/workflows/linting.yml) --> Lints the JavaScript code to make sure it follows a consistent format.
3. [`testing`](.github/workflows/testing.yml) --> Validates the Terraform stack to make sure format and contents are valid.

Ensure the following variables are set as part as secrets:

- `AWS_ACCESS_KEY_ID` --> Access Key ID for the AWS account mentioned as the deployer (see [accounts section](#accounts)).
- `AWS_SECRET_ACCESS_KEY` --> Secret Access Key for the AWS account mentioned as the deployer (see [accounts section](#accounts)).
- `BOT_APP_ID` --> App ID for the GitHub App that bypasses branch protections.
- `BOT_PRIVATE_KEY` --> Private key for the GitHub App that bypasses branch protections.
- `CLOUDFRONT_DISTRIBUTION_ID` --> ID of the CloudFront distribution that needs to be invalidated when deploying.
- `S3_BUCKET` --> Name of the bucket where the site artifacts live.
- `S3_BUCKET_REGION` --> Region of the bucket where the site artifacts live.
