import { Construct } from "constructs";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Duration, Stack } from "aws-cdk-lib";
import { SES_EMAIL_FROM, SES_REGION } from "../../../env";

export class LambdaFunctionConstruct extends Construct {
    lambdaFunction: NodejsFunction

    constructor(scope: Construct, id: string, bucketArn: string) {
        super(scope, id)

        // CDK will bundle the Node.js function together with its dependencies using esbuild
        this.lambdaFunction = new NodejsFunction(this, 'lambda-to-csv', {
            runtime: Runtime.NODEJS_16_X,
            memorySize: 1024,
            timeout: Duration.seconds(3)
        })

        const s3GetObjectStatement = new PolicyStatement({
            actions: ['s3:GetObject*'],
            resources: [bucketArn]
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

        this.lambdaFunction.role?.attachInlinePolicy(
            new Policy(this, 'lambda-get-s3', {
                statements: [
                    s3GetObjectStatement,
                    sendEmailsSESStatement
                ]
            })
        )
    }
}