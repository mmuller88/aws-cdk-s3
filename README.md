# aws-cdk-s3

An AWS CDK Stack with a JSON file to configure an S3 bucket

# Projen

[Projen](https://github.com/projen/projen) is a very cool framework to automatically synth project files. If you want make changes to git files like .gitignore or the package.json use .projen.js and run

```
npx projen
```

# AWS CDK

For deploy to AWS run:

```
yarn install
yarn deploy
```

For destroy run:

```
yarn destroy
```

# Misc

For a fast deploy iterating use

```
yes | yarn cdkDestroy && yarn cdkDeploy --require-approval never
```

# Troublshooting.

## SNS

sns:Publish must be allowed. It can be added manually in the AWS Console e.g:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "0",
      "Effect": "Allow",
      "Principal": {
        "Service": "s3.amazonaws.com"
      },
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:eu-central-1:981237193288:standardsns"
    }
  ]
}
```

## Lambda

lambda:InvokeFunction for Lambdas . How to add the policy is explained here https://docs.aws.amazon.com/lambda/latest/dg/access-control-resource-based.html

```json
{
  "Version": "2012-10-17",
  "Id": "default",
  "Statement": [
    {
      "Sid": "s3-stack-dev-buckettts3lambdatestAllowBucketNotificationsTos3stackdevlambdaEF1759CDD3B-17TOB9JRUU6M5",
      "Effect": "Allow",
      "Principal": {
        "Service": "s3.amazonaws.com"
      },
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:eu-central-1:981237193288:function:s3-stack-dev-lambda8B5974B5-WILJYGVTBZ00"
    }
  ]
}
```

## SQS

It can be added manually in the AWS Console

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "s3.amazonaws.com"
      },
      "Action": [
        "sqs:SendMessage",
        "sqs:GetQueueAttributes",
        "sqs:GetQueueUrl"
      ],
      "Resource": "arn:aws:sqs:eu-central-1:981237193288:s3-stack-dev-Queue4A7E3555-1N4N9OW9C9OFK"
    }
  ]
}
```
