import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { Readable } from "stream";
import dotenv from "dotenv";

dotenv.config();

const client = new S3Client({
  region: process.env.REGION ?? "",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
  },
});

const parentDir = path.join(__dirname, "..");

let mainDir = path.join(parentDir, "uploads");

async function downloadFromS3(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET,
      Key: key,
    });
    const res = await client.send(command);

    if (!res.Body) return;

    mainDir = path.join(mainDir, `${key}.mp4`);

    const writeSteam = fs.createWriteStream(mainDir);

    const readStream = res.Body as Readable;

    readStream.pipe(writeSteam);

    writeSteam.on("finish", () => {
      const filePath = mainDir;

      const dockerCommand = `docker run -d --name ${key} -v C:\\Users\\91626\\Documents\\Harkirat\\video-transcoder\\loop\\uploads:/uploads -e FILE_NAME=${key}.mp4 -e KEY=${key} new-img-7`;

      exec(dockerCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Command execution resulted in errors: ${stderr}`);
          return;
        }

        console.log("all working fine");
      });
      let exist = false;
      const intervalId = setInterval(() => {
        const finalPath = path.join(__dirname, "..", "uploads", key);
        if (fs.existsSync(finalPath)) {
          fs.readdir(finalPath, (err, files) => {
            if (err) return;
            if (files.length < 3) return;
            exist = true;
            uploadToS3(key);
            clearInterval(intervalId);
          });
        }
      }, 5000);
    });

    writeSteam.on("error", (e) => {
      console.log(e);
      console.log("something wrong happend");
    });

    // Pipe the object data from the response to the file stream
  } catch (error) {
    console.log(error);
  }
}

export const uploadToS3 = (KEY: string) => {
  const finalPath = path.join(__dirname, "..", "uploads", KEY);

  fs.readdir(finalPath, (err, files) => {
    if (err) {
      console.log("some error occured", err);
      return;
    }
    console.log("find");
    files.forEach((file) => {
      console.log(file);
      Upload(`${finalPath}\\${file}`, KEY);
    });
  });
};

const Upload = async (filePath: string, key: string) => {
  try {
    console.log(filePath);

    const fileStream = fs.createReadStream(filePath);

    const uploadParams = {
      Bucket: process.env.OUTPUT_BUCKET,
      Key: `${key}/${path.basename(filePath)}`, // File name you want to save as in S3 (including folder path)
      Body: fileStream,
      ContentType: "video/mp4", // Adjust the MIME type if necessary
    };

    const command = new PutObjectCommand(uploadParams);

    const response = await client.send(command);
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

export { downloadFromS3 };
