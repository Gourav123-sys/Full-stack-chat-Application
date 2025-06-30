import express from "express";
import Message from "../models/messageModel.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import sharp from "sharp";

const messageRouter = express.Router();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "chat-app",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "pdf",
      "doc",
      "docx",
      "txt",
      "xls",
      "xlsx",
    ],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and text files
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only images, documents, and text files are allowed."
        ),
        false
      );
    }
  },
});

//send message (text only)
messageRouter.post("/", protect, async (req, res) => {
  try {
    const { content, groupId } = req.body;
    const message = await Message.create({
      content,
      group: groupId,
      sender: req.user._id,
      messageType: "text",
    });
    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "username email"
    );
    res.json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//upload file and send message
messageRouter.post(
  "/file",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      const { content, groupId } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Determine message type based on file mimetype
      let messageType = "file";
      if (file.mimetype.startsWith("image/")) {
        messageType = "image";
      } else if (
        file.mimetype.includes("pdf") ||
        file.mimetype.includes("document") ||
        file.mimetype.includes("text/")
      ) {
        messageType = "document";
      }

      // Create thumbnail for images
      let thumbnailUrl = null;
      if (file.mimetype.startsWith("image/")) {
        try {
          const thumbnailResult = await cloudinary.v2.uploader.upload(
            file.path,
            {
              folder: "chat-app/thumbnails",
              width: 200,
              height: 200,
              crop: "fill",
              quality: "auto",
            }
          );
          thumbnailUrl = thumbnailResult.secure_url;
        } catch (error) {
          console.error("Error creating thumbnail:", error);
        }
      }

      const message = await Message.create({
        content: content || `Sent ${file.originalname}`,
        group: groupId,
        sender: req.user._id,
        messageType,
        file: {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: file.path,
          thumbnailUrl,
        },
      });

      const populatedMessage = await Message.findById(message._id).populate(
        "sender",
        "username email"
      );

      res.json(populatedMessage);
    } catch (error) {
      console.error("File upload error:", error);
      res.status(400).json({ message: error.message });
    }
  }
);

//get messages for a group
messageRouter.get("/:groupId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId })
      .populate("sender", "username email")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default messageRouter;
