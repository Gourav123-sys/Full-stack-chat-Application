import express from "express";
import Group from "../models/groupModel.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const groupRouter = express.Router();

// Socket.io instance (will be set from server.js)
let io;

// Function to set socket.io instance
export const setSocketIO = (socketIO) => {
  io = socketIO;
};

//create a new group
groupRouter.post("/", protect, isAdmin, async (req, res) => {
  try {
    const { name, description, isSecure } = req.body;
    const group = await Group.create({
      name,
      description,
      isSecure: isSecure || false,
      admin: req.user._id,
      members: [req.user._id],
    });
    const populatedGroup = await Group.findById(group._id)
      .populate("admin", "username email")
      .populate("members", "username email")
      .populate("pendingMembers.user", "username email");

    // Emit socket event for new group
    if (io) {
      io.emit("new group available", {
        group: populatedGroup,
        createdBy: req.user,
        timestamp: new Date(),
      });
    }

    res.status(201).json(populatedGroup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//get all groups
groupRouter.get("/", protect, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("admin", "username email")
      .populate("members", "username email")
      .populate("pendingMembers.user", "username email");
    res.json(groups);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//join group
// If group is secure, add to pendingMembers. Otherwise, add to members directly.
groupRouter.post("/:groupId/join", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(401).json({ message: "Group not found" });
    }

    console.log("Join request:", {
      groupId: req.params.groupId,
      groupName: group.name,
      isSecure: group.isSecure,
      userId: req.user._id,
      isAlreadyMember: group.members.includes(req.user._id),
      hasPendingRequest: group.pendingMembers.some(
        (m) => m.user.toString() === req.user._id.toString()
      ),
    });

    if (group.members.includes(req.user._id)) {
      return res.status(400).json({
        message: "Already a member of this group",
      });
    }
    if (group.isSecure) {
      // Check if already requested
      if (
        group.pendingMembers.some(
          (m) => m.user.toString() === req.user._id.toString()
        )
      ) {
        console.log("User already has pending request for secure group");
        return res.status(400).json({
          message: "Already requested to join. Awaiting admin approval.",
        });
      }
      group.pendingMembers.push({ user: req.user._id });
      await group.save();
      console.log("Added to pending members for secure group");
      console.log(
        "Group members after request:",
        group.members.map((m) => m.toString())
      );
      console.log(
        "Group pending members after request:",
        group.pendingMembers.map((m) => m.user.toString())
      );

      // Emit socket event for join request
      if (io) {
        io.emit("group join request", {
          groupId: group._id,
          groupName: group.name,
          user: req.user,
          timestamp: new Date(),
        });
      }

      return res.json({
        message: "Join request sent. Awaiting admin approval.",
      });
    } else {
      group.members.push(req.user._id);
      await group.save();
      console.log("Added to members for regular group");

      // Emit socket event for group joined
      if (io) {
        io.emit("group updated", {
          groupId: group._id,
          groupName: group.name,
          user: req.user,
          action: "joined",
          timestamp: new Date(),
        });
      }

      return res.json({ message: "Group joined successfully" });
    }
  } catch (error) {
    console.error("Join group error:", error);
    res.status(400).json({ message: error.message });
  }
});

//leave group
// POST /:groupId/leave
// Removes the user from the group's members array
// Requires authentication

groupRouter.post("/:groupId/leave", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    const memberIndex = group.members.indexOf(req.user._id);
    if (memberIndex === -1) {
      return res
        .status(400)
        .json({ message: "You are not a member of this group" });
    }
    group.members.splice(memberIndex, 1);
    await group.save();

    // Emit socket event for group left
    if (io) {
      io.emit("group updated", {
        groupId: group._id,
        groupName: group.name,
        user: req.user,
        action: "left",
        timestamp: new Date(),
      });
    }

    res.json({ message: "Left the group successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: get pending join requests for a group
groupRouter.get("/:groupId/pending", protect, isAdmin, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate(
      "pendingMembers.user",
      "username email"
    );
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.admin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not group admin" });
    res.json(group.pendingMembers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: approve join request
groupRouter.post(
  "/:groupId/approve/:userId",
  protect,
  isAdmin,
  async (req, res) => {
    try {
      const group = await Group.findById(req.params.groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });
      if (group.admin.toString() !== req.user._id.toString())
        return res.status(403).json({ message: "Not group admin" });
      const pendingIndex = group.pendingMembers.findIndex(
        (m) => m.user.toString() === req.params.userId
      );
      if (pendingIndex === -1)
        return res.status(404).json({ message: "No such pending request" });

      const approvedUser = group.pendingMembers[pendingIndex].user;
      group.members.push(approvedUser);
      group.pendingMembers.splice(pendingIndex, 1);
      await group.save();

      // Emit socket events for approval
      if (io) {
        // Notify about group update
        io.emit("group updated", {
          groupId: group._id,
          groupName: group.name,
          user: approvedUser,
          action: "joined",
          timestamp: new Date(),
        });

        // Notify the approved user specifically
        io.emit("join request status", {
          groupId: group._id,
          groupName: group.name,
          user: approvedUser,
          status: "approved",
          timestamp: new Date(),
        });
      }

      res.json({ message: "User approved and added to group" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Admin: reject join request
groupRouter.post(
  "/:groupId/reject/:userId",
  protect,
  isAdmin,
  async (req, res) => {
    try {
      const group = await Group.findById(req.params.groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });
      if (group.admin.toString() !== req.user._id.toString())
        return res.status(403).json({ message: "Not group admin" });
      const pendingIndex = group.pendingMembers.findIndex(
        (m) => m.user.toString() === req.params.userId
      );
      if (pendingIndex === -1)
        return res.status(404).json({ message: "No such pending request" });

      const rejectedUser = group.pendingMembers[pendingIndex].user;
      group.pendingMembers.splice(pendingIndex, 1);
      await group.save();

      // Emit socket event for rejection
      if (io) {
        io.emit("join request status", {
          groupId: group._id,
          groupName: group.name,
          user: rejectedUser,
          status: "rejected",
          timestamp: new Date(),
        });
      }

      res.json({ message: "User join request rejected" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Admin: get all pending join requests for groups where user is admin
groupRouter.get("/admin/pending", protect, isAdmin, async (req, res) => {
  try {
    const groups = await Group.find({ admin: req.user._id, isSecure: true })
      .populate("pendingMembers.user", "username email")
      .select("name pendingMembers");

    const pendingData = groups.map((group) => ({
      groupId: group._id,
      groupName: group.name,
      pendingMembers: group.pendingMembers,
    }));

    res.json(pendingData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default groupRouter;
