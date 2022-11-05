import { Construct } from "constructs";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Duration, Stack } from "aws-cdk-lib";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { ComparisonOperator, Metric } from "aws-cdk-lib/aws-cloudwatch";
import { SES_REGION, SES_EMAIL_FROM, SES_EMAIL_TO } from "../../../env";

export class LambdaFunctionConstruct extends Construct {
    lambdaFunction: NodejsFunction
    
    constructor(scope: Construct, id: string, bucket: Bucket) {
        super(scope, id)

        // Define the Lambda function
        // CDK will bundle the Node.js function together with its dependencies using esbuild
        this.lambdaFunction = new NodejsFunction(this, 'lambda-to-csv', {
            runtime: Runtime.NODEJS_16_X,
            memorySize: 1024,
            timeout: Duration.seconds(10),
            bundling: {
                externalModules: ['aws-sdk'],
                nodeModules: ['json2csv', 'nodemailer'],
            },
            environment: {
                SES_REGION,
                SES_EMAIL_FROM,
                SES_EMAIL_TO ,
                SES_IDENTITY_ARN: `arn:aws:ses:${Stack.of(this).region}:${Stack.of(this).account}:identity/${SES_EMAIL_FROM}`,
            }
        })

        // add environment variables to lambda function
        this.lambdaFunction.addEnvironment('BUCKET', bucket.bucketName)

        // Create policies to attach to Lambda
        const s3GetObjectStatement = new PolicyStatement({
            actions: ['s3:GetObject*'],
            resources: [bucket.bucketArn, `${bucket.bucketArn}/*`]
        })

        // To let Lambda send emails from your email using SES
        // You must first verify your email in the SES console
        const sendEmailsSESStatement = new PolicyStatement({
            actions: [
                'ses:SendEmail',
                'ses:SendRawEmail',
                'ses:SendTemplatedEmail',
            ],
            resources: [
                `arn:aws:ses:${SES_REGION}:${Stack.of(this).account
                }:identity/${SES_EMAIL_FROM}`,
            ],
        })

        // Add inline policies to the Lambda execution role
        this.lambdaFunction.role?.attachInlinePolicy(
            new Policy(this, 'lambda-get-s3', {
                statements: [
                    s3GetObjectStatement,
                    sendEmailsSESStatement
                ]
            })
        )

        // Add Lambda event source to be triggered by
        // new object created in an S3 bucket
        const s3LambdaEventSource = new S3EventSource(
            bucket,
            { 
                events: [EventType.OBJECT_CREATED_PUT, EventType.OBJECT_CREATED_POST],
                filters: [{suffix: ".json"}]
            }
        )

        this.lambdaFunction.addEventSource(s3LambdaEventSource)
    
        // Create CloudWatch metrics for Lambda
        const errorExecutions = this.lambdaFunction.metricErrors({
            period: Duration.minutes(1)
        })

        // Create an alarm for Lambda errors
        errorExecutions.createAlarm(this, 'lambda-invocations-errors-alarm', {
            alarmDescription: 'Alarm if Lambda function errors exceed 1',
            alarmName: 'Lambda Errors',
            threshold: 1,
            evaluationPeriods: 1,
            comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD
        })
    }
}