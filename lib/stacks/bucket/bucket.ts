import { Construct } from "constructs";
import { Bucket, BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from "aws-cdk-lib";

export class BucketConstruct extends Construct {
    bucket: Bucket

    constructor(scope: Construct, id: string) {
        super(scope, id)

        this.bucket = new Bucket(this, 'bucket-json', {
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            versioned: true,
            removalPolicy: RemovalPolicy.RETAIN,
          });
    }
}