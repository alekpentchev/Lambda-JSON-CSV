import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BucketConstruct } from './stacks/bucket/bucket';
import { LambdaFunctionConstruct } from './stacks/function/function';

export class LambdaJsonCsvStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucketConstruct = new BucketConstruct(this, 'bucket-construct')    
    const functionConstruct = new LambdaFunctionConstruct(this, 'function-construct', bucketConstruct.bucket.bucketArn)
  
  }
}
