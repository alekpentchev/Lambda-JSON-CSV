# List stack resources
aws cloudformation list-stack-resources --stack-name LambdaJsonCsvStack --endpoint-url=http://localhost:443

# List Lambda functions
aws lambda list-functions --endpoint-url=http://localhost:443

# List S3 Buckets
aws s3 ls --endpoint-url=http://localhost:443

# List S3 Bucket contents
aws s3 ls s3://lambdajsoncsvstack-bucketconstructbucketjso-73dbcc34 --endpoint-url=http://localhost:443

# Put dummy file in S3 Bucket
aws s3 cp ./dummyfile2.json s3://lambdajsoncsvstack-bucketconstructbucketjso-73dbcc34 --endpoint-url=http://localhost:443

# Tail Lambda logs
aws logs tail '/aws/lambda/LambdaJsonCsvStack-BucketNotificationsHandl-6c6eaf12' --follow --endpoint-url=http://localhost:443

# List CloudWatch log groups
aws logs describe-log-groups --endpoint-url=http://localhost:443