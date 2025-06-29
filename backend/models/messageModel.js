import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const messageSchema = new mongoose.Schema({
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
}, { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;


  