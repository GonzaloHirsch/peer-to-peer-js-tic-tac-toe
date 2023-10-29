# Movie Map

This guide assists in the development of an Alexa skill, focusing on the given example of this skill.

- [Infrastructure](#infrastructure)
  - [Necessary IAM Permissions for CI/CD](#necessary-iam-permissions-for-cicd)
  - [Variables](#variables)
  - [Running Terraform](#running-terraform)
  - [Testing Deployment Account for CI/CD Locally](#testing-deployment-account-for-cicd-locally)
- [Codebase](#codebase)
  - [Dependencies](#dependencies)
  - [Development \& Testing](#development--testing)
  - [Skill Handler](#skill-handler)
  - [Intent Handler](#intent-handler)
  - [Other Files](#other-files)
- [Skill Configuration](#skill-configuration)
  - [Skill Testing](#skill-testing)
- [Workflows](#workflows)

## Infrastructure

All infrastructure is deployed using Terraform (except the IAM Users and policies required to deploy via Terraform). All the terraform files live on the `terraform` directory. Necessary resources are:

- `archive_file` --> Allows zipping the contents of the Lambda Function.
- `aws_lambda_function` --> Lambda Function that handles the user inquiry via Alexa.
- `aws_lambda_permission` --> Permissions to invoke the Lambda Function. This includes verification via the skill ID.
- `aws_cloudwatch_log_group` --> Log Group in CloudWatch to store logs for the Lambda Function.
- `aws_s3_bucket` --> Storage for the Terraform state. Note this is not necessary if you intend on working exclusively with local state, but this will not work correctly with a CI/CD pipeline.
- `aws_iam_role` --> IAM Role to allow invoking the necessary resources for the Lambda Function.
- `aws_iam_policy` --> Two IAM Policies for the necessary permissions.
- `aws_iam_policy_document` --> IAM Policy Document that allows Lambda to assume the given role.

### Necessary IAM Permissions for CI/CD

These are the necessary permissions to correctly deploy the stack in a CI/CD pipeline after deploying most of the resources with an account with enough permissions. Permissions are broken down on several IAM policies for simplicity:

- `policy-alexa-iam-deployer`

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "EditPermissions",
            "Effect": "Allow",
            "Action": [
                "iam:GetRole",
                "iam:GetPolicyVersion",
                "iam:ListRoleTags",
                "iam:UntagRole",
                "iam:GetPolicy",
                "iam:TagRole",
                "iam:UpdateRoleDescription",
                "iam:CreateRole",
                "iam:PutRolePolicy",
                "iam:TagPolicy",
                "iam:CreatePolicy",
                "iam:PassRole",
                "iam:ListPolicyVersions",
                "iam:ListAttachedRolePolicies",
                "iam:UntagPolicy",
                "iam:UpdateRole",
                "iam:ListRolePolicies",
                "iam:GetRolePolicy"
            ],
            "Resource": [
                "arn:aws:iam::REDACTED_ACCOUNT_ID:policy/policy-alexa-lambda-dynamod",
                "arn:aws:iam::REDACTED_ACCOUNT_ID:policy/policy-alexa-lambda-execution",
                "arn:aws:iam::REDACTED_ACCOUNT_ID:role/alexa-skill-movies-lambda-role"
            ]
        },
        {
            "Sid": "ListPermissions",
            "Effect": "Allow",
            "Action": [
                "iam:ListPolicies",
                "iam:ListRoles"
            ],
            "Resource": "*"
        }
    ]
}
```

- `policy-alexa-lambda-deployer`

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "EditPermissions",
            "Effect": "Allow",
            "Action": [
                "lambda:CreateFunction",
                "lambda:TagResource",
                "lambda:ListVersionsByFunction",
                "lambda:GetFunction",
                "lambda:UpdateFunctionConfiguration",
                "lambda:UntagResource",
                "lambda:GetFunctionCodeSigningConfig",
                "lambda:UpdateFunctionCode",
                "iam:PassRole",
                "lambda:AddPermission",
                "lambda:ListTags",
                "lambda:RemovePermission",
                "lambda:GetPolicy"
            ],
            "Resource": [
                "arn:aws:lambda:REDACTED_REGION:REDACTED_ACCOUNT_ID:function:alexa-skill-movie-stream",
                "arn:aws:iam::REDACTED_ACCOUNT_ID:role/alexa-skill-movies-lambda-role"
            ]
        },
        {
            "Sid": "ListPermissions",
            "Effect": "Allow",
            "Action": "lambda:ListFunctions",
            "Resource": "*"
        }
    ]
}
```

- `policy-alexa-logs-deployer`

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "EditPermissions",
            "Effect": "Allow",
            "Action": [
                "logs:ListTagsLogGroup",
                "logs:TagLogGroup",
                "logs:UntagLogGroup",
                "logs:CreateLogGroup"
            ],
            "Resource": "arn:aws:logs:REDACTED_REGION:REDACTED_ACCOUNT_ID:log-group:/aws/lambda/alexa-skill-movie-stream:*"
        },
        {
            "Sid": "ListPermissions",
            "Effect": "Allow",
            "Action": "logs:DescribeLogGroups",
            "Resource": "*"
        }
    ]
}
```

- `policy-alexa-s3-deployer`

Note in this case that several permissions are necessary for Terraform to interact with the backend where the state lives.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "EditPermissions",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObjectAcl",
                "s3:GetObject",
                "s3:PutBucketTagging",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::alexa-skill-terraform-backend/*",
                "arn:aws:s3:::alexa-skill-terraform-backend"
            ]
        },
        {
            "Sid": "GetPermissions",
            "Effect": "Allow",
            "Action": [
                "s3:GetEncryptionConfiguration",
                "s3:GetLifecycleConfiguration",
                "s3:Get*Configuration",
                "s3:GetAccelerateConfiguration",
                "s3:GetBucket*"
            ],
            "Resource": [
                "arn:aws:s3:::alexa-skill-terraform-backend",
                "arn:aws:s3:REDACTED_REGION:REDACTED_ACCOUNT_ID:storage-lens/*"
            ]
        }
    ]
}
```

### Variables

A `terraform.tfvars` file is heavily encouraged as to simplify the development process and secret management. The contents should be the following:

```
account_id  = "XXXX"
region      = "XXXX"
backend_url = "XXXX"
backend_key = "XXXX"
skill_id    = "ALEXA_SKILL_ID"
```

### Running Terraform

If you intend to run Terraform for the first time before migrating the state to a backend. Follow these steps:

1. Initialize the stack (`terraform init`).
2. Temporarily remove the `backend.tf` file from your configuration.
3. Run the stack (`terraform apply`).
4. Add back the `backend.tf` file.
5. Initialize the stack again (`terraform init`) and opt to migrate the state to the backend.

### Testing Deployment Account for CI/CD Locally

To configure a specific profile, use the following command and following the instructions:

```bash
aws configure --profile alexa-deployer
```

Once the profile is set, create an environment variable for the AWS profile:

```bash
export AWS_PROFILE="alexa-deployer"
```

Then you can reconfigure Terraform with `terraform init -reconfigure` and run the init or plan commands to see if the account has enough permissions.

## Codebase

### Dependencies

Start by installing all dependencies:

```
npm i
```

### Development & Testing

It is possible to debug the Lambda function locally, but is simpler to do it using the Alexa inteface. In case you want to debug locally, follow this [guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-using-invoke.html).

### Skill Handler

The skill handler (`src/index.js`) is very simple to configure, as it mostly involves importing the intent handlers and adding them as possible request handlers.

```javascript
const Alexa = require('ask-sdk-core');
const {
  // ... handlers
} = require('./handlers');

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers
  // ... handlers
  ()
  .addErrorHandlers(ErrorHandler)
  // API Client to use other features from Alexa
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
```

Intent handlers are the handlers that take care of each of the requests that a user might generate.

### Intent Handler

All intent handlers live on `src/handlers` as `something.handler.js` for organization. All handlers have the same structure:

```javascript
const CustomHandler = {
  // Determines whether this handler can actually handle the intent or not
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'MyCustomIntent'
    );
  },
  // Actually handles the intent and does something
  handle(handlerInput) {
    const speechText = `My custom speech text`;
    const cardText = `My custom card text`;

    // Returns a special Alexa response
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(cardText, speechText)
      .getResponse();
  }
};

module.exports = CustomHandler;
```

### Other Files

Files within `src/utils` and `src/locales` are mostly utilities to help with the development.

## Skill Configuration

By using Terraform, the skill configuration process is simplified significantly, as much of the configuration comes from the infrastructure. These are the steps to configure and release the Alexa skill:

1. Create an [Amazon Developer Account](https://developer.amazon.com/en-US/docs/alexa/ask-overviews/create-developer-account.html).
2. Sign in to the [Alexa developer console](https://developer.amazon.com/alexa/console/ask).
3. Within the **Skills** tab, click on **Create Skill**.
4. On the **Create a new skill** page, provide the following information:
   1. For **Skill name**, enter `My Custom Skill` in the box.
   2. For **Primary locale**, choose **English (US)**.
   3. For **Choose a model to add to your skill**, choose **Custom**.
   4. For **Choose a method to host your skill's backend resources**, choose **Alexa-hosted (Node.js)**.
   5. In the upper-right corner, click **Create skill**.
5. On the **Choose a template to add to your skill** page, leave the **Start from Scratch** template selected.
6. In the upper-right corner, click **Continue with template**.
7. Assign a skill invocation name.
   1. On the **Build** tab, in the left pane, click **CUSTOM > Invocations > Skill Invocation Name**.
   2. For **Skill Invocation Name**, enter `my custom skill`.
   3. To save and build your model, click **Save Model**, and then click **Build Model**.
   4. To deploy your skill code, open the **Code** tab, and then, in the upper-right corner, click **Deploy**.
8. Test your skill in the Alexa simulator.
   1. Open the **Test** tab.
   2. To enable your skill for testing, locate **Test is disabled for this skill**, and then, from the drop-down list, select **Development**.
   3. To test with voice, in the **Will you allow developer.amazon.com to use your microphone?** pop-up, select **Allow**.
   4. In the **Alexa Simulator** pane, enter `open my custom skill`, but omit `Alexa` from the string Or, to use voice, click and hold the microphone, and then speak an utterance.
   5. If the test is successful, Alexa says, `"OK."`
   6. Repeat steps 4 and 5 for the utterances `hello`, `help`, and `cancel`.
   7. If the skill doesn't perform as expected, see [Troubleshooting](https://developer.amazon.com/en-US/docs/alexa/custom-skills/tutorial-use-the-developer-console-to-build-your-first-alexa-skill.html#troubleshooting).
9. Ensure that the model has no utterance conflicts (you might not see this option if there are no conflics).
   1. Open the **Build** tab.
   2. In the left pane, click **CUSTOM > Interaction Model > Utterance Conflicts (0)**.
   3. If any number other than **(0)** appears next to the term **Utterance Conflicts**, click the error message for details.
   4. [Resolve the conflicts](https://developer.amazon.com/en-US/docs/alexa/custom-skills/tutorial-use-the-developer-console-to-build-your-first-alexa-skill.html#troubleshooting), and then press **Ctrl+R** to refresh your browser window.
   5. Repeat until you see **Utterance Conflicts (0)**.
10. Supply metadata to your skill.
    1. Open the **Distribution** tab.
    2. On the **English (US) Store Preview** page, in the **Public Name** box, enter `My Custom Skill`.
    3. In the **One Sentence Description** box, enter the appropriate text.
    4. In the **Detailed description** box, enter the appropriate text.
    5. Leave the **What's New** box blank.
    6. In the **Example Phrase 101** pane, click **More**.
    7. One by one, enter the example launch phrases. After each entry, to add a new phrase, click the plus sign (+). Some examples could be `Alexa, open my custom skill`, `Alexa, ask my custom skill to start`, or `Alexa, launch my custom skill`.
    8. In the **Category** box, choose **Social > Communication**.
    9. In the **Keywords** box, enter some appropriate keywords.
11. Add a custom icon. _(optional)_
    1. If you don't have logo art of your own, use the free [Alexa Icon Builder](https://developer.amazon.com/docs/tools/icon-builder.html) to create it.
    2. In a new browser tab, open the Alexa Icon Builder.
    3. In the keyword search box, search for an icon and select it.
    4. In the **Icon** menu at right, to open the color window, click the box next to **Icon**.
    5. To set the icon color, click **Solid color**, and then click to choose a color.
    6. Click anywhere to close the color selector.
    7. To choose a background color, click the box next to **Icon background**, click **Solid color**, and then click to choose a color.
    8. To choose a border color, click the box next to **Icon border**, click **Solid color**, and then click to choose a color. Or, to remove the border, move the slider to the left.
    9. To add an icon shadow, click the box next to **Icon shadow**, and then click to choose a color. Or, to remove the shadow, move the slider to the left.
    10. To download the icons in two sizes, click **Download**. Alexa creates logo files for you in the correct sizes, and then stores them in a .zip file.
    11. On your computer, unzip the images file.
    12. In the developer console, open **Distribution > Skill Preview**.
    13. Drag each icon file into its designated space.
    14. Click Save and continue, and then view your finished icons.
12. Supply privacy, terms of use, compliance, and availability data for your skill.
    1. Open the **Distribution** tab.
    2. Click **Skill Preview > English (US)**.
    3. In the **Privacy Policy URL** box, if you have a privacy policy, enter a URL, or if you don't, leave the box blank. A privacy policy is optional unless your skill links to users' accounts or collects user information. This skill does not.
    4. In the **Terms of Use URL** box, if you have a terms of use agreement, enter a URL, or if you don't, leave the box blank. A terms of use agreement is optional. If you do require consent to such an agreement, however, you must supply it separately for each locale.
    5. On the **Distribution** tab, click **Privacy & Compliance**.
    6. Answer each question appropriately.
    7. Select the **Export Compliance** check box.
    8. In the **Testing Instructions** box, enter the following lines.
    ```
    System requirements: None
    To begin, say "Alexa, open Hello World."
    ```
    9. Click **Save and continue**.
13. Enable permissions to ask for the device location.
    1. Within the **Build** tab, go to **TOOLS > Permissions**.
    2. Find the option that reads `Country/Region & Postal Code Only` and check it.
14. Copy the **Skill ID** for the Lambda Function. Your Lambda trigger will use skill verification, you need the Skill ID for this.
    1. Within the **Build** tab, go to **CUSTOM > Endpoint**.
    2. Find the text that reads `Your Skill ID` and copy the value. It should look something like this `amzn1.ask.skill.ID_HERE`.
    3. Keep this value handy for Terraform, but don't share it.

### Skill Testing

You can test your skill using the Alexa Simulator. You can find it within the **Test** tab in the Alexa Developer Console. If it seems disabled, use the dropdown to set testing for development.

## Workflows

This repository contains 3 main workflows:

1. [`automatic-release`](.github/workflows/automatic-release.yml) --> Runs the Terraform stack to deploy changes and generates a new release with release notes.
2. [`linting`](.github/workflows/linting.yml) --> Lints the JavaScript code to make sure it follows a consistent format.
3. [`testing`](.github/workflows/testing.yml) --> Validates the Terraform stack to make sure format and contents are valid.

There is an extra workflow, but this is automatically added by GitHub Pages to build the page.
