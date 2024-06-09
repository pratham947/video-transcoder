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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoUrl = exports.uploadToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY || !process.env.REGION) {
    throw new Error("Missing required environment variables for AWS configuration.");
}
const client = new client_s3_1.S3Client({
    region: (_a = process.env.REGION) !== null && _a !== void 0 ? _a : "",
    credentials: {
        accessKeyId: (_b = process.env.S3_ACCESS_KEY) !== null && _b !== void 0 ? _b : "",
        secretAccessKey: (_c = process.env.S3_SECRET_KEY) !== null && _c !== void 0 ? _c : "",
    },
});
const bucketName = (_d = process.env.BUCKET_NAME) !== null && _d !== void 0 ? _d : "";
const uploadToS3 = (key, filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileStream = fs_1.default.createReadStream(filePath);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileStream,
            ContentType: "video/mp4",
        });
        const response = yield client.send(command);
        console.log(response);
        return response;
    }
    catch (error) {
        console.log(error);
    }
});
exports.uploadToS3 = uploadToS3;
const getVideoKey = (key, bucketName) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const listObjectParams = {
        Bucket: bucketName,
        Prefix: `${key}/`,
    };
    try {
        const command = new client_s3_1.ListObjectsV2Command(listObjectParams);
        const data = yield client.send(command);
        const videoKeys = (_e = data.Contents) === null || _e === void 0 ? void 0 : _e.map((content) => content.Key);
        const videoKeysFiltered = videoKeys === null || videoKeys === void 0 ? void 0 : videoKeys.filter((key) => !(key === null || key === void 0 ? void 0 : key.endsWith("/")));
        return videoKeysFiltered;
    }
    catch (error) {
        console.log("some error in s3", error);
        throw error;
    }
});
const getVideoUrl = (key, bucket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(process.env.S3_ACCESS_KEY);
    const videoKey = yield getVideoKey(key, bucket);
    const signedUrl = [];
    if (!videoKey)
        return;
    yield Promise.all(videoKey.map((vidKey) => __awaiter(void 0, void 0, void 0, function* () {
        const getObjectParams = {
            Bucket: "output-decoded",
            Key: vidKey,
        };
        try {
            const command = new client_s3_1.GetObjectCommand(getObjectParams);
            const url = yield (0, s3_request_presigner_1.getSignedUrl)(client, command, {
                expiresIn: 7 * 24 * 60 * 60,
            });
            signedUrl.push(url);
        }
        catch (error) {
            console.log(error);
        }
    })));
    return signedUrl;
});
exports.getVideoUrl = getVideoUrl;
