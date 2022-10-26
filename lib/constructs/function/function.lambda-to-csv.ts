import { S3Event } from "aws-lambda";
import s3 from "aws-sdk/clients/s3";
import json2csv from "json2csv";

export const handler = async (event: S3Event) => {
   console.log('Starting lambda function');

   // get bucket name and key from event
   const bucketName = event.Records[0].s3.bucket.name;
   const key = event.Records[0].s3.object.key;

   console.log('bucketName: ', bucketName);
   console.log('key: ', key);

   const s3Client = new s3();

   // get json data from S3
   const response = await s3Client.getObject({
      Bucket: bucketName,
      Key: key,
   }).promise();

   // convert json to csv
   if (!response.Body) { throw new Error("No data found in S3"); }
   const csv = json2csv.parse(JSON.parse(response.Body.toString()));

   // send email with csv attachment to user using SES
};