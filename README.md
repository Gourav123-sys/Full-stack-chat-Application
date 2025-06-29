# Real-Time Chat Application

A modern, real-time chat application built with React, Node.js, Express, MongoDB, and Socket.IO.

## Features

- 🔐 **User Authentication** - Secure login and registration with JWT
- 👥 **Group Management** - Create, join, and leave chat groups
- 💬 **Real-Time Messaging** - Instant message delivery with Socket.IO
- ⌨️ **Typing Indicators** - See when others are typing
- 👤 **Online Status** - Track who's currently online
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- Socket.IO Client
- React Router DOM
- React Toastify
- React Icons

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JWT Authentication
- bcryptjs for password hashing

## Project Structure

```
chat-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Node.js backend server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   ├── socket.js           # Socket.IO configuration
│   ├── server.js           # Express server
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:

   ```env
   MONGO_URI=mongodb://localhost:27017/chat-app
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be running on `http://localhost:5173`

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### Groups

- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create a new group (admin only)
- `POST /api/groups/:groupId/join` - Join a group
- `POST /api/groups/:groupId/leave` - Leave a group

### Messages

- `GET /api/messages/:groupId` - Get messages for a group
- `POST /api/messages` - Send a new message

## Socket.IO Events

### Client to Server

- `join room` - Join a chat room
- `leave room` - Leave a chat room
- `new message` - Send a new message
- `typing` - User is typing
- `stop typing` - User stopped typing

### Server to Client

- `message recieved` - New message received
- `Users in room` - List of users in the room
- `user joined` - User joined the room
- `user left` - User left the room
- `notification` - Room notifications
- `user typing` - User started typing
- `user stop typing` - User stopped typing

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Join Groups**: Browse available groups and join the ones you're interested in
3. **Start Chatting**: Click on a joined group to start chatting
4. **Real-Time Features**: Enjoy real-time messaging, typing indicators, and online status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


