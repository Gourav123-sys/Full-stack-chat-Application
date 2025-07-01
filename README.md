# Talksy - Modern Group Chat Platform

A full-stack, real-time chat application for teams, friends, and communities. Built with React, Node.js, Express, MongoDB, and Socket.IO, Talksy features modern UI, secure group management, image sharing, and admin controls.

---

## 🌐 Live Demo

- **Frontend:** [https://full-stack-chat-application-chi.vercel.app/](https://full-stack-chat-application-chi.vercel.app/)
- **Backend API:** [https://full-stack-chat-application-zz0h.onrender.com](https://full-stack-chat-application-zz0h.onrender.com)

---

## 🚀 Features

### Core Chat

- Real-time group messaging (Socket.IO)
- Private and public groups
- Online/offline user status
- Typing indicators
- Message timestamps
- Responsive design (mobile & desktop)

### Admin & Security

- Secure groups (admin approval required to join)
- Admin dashboard for managing join requests
- JWT-based authentication
- Admin role management
- Audit trail for join requests

### Image Sharing

- Share images in chat (JPG, PNG, GIF, WebP)
- Image preview thumbnails
- Download support
- File size limit: 10MB

### Modern UI/UX

- Light theme with gradients and glass morphism
- Animated chat bubbles
- Mobile-friendly sidebar
- Smooth transitions and touch-friendly controls

### Security

- File type and size validation (images only)
- Secure file storage (Cloudinary)
- Access control: only group members can access files

---

## 🛠️ Tech Stack

### Frontend

- React 18 (Vite)
- Tailwind CSS
- Socket.IO Client
- React Router
- React Icons
- Axios

### Backend

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT (jsonwebtoken)
- Multer (file uploads)
- Cloudinary (file storage)
- Sharp (image processing)

### Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

---

## 📦 Setup & Installation

### Prerequisites

- Node.js (v16+)
- MongoDB database
- Cloudinary account (for file storage)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
```

Start the backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔧 Configuration

- All environment variables must be set in your deployment platform for production.
- File uploads are limited to 10MB and validated for type (images only).

---

## 📱 Usage Guide

### 1. Register & Login

- Create an account or login with your credentials.

### 2. Create or Join Groups

- Browse available groups or create a new one (admins only for secure groups).
- Join public groups instantly, or request to join secure groups (admin approval required).

### 3. Chat & Share Images

- Send messages in real-time.
- Attach images using the paperclip icon (JPG, PNG, GIF, WebP).
- See who is online and who is typing.

### 4. Admin Features

- Approve or reject join requests for secure groups.
- See pending requests and manage group members.

### 5. Mobile Experience

- Responsive sidebar and chat area.
- Touch-friendly controls and smooth animations.

---

## 🚀 Deployment

- **Frontend:** Deploy to Vercel, Netlify, or similar. (Vercel live: https://full-stack-chat-application-chi.vercel.app/)
- **Backend:** Deploy to Render, Railway, Heroku, etc. (Render live: https://full-stack-chat-application-zz0h.onrender.com)
- **Database:** MongoDB Atlas or self-hosted MongoDB.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 🆘 Support

- For issues, open a GitHub issue or contact the maintainer.
- Designed & Developed by Gourav Mondal

---

## 📚 API & Socket Events (Quick Reference)

### REST API

- `/api/users/register` - Register
- `/api/users/login` - Login
- `/api/groups` - List/Create groups
- `/api/groups/:groupId/join` - Join group
- `/api/groups/:groupId/leave` - Leave group
- `/api/messages/:groupId` - Get messages
- `/api/messages` - Send message

### Socket.IO Events

- `join room` / `leave room`
- `new message`
- `user typing` / `user stop typing`
- `notification` (join/leave/disconnect)
- `group updated` (admin actions)

---

## Project Structure

```
chat-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── config/         # API configuration
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

## Deployment

The application is deployed on:

- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas
