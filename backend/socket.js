const socketIO = (io) => {
  //store connected users with their room information as socket.id as their key
  const connectedUsers = new Map();

  //handle new socket connections
  io.on("connection", (socket) => {
    //get user from authentication
    const user = socket.handshake.auth.user;
    console.log("User connected", user?.username);

    //start : join room handler
    socket.on("join room", (groupId) => {
      //add socket to the specified room
      socket.join(groupId);
      //store user and room info in connected users map
      connectedUsers.set(socket.id, { user, room: groupId });
      //get list of all users currently in the room
      const userInRoom = Array.from(connectedUsers.values())
        .filter((u) => u.room === groupId)
        .map((u) => u.user);
      //emit updated user list to all client in the room
      io.in(groupId).emit("Users in room", userInRoom);
      //broadcast join notification to all other users in the room
      socket.to(groupId).emit("notification", {
        type: "USER JOINED",
        message: `${user?.username || "Someone"} has joined the room`,
        user: user,
      });
    });
    //end : join room handler

    //start : leave room handler
    //triggered when user manually leaves a room
    socket.on("leave room", (groupId) => {
      console.log(`${user?.username} leaving room:`, groupId);
      // Remove socket from the room
      socket.leave(groupId);
      if (connectedUsers.has(socket.id)) {
        // Remove user from connected user and notify others
        connectedUsers.delete(socket.id);

        // Get updated list of users in the room
        const userInRoom = Array.from(connectedUsers.values())
          .filter((u) => u.room === groupId)
          .map((u) => u.user);

        // Emit updated user list to all clients in the room
        io.in(groupId).emit("Users in room", userInRoom);

        // Send leave notification to all other users in the room
        socket.to(groupId).emit("notification", {
          type: "USER LEFT",
          message: `${user?.username || "Someone"} has left the room`,
          user: user,
        });

        // Also emit user left event for immediate UI updates
        socket.to(groupId).emit("user left", user?.id || user?._id);
      }
    });
    //end : leave room handler

    //start : new message handler
    // Triggered when user send a new message
    socket.on("new message", (message) => {
      // Broadcast message to all other users in the room
      socket.to(message.groupId).emit("message recieved", message);
    });
    //end : new message handler

    //start : group events handler
    // Join group request
    socket.on("join group request", (data) => {
      console.log("Join group request:", data);
      // Notify admin of the group about the join request
      io.emit("group join request", {
        groupId: data.groupId,
        groupName: data.groupName,
        user: data.user,
        timestamp: new Date(),
      });
    });

    // Group joined (for regular groups or approved secure groups)
    socket.on("group joined", (data) => {
      console.log("Group joined:", data);
      // Notify all users about the group update
      io.emit("group updated", {
        groupId: data.groupId,
        groupName: data.groupName,
        user: data.user,
        action: "joined",
        timestamp: new Date(),
      });
    });

    // Group left
    socket.on("group left", (data) => {
      console.log("Group left:", data);
      // Notify all users about the group update
      io.emit("group updated", {
        groupId: data.groupId,
        groupName: data.groupName,
        user: data.user,
        action: "left",
        timestamp: new Date(),
      });
    });

    // Join request approved
    socket.on("join request approved", (data) => {
      console.log("Join request approved:", data);
      // Notify the user who was approved
      io.emit("join request status", {
        groupId: data.groupId,
        groupName: data.groupName,
        user: data.user,
        status: "approved",
        timestamp: new Date(),
      });
    });

    // Join request rejected
    socket.on("join request rejected", (data) => {
      console.log("Join request rejected:", data);
      // Notify the user who was rejected
      io.emit("join request status", {
        groupId: data.groupId,
        groupName: data.groupName,
        user: data.user,
        status: "rejected",
        timestamp: new Date(),
      });
    });

    // New group created
    socket.on("group created", (data) => {
      console.log("Group created:", data);
      // Notify all users about the new group
      io.emit("new group available", {
        group: data.group,
        createdBy: data.createdBy,
        timestamp: new Date(),
      });
    });
    //end : group events handler

    //start : disconnect handler
    // Triggered when user closes the connection
    socket.on("disconnect", () => {
      console.log(`${user?.username} disconnected`);
      if (connectedUsers.has(socket.id)) {
        // Get user's room info before removing
        const userData = connectedUsers.get(socket.id);
        const groupId = userData.room;

        // Remove user from connected Users
        connectedUsers.delete(socket.id);

        // Get updated list of users in the room
        const userInRoom = Array.from(connectedUsers.values())
          .filter((u) => u.room === groupId)
          .map((u) => u.user);

        // Emit updated user list to all clients in the room
        io.in(groupId).emit("Users in room", userInRoom);

        // Notify others in the room about user's departure
        socket.to(groupId).emit("notification", {
          type: "USER DISCONNECTED",
          message: `${user?.username || "Someone"} has gone offline`,
          user: user,
        });

        // Also emit user left event for immediate UI updates
        socket.to(groupId).emit("user left", user?.id || user?._id);
      }
    });
    //end : disconnect handler

    //start : typing indicator
    // Triggered when user starts typing
    socket.on("typing", ({ groupId, username }) => {
      console.log(`${username} is typing in room ${groupId}`);
      // Broadcast typing status to other users in the room
      socket.to(groupId).emit("user typing", { username });
    });

    socket.on("stop typing", ({ groupId }) => {
      console.log(`${user?.username} stopped typing in room ${groupId}`);
      // Broadcast stop typing status to other users in the room
      socket.to(groupId).emit("user stop typing", { username: user?.username });
    });
    //end : typing indicator
  });
};

export default socketIO;
