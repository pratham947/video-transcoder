import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import fs from "fs";

import dotenv from "dotenv";

dotenv.config();

if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY || !process.env.REGION) {
  throw new Error("Missing required environment variables for AWS configuration.");
}

const client = new S3Client({
  region: process.env.REGION ?? "",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
  },
});

const bucketName = process.env.BUCKET_NAME ?? "";

export const uploadToS3 = async (key: any, filePath: any) => {
  try {
    const fileStream = fs.createReadStream(filePath);
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
      ContentType: "video/mp4",
    });
    const response = await client.send(command);
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
  }
};

const getVideoKey = async (key: string, bucketName: string) => {
  const listObjectParams = {
    Bucket: bucketName,
    Prefix: `${key}/`,
  };
  try {
    const command = new ListObjectsV2Command(listObjectParams);

    const data = await client.send(command);

    const videoKeys = data.Contents?.map((content) => content.Key);

    const videoKeysFiltered = videoKeys?.filter((key) => !key?.endsWith("/"));

    return videoKeysFiltered;
  } catch (error) {
    console.log("some error in s3", error);
    throw error;
  }
};

export const getVideoUrl = async (key: string, bucket: string) => {
  console.log(process.env.S3_ACCESS_KEY);

  const videoKey = await getVideoKey(key, bucket);

  const signedUrl: string[] = [];

  if (!videoKey) return;

  await Promise.all(
    videoKey.map(async (vidKey) => {
      const getObjectParams = {
        Bucket: "output-decoded",
        Key: vidKey,
      };

      try {
        const command = new GetObjectCommand(getObjectParams);

        const url: string = await getSignedUrl(client, command, {
          expiresIn: 7 * 24 * 60 * 60,
        });

        signedUrl.push(url);
      } catch (error) {
        console.log(error);
      }
    })
  );
  return signedUrl;
};
