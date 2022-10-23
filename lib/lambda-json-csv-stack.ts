import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BucketConstruct } from './constructs/bucket/bucket';
import { LambdaFunctionConstruct } from './constructs/function/function';

export class LambdaJsonCsvStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucketConstruct = new BucketConstruct(this, 'bucket-construct')    
    const functionConstruct = new LambdaFunctionConstruct(this, 'function-construct', bucketConstruct.bucket)
  
  }
}
