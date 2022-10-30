import { S3Event } from "aws-lambda";
import s3 from "aws-sdk/clients/s3";
import SES, { SendEmailRequest, SendRawEmailRequest } from "aws-sdk/clients/ses";
import json2csv from "json2csv";

export const handler = async (event: S3Event) => {
   console.log('Starting lambda function');

   // get bucket name and key from event
   const bucketName = event.Records[0].s3.bucket.name;
   const key = event.Records[0].s3.object.key;

   console.log('bucketName: ', bucketName);
   console.log('key: ', key);

   const s3Client = new s3();
   const ses = new SES();

   // get json data from S3
   const response = await s3Client.getObject({
      Bucket: bucketName,
      Key: key,
   }).promise();

   // convert json to csv
   if (!response.Body) { throw new Error("No data found in S3"); }

   const csv = json2csv.parse(JSON.parse(response.Body.toString()));
   const csvArrayBuffer = Buffer.from(csv);

   if (!process.env.SES_EMAIL_FROM) { throw new Error("SES_EMAIL_FROM is not defined"); }
   if (!process.env.SES_EMAIL_TO) { throw new Error("SES_EMAIL_TO is not defined"); }

   // ses send raw email with attachment
   const rawParams: SendRawEmailRequest = {
      Destinations: [process.env.SES_EMAIL_TO],
      RawMessage: {
         Data: Buffer.from(
            `From: ${process.env.SES_EMAIL_FROM}
            To: ${process.env.SES_EMAIL_TO}
            Subject: CSV file from S3
            MIME-Version: 1.0
            Content-Type: multipart/mixed; boundary="NextPart"
            --NextPart
            Content-Type: text/plain
            Content-Transfer-Encoding: 7bit
            This is the body of the email.
            --NextPart
            Content-Type: text/csv
            Content-Disposition: attachment; filename="data.csv"
            Content-Transfer-Encoding: base64
            ${csvArrayBuffer.toString('base64')}
            --NextPart--`
         )
      },
      Source: process.env.SES_EMAIL_FROM,
      SourceArn: process.env.SES_IDENTITY_ARN
   }
   // send email
   const raw_email_response = await ses.sendRawEmail(rawParams).promise();
   if (!raw_email_response.MessageId) { throw new Error("Email not sent"); }
   console.log('raw_email_response: ', raw_email_response);

};