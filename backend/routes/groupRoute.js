import express from "express";
import Group from "../models/groupModel.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const groupRouter = express.Router();

//create a new group
groupRouter.post("/", protect, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const group = await Group.create({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id],
    });
    const populatedGroup = await Group.findById(group._id)
      .populate("admin", "username email")
      .populate("members", "username email");
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
      .populate("members", "username email");
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
        return res
          .status(400)
          .json({
            message: "Already requested to join. Awaiting admin approval.",
          });
      }
      group.pendingMembers.push({ user: req.user._id });
      await group.save();
      return res.json({
        message: "Join request sent. Awaiting admin approval.",
      });
    } else {
      group.members.push(req.user._id);
      await group.save();
      return res.json({ message: "Group joined successfully" });
    }
  } catch (error) {
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
      group.members.push(group.pendingMembers[pendingIndex].user);
      group.pendingMembers.splice(pendingIndex, 1);
      await group.save();
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
      group.pendingMembers.splice(pendingIndex, 1);
      await group.save();
      res.json({ message: "User join request rejected" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

export default groupRouter;
