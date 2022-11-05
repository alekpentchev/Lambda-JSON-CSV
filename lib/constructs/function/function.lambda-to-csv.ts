import { S3Event } from "aws-lambda";
import { AWSError } from "aws-sdk";
import s3 from "aws-sdk/clients/s3";
import SES from "aws-sdk/clients/ses";
import { PromiseResult } from "aws-sdk/lib/request";
import json2csv from "json2csv";
import nodemailer from "nodemailer";

const s3Client = new s3();
const ses = new SES();

interface IVaccinationInfo {
   "YearWeekISO": string,
   "FirstDose": number,
   "FirstDoseRefused": string,
   "SecondDose": number,
   "DoseAdditional1": number,
   "DoseAdditional2": number,
   "DoseAdditional3": number,
   "UnknownDose": number,
   "NumberDosesReceived": number,
   "NumberDosesExported": number,
   "Region": string,
   "Population": string,
   "ReportingCountry": string,
   "TargetGroup": string,
   "Vaccine": string,
   "Denominator": number
}
interface IJSONData {
   records: IVaccinationInfo[];
}

export const handler = async (event: S3Event) => {
   console.log('Starting lambda function');

   // get bucket name and key from event
   const bucketName = event.Records[0].s3.bucket.name;
   const key = event.Records[0].s3.object.key;

   console.log('bucketName: ', bucketName);
   console.log('key: ', key);

   // get json data from S3
   const response = await s3Client.getObject({
      Bucket: bucketName,
      Key: key,
   }).promise();

   // convert json to csv
   const csvArrayBuffer = formatJSON(response);

   // ses send raw email with attachment
   await sendEmail(csvArrayBuffer, ses);

};

function formatJSON(response: PromiseResult<s3.GetObjectOutput, AWSError>) {
   // convert json to csv
   if (!response.Body) { throw new Error("No data found in S3"); }

   const json: IJSONData = JSON.parse(response.Body.toString());
   const data = json.records
   const csv = json2csv.parse(data);
   const csvArrayBuffer = Buffer.from(csv);
   return csvArrayBuffer;
}

async function sendEmail(csvArrayBuffer: Buffer, ses: SES) {
   if (!process.env.SES_EMAIL_FROM) { throw new Error("SES_EMAIL_FROM is not defined"); }
   if (!process.env.SES_EMAIL_TO) { throw new Error("SES_EMAIL_TO is not defined"); }

   // send email with attachment with nodemailer and SES
   const transporter = nodemailer.createTransport({
      SES: ses
   });
   const mailOptions = {
      from: process.env.SES_EMAIL_FROM,
      to: process.env.SES_EMAIL_TO,
      subject: 'CSV file from S3',
      text: 'This is the body of the email.',
      attachments: [
         {
            filename: 'data.csv',
            content: csvArrayBuffer
         }
      ]
   };
   const email_response = await transporter.sendMail(mailOptions);
   console.log('email_response: ', email_response);
}
