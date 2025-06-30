import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    // File attachment fields
    file: {
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      url: String,
      thumbnailUrl: String, // For images
    },
    messageType: {
      type: String,
      enum: ["text", "image", "document", "file"],
      default: "text",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
