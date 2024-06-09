import express from "express";
import cors from "cors";
import { uploadVideo } from "./middlewares/multer.middlewares";
import { getVideoUrl, uploadToS3 } from "./uploads3";
import { createClient } from "redis";
import fs from "fs";

const app = express();

const publisher = createClient();

app.use(cors());

app.use(express.json());

publisher.connect();

(async () => {
  const url = await getVideoUrl("1717917394427-343266241", "output-decoded");
  console.log(url);
})();

app.post("/upload", uploadVideo.single("video"), async (req, res) => {
  const key = req.file?.filename.split(".")[0];
  const filePath = req.file?.path;
  const result: any = await uploadToS3(key, filePath);
  if (result) {
    publisher.lPush("videoIds", String(key));
    res.json({
      fileName: req.file?.filename,
    });
  } else {
    res.json({
      success: false,
    });
  }
});

app.listen(3000);
