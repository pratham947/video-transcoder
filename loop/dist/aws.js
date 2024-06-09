"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFromS3 = exports.uploadToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = new client_s3_1.S3Client({
    region: (_a = process.env.REGION) !== null && _a !== void 0 ? _a : "",
    credentials: {
        accessKeyId: (_b = process.env.S3_ACCESS_KEY) !== null && _b !== void 0 ? _b : "",
        secretAccessKey: (_c = process.env.S3_SECRET_KEY) !== null && _c !== void 0 ? _c : "",
    },
});
const parentDir = path_1.default.join(__dirname, "..");
let mainDir = path_1.default.join(parentDir, "uploads");
function downloadFromS3(key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: process.env.BUCKET,
                Key: key,
            });
            const res = yield client.send(command);
            if (!res.Body)
                return;
            mainDir = path_1.default.join(mainDir, `${key}.mp4`);
            const writeSteam = fs_1.default.createWriteStream(mainDir);
            const readStream = res.Body;
            readStream.pipe(writeSteam);
            writeSteam.on("finish", () => {
                const filePath = mainDir;
                const dockerCommand = `docker run -d --name ${key} -v C:\\Users\\91626\\Documents\\Harkirat\\video-transcoder\\loop\\uploads:/uploads -e FILE_NAME=${key}.mp4 -e KEY=${key} new-img-7`;
                (0, child_process_1.exec)(dockerCommand, (error, stdout, stderr) => {
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
                    const finalPath = path_1.default.join(__dirname, "..", "uploads", key);
                    if (fs_1.default.existsSync(finalPath)) {
                        fs_1.default.readdir(finalPath, (err, files) => {
                            if (err)
                                return;
                            if (files.length < 3)
                                return;
                            exist = true;
                            (0, exports.uploadToS3)(key);
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
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.downloadFromS3 = downloadFromS3;
const uploadToS3 = (KEY) => {
    const finalPath = path_1.default.join(__dirname, "..", "uploads", KEY);
    fs_1.default.readdir(finalPath, (err, files) => {
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
exports.uploadToS3 = uploadToS3;
const Upload = (filePath, key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(filePath);
        const fileStream = fs_1.default.createReadStream(filePath);
        const uploadParams = {
            Bucket: process.env.OUTPUT_BUCKET,
            Key: `${key}/${path_1.default.basename(filePath)}`, // File name you want to save as in S3 (including folder path)
            Body: fileStream,
            ContentType: "video/mp4", // Adjust the MIME type if necessary
        };
        const command = new client_s3_1.PutObjectCommand(uploadParams);
        const response = yield client.send(command);
        console.log(response);
    }
    catch (error) {
        console.log(error);
    }
});
