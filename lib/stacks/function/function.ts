import { Construct } from "constructs";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";

export class LambdaFunctionConstruct extends Construct {
    lambdaFunction: NodejsFunction

    constructor(scope: Construct, id: string, bucketArn: string) {
        super(scope, id)

        // CDK will bundle the Node.js function together with its dependencies using esbuild
        this.lambdaFunction = new NodejsFunction(this, 'lambda-to-csv', {
            runtime: Runtime.NODEJS_16_X,
        })

        const s3GetObject = new PolicyStatement({
            actions: ['s3:GetObject*'],
            resources: [bucketArn]
        })

        this.lambdaFunction.role?.attachInlinePolicy(
            new Policy(this, 'lambda-get-s3', {
                statements: [s3GetObject]
            })
        )
    }
}