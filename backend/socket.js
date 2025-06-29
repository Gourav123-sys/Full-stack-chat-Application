const socketIO = (io) => {
    //store connected users with their room information as socket.id as their key
    const connectedUsers = new Map();

    //handle new socket connections
    io.on('connection', (socket) => {
        //get user from authentication
        const user = socket.handshake.auth.user;
        console.log("User connected", user?.username);
        
        //start : join room handler
        socket.on('join room', (groupId) => {
            //add socket to the specified room
            socket.join(groupId);
            //store user and room info in connected users map
            connectedUsers.set(socket.id, {user, room: groupId});
            //get list of all users currently in the room
            const userInRoom = Array.from(connectedUsers.values()).filter((u) => u.room === groupId).map((u) => u.user);
            //emit updated user list to all client in the room
            io.in(groupId).emit("Users in room", userInRoom);
            //broadcast join notification to all other users in the room
            socket.to(groupId).emit("notification", {
                type: "USER JOINED",
                message: `${user?.username} has joined the room`,
                user: user
            })
        })
        //end : join room handler

        //start : leave room handler
        //triggered when user manually leaves a room
        socket.on("leave room", (groupId) => {
            console.log(`${user?.username} leaving room:`, groupId);
            // Remove socket from the room
            socket.leave(groupId);
            if(connectedUsers.has(socket.id)){
                // Remove user from connected user and notify others
                connectedUsers.delete(socket.id);
                socket.to(groupId).emit("user left", user?._id);
            }
        })
        //end : leave room handler

        //start : new message handler
        // Triggred when user send a new message
        socket.on("new message", (message) => {
            // Broadcast message to all other users in the room
            socket.to(message.groupId).emit("message recieved", message);
        })
        //end : new message handler

        //start : disconnect handler
        // Triggered when user closes the connection
        socket.on("disconnect", () => {
            console.log(`${user?.username} disconnected`);
            if(connectedUsers.has(socket.id)){
                // Get user's room info before removing
                const userData = connectedUsers.get(socket.id);
                // Notify others in the room about user's departure
                socket.to(userData.room).emit("user left", user?._id);
                // Remove user from connected Users
                connectedUsers.delete(socket.id);
            }
            
        })
        //end : disconnect handler

        //start : tryping indicator
        // Triggered when user starts typing
        socket.on("typing", ({groupId, username}) => {
            // Broadcast typing status to other users in the room
            socket.to(groupId).emit("user typing", { username })
        });

        socket.on("stop typing", ({groupId}) => {
            // Broadcast stop typing status to other users in the room
            socket.to(groupId).emit("user stop typing", { username: user?.username })
        });
        //end : typing indicator 

        
    })

}

export default socketIO;