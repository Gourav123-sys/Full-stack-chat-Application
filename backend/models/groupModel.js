import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Security features
    isSecure: {
      type: Boolean,
      default: false,
    },
    pendingMembers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Group settings
    allowFileSharing: {
      type: Boolean,
      default: true,
    },
    maxFileSize: {
      type: Number,
      default: 10 * 1024 * 1024, // 10MB default
    },
    allowedFileTypes: [
      {
        type: String,
        default: ["image/*"],
      },
    ],
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);
export default Group;
