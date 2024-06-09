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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_middlewares_1 = require("./middlewares/multer.middlewares");
const uploads3_1 = require("./uploads3");
const redis_1 = require("redis");
const app = (0, express_1.default)();
const publisher = (0, redis_1.createClient)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
publisher.connect();
(() => __awaiter(void 0, void 0, void 0, function* () {
    const url = yield (0, uploads3_1.getVideoUrl)("1717898663769-653288118", "output-decoded");
    console.log(url);
}))();
app.post("/upload", multer_middlewares_1.uploadVideo.single("video"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const key = (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename.split(".")[0];
    const filePath = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
    const result = yield (0, uploads3_1.uploadToS3)(key, filePath);
    if (result) {
        publisher.lPush("videoIds", String(key));
        res.json({
            fileName: (_c = req.file) === null || _c === void 0 ? void 0 : _c.filename,
        });
    }
    else {
        res.json({
            success: false,
        });
    }
}));
app.listen(3000);
