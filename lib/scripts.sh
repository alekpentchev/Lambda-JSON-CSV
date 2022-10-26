# List stack resources
aws cloudformation list-stack-resources --stack-name LambdaJsonCsvStack --endpoint-url=http://localhost:443

# List Lambda functions
aws lambda list-functions --endpoint-url=http://localhost:443

# Invoke Lambda function
aws lambda invoke output.json --function-name LambdaJsonCsvStack-functionconstructlambdat-6b63f92e --endpoint-url=http://localhost:443

# List S3 Buckets
aws s3 ls --endpoint-url=http://localhost:443

# List S3 Bucket contents
aws s3 ls s3://lambdajsoncsvstack-bucketconstructbucketjso-73dbcc34 --endpoint-url=http://localhost:443

# Put dummy file in S3 Bucket
aws s3 cp ./dummyfile.json s3://lambdajsoncsvstack-bucketconstructbucketjso-73dbcc34 --endpoint-url=http://localhost:443

# Tail Lambda logs
aws logs tail '/aws/lambda/LambdaJsonCsvStack-functionconstructlambdat-6b63f92e' --follow --endpoint-url=http://localhost:443

# List CloudWatch log groups
aws logs describe-log-groups --endpoint-url=http://localhost:443

# List CloudWatch log streams
aws logs describe-log-streams --log-group-name '/aws/lambda/LambdaJsonCsvStack-functionconstructlambdat-6b63f92e' --endpoint-url=http://localhost:443

# Get CloudWatch log events
aws logs get-log-events --log-group-name '/aws/lambda/LambdaJsonCsvStack-functionconstructlambdat-6b63f92e' --log-stream-name '2022/10/26/[LATEST]3f5ac587' --endpoint-url=http://localhost:443

# Describe log groups
aws logs describe-log-groups --log-group-name-prefix LambdaJsonCsvStack-BucketNotificationsHandl-6c6eaf12 --endpoint-url=http://localhost:443