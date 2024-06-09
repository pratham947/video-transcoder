import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(path.dirname(__dirname)), "uploads/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const fileFilter = (req: any, file: any, cb: any) => {
  const filetypes = /mp4|avi|mkv/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("File type not supported"));
};

const uploadVideo = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 50 },
});

export { uploadVideo };
