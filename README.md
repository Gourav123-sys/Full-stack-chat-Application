# ChatVerse - Modern Chat Application

A full-stack real-time chat application built with React, Node.js, Express, MongoDB, and Socket.IO. Features modern UI, file sharing, and admin security controls.

## 🌐 Live Demo

- **Frontend**: [https://full-stack-chat-application-chi.vercel.app/](https://full-stack-chat-application-chi.vercel.app/)
- **Backend API**: [https://full-stack-chat-application-zz0h.onrender.com](https://full-stack-chat-application-zz0h.onrender.com)

## 🚀 Features

### Core Chat Features

- **Real-time messaging** with Socket.IO
- **Group chat** functionality
- **Online/offline** user status
- **Typing indicators**
- **Message timestamps** with smart formatting
- **Responsive design** for all devices

### 🔐 Security & Admin Features

- **Secure Groups**: Admins can create secure groups that require approval to join
- **Admin Approval System**: Join requests for secure groups must be approved by group admins
- **Pending Requests Management**: Admins can view and manage pending join requests
- **User Authentication** with JWT tokens
- **Admin Role Management**: Special admin privileges for group management

### 📁 File Sharing

- **Image Support**: Share and preview images directly in chat
- **Document Sharing**: Upload and share PDFs, Word documents, Excel files
- **Text Files**: Share text files and code snippets
- **File Preview**: Images show thumbnails, documents show file info
- **Download Support**: All files can be downloaded by recipients
- **File Size Limits**: 10MB maximum file size
- **Supported Formats**:
  - Images: JPG, JPEG, PNG, GIF
  - Documents: PDF, DOC, DOCX
  - Spreadsheets: XLS, XLSX
  - Text: TXT, CSV

### 🎨 Modern UI/UX

- **Light Theme** with gradients and smooth animations
- **Mobile Responsive** design with toggleable sidebar
- **Glass Morphism** effects on mobile overlays
- **Smooth Animations** and transitions
- **Modern Chat Bubbles** with proper message styling
- **File Attachment UI** with preview and download options

## 🛠️ Tech Stack

### Frontend

- **React 18** with Vite
- **Socket.IO Client** for real-time communication
- **Tailwind CSS** for styling
- **React Icons** for beautiful icons
- **React Router** for navigation
- **Axios** for API calls

### Backend

- **Node.js** with Express
- **MongoDB** with Mongoose
- **Socket.IO** for real-time features
- **JWT** for authentication
- **Multer** for file uploads
- **Cloudinary** for file storage
- **Sharp** for image processing

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
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
```

Start the frontend:

```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `PORT`: Server port (default: 5000)

### File Upload Settings

- Maximum file size: 10MB
- Supported file types: Images, PDFs, Documents, Text files
- File storage: Cloudinary (with automatic image optimization)

## 📱 Usage

### Creating Groups

1. **Regular Groups**: Anyone can join immediately
2. **Secure Groups**:
   - Created by admins only
   - Require admin approval to join
   - Show shield icon in group list

### File Sharing

1. Click the paperclip icon in the chat input
2. Select a file (images, documents, etc.)
3. Add optional message text
4. Send the message
5. Files are automatically uploaded and shared

### Admin Features

1. **Create Groups**: Admins can create new groups
2. **Manage Secure Groups**: Set groups as secure requiring approval
3. **Review Requests**: View and approve/reject join requests
4. **Pending Requests Counter**: Shows number of pending requests

### Mobile Experience

- **Toggleable Sidebar**: Slide-in sidebar on mobile
- **Responsive Design**: Optimized for all screen sizes
- **Touch-Friendly**: Large touch targets and smooth gestures

## 🔒 Security Features

### Group Security

- **Secure Groups**: Only admins can create secure groups
- **Approval System**: Join requests must be approved by group admin
- **Request Management**: Admins can approve or reject requests
- **Audit Trail**: All join requests are tracked with timestamps

### File Security

- **File Type Validation**: Only allowed file types can be uploaded
- **Size Limits**: 10MB maximum file size
- **Secure Storage**: Files stored in Cloudinary with secure URLs
- **Access Control**: Only group members can access shared files

## 🚀 Deployment

### Backend Deployment

The backend can be deployed to platforms like:

- Heroku
- Railway
- Render
- DigitalOcean

### Frontend Deployment

The frontend can be deployed to:

- Vercel
- Netlify
- GitHub Pages

### Environment Setup

Make sure to set all required environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code comments

---

**ChatVerse** - Where conversations come to life with modern features and secure communication! 🚀

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
