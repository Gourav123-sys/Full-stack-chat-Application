# Talksy - Modern Group Chat Platform

A full-stack, real-time chat application for teams, friends, and communities. Built with React 19, Node.js, Express, MongoDB, and Socket.IO, Talksy features modern UI with glass morphism effects, secure group management, image sharing, and comprehensive admin controls.

---

## 🌐 Live Demo

- **Frontend:** [https://full-stack-chat-application-chi.vercel.app/](https://full-stack-chat-application-chi.vercel.app/)
- **Backend API:** [https://full-stack-chat-application-zz0h.onrender.com](https://full-stack-chat-application-zz0h.onrender.com)

---

## 🚀 Features

### 🔐 Authentication & Security

- **JWT-based authentication** with 30-day token expiration
- **Password encryption** using bcryptjs with salt rounds
- **Admin role management** with special privileges
- **Protected routes** with middleware authentication
- **Secure file uploads** with type and size validation
- **CORS configuration** for cross-origin requests

### 💬 Real-time Communication

- **Socket.IO integration** for instant messaging
- **Live typing indicators** showing when users are typing
- **Online/offline status** tracking with real-time updates
- **Instant notifications** for user join/leave/disconnect events
- **Real-time message delivery** with push notifications
- **Connection status monitoring** and error handling

### 👥 Group Management

- **Public groups** (instant join functionality)
- **Secure groups** (admin approval required to join)
- **Admin dashboard** for managing join requests
- **Group creation** (admin-only feature)
- **Member management** with join/leave functionality
- **Pending request system** for secure groups
- **Audit trail** for admin actions and group changes

### 📁 File Sharing & Media

- **Image upload support** (JPG, PNG, GIF, WebP formats)
- **Cloudinary integration** for secure cloud file storage
- **Automatic thumbnail generation** for image previews
- **File size limits** (10MB maximum with validation)
- **Download functionality** for shared files
- **File type validation** (images only for security)

### 🎨 Modern UI/UX

- **Responsive design** (mobile-first approach)
- **Glass morphism effects** with backdrop blur
- **Gradient backgrounds** (blue to indigo theme)
- **Smooth animations** and micro-interactions
- **Mobile-friendly sidebar** with touch controls
- **Custom scrollbars** and enhanced focus states
- **Toast notifications** with different types and animations
- **Framer Motion** for advanced animations

### 📱 Mobile Experience

- **Collapsible sidebar** with overlay backdrop
- **Touch-friendly controls** and gesture support
- **Responsive typography** and adaptive spacing
- **Mobile-optimized layouts** and navigation
- **Progressive Web App** features

---

## 🛠️ Tech Stack

### Frontend

- **React 19.1.0** (Latest version with Vite build tool)
- **Tailwind CSS 4.1.10** (Modern utility-first CSS framework)
- **React Router DOM 7.6.2** (Client-side routing)
- **Socket.IO Client 4.8.1** (Real-time communication)
- **Axios 1.10.0** (HTTP client)
- **React Icons 5.5.0** (Icon library)
- **React Toastify 11.0.5** (Toast notifications)
- **Framer Motion 12.19.1** (Advanced animations)

### Backend

- **Node.js + Express 5.1.0** (Server framework)
- **MongoDB + Mongoose 8.15.2** (Database & ODM)
- **Socket.IO 4.8.1** (Real-time bidirectional communication)
- **JWT (jsonwebtoken 9.0.2)** (Authentication)
- **bcryptjs 3.0.2** (Password hashing)
- **Multer 2.0.1** (File upload handling)
- **Cloudinary 1.41.3** (Cloud file storage)
- **Sharp 0.34.2** (Image processing)
- **CORS 2.8.5** (Cross-origin resource sharing)

### Deployment & Infrastructure

- **Frontend:** Vercel (with automatic deployments)
- **Backend:** Render (with auto-scaling)
- **Database:** MongoDB Atlas (cloud database)
- **File Storage:** Cloudinary (image hosting)
- **Version Control:** Git with GitHub

---

## 📦 Setup & Installation

### Prerequisites

- **Node.js** (v16+ recommended)
- **MongoDB database** (local or MongoDB Atlas)
- **Cloudinary account** (for file storage)
- **Git** (for version control)

### Backend Setup

```bash
# Clone the repository
git clone <repository-url>
cd chat-app/backend

# Install dependencies
npm install

# Create environment file
cp env.example .env
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
# Development mode
npm run dev

# Production mode
npm start
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🔧 Configuration

### Environment Variables

**Backend (.env):**

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `PORT`: Server port (default: 5000)

**Frontend (.env):**

- `VITE_API_URL`: Backend API URL
- `VITE_SOCKET_URL`: Socket.IO server URL

### Security Settings

- **File uploads** are limited to 10MB and validated for type (images only)
- **JWT tokens** expire after 30 days
- **Password hashing** uses bcryptjs with 10 salt rounds
- **CORS** is configured for specific origins

---

## 📱 Usage Guide

### 1. Registration & Authentication

- **Create an account** with username, email, and password
- **Login securely** with JWT token authentication
- **Admin accounts** have special privileges for group management

### 2. Group Management

- **Browse available groups** in the sidebar
- **Create new groups** (admin-only feature)
- **Join public groups** instantly
- **Request to join secure groups** (requires admin approval)
- **Leave groups** at any time

### 3. Real-time Chat

- **Send messages** with instant delivery
- **Share images** using the paperclip icon
- **See typing indicators** when others are typing
- **View online status** of group members
- **Receive notifications** for user activities

### 4. Admin Features

- **Approve/reject join requests** for secure groups
- **Manage group members** and permissions
- **View pending requests** dashboard
- **Monitor group activity** and audit trail

### 5. Mobile Experience

- **Responsive sidebar** that collapses on mobile
- **Touch-friendly controls** and smooth animations
- **Optimized layouts** for all screen sizes
- **Gesture support** for navigation

---

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Connect your GitHub repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

```bash
# Build command
npm run build

# Output directory
dist
```

### Backend Deployment (Render)

1. **Connect your GitHub repository** to Render
2. **Set environment variables** in Render dashboard
3. **Configure build settings**:
   - Build Command: `npm install`
   - Start Command: `npm start`

### Database Setup (MongoDB Atlas)

1. **Create a MongoDB Atlas cluster**
2. **Get connection string** and add to environment variables
3. **Configure network access** for your deployment IPs

### File Storage (Cloudinary)

1. **Create a Cloudinary account**
2. **Get API credentials** and add to environment variables
3. **Configure upload presets** for optimal image handling

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint              | Description                  |
| ------ | --------------------- | ---------------------------- |
| `POST` | `/api/users/register` | Register a new user          |
| `POST` | `/api/users/login`    | Login user and get JWT token |

### Group Management Endpoints

| Method | Endpoint                               | Description                       |
| ------ | -------------------------------------- | --------------------------------- |
| `GET`  | `/api/groups`                          | Get all groups                    |
| `POST` | `/api/groups`                          | Create new group (admin only)     |
| `POST` | `/api/groups/:groupId/join`            | Join a group                      |
| `POST` | `/api/groups/:groupId/leave`           | Leave a group                     |
| `GET`  | `/api/groups/:groupId/pending`         | Get pending requests (admin only) |
| `POST` | `/api/groups/:groupId/approve/:userId` | Approve join request (admin only) |
| `POST` | `/api/groups/:groupId/reject/:userId`  | Reject join request (admin only)  |

### Messaging Endpoints

| Method | Endpoint                 | Description                  |
| ------ | ------------------------ | ---------------------------- |
| `GET`  | `/api/messages/:groupId` | Get messages for a group     |
| `POST` | `/api/messages`          | Send text message            |
| `POST` | `/api/messages/file`     | Upload and send file message |

### Socket.IO Events

#### Client to Server

- `join room` - Join a chat room
- `leave room` - Leave a chat room
- `new message` - Send a new message
- `typing` / `stop typing` - Typing indicators
- `join group request` - Request to join secure group
- `group joined` / `group left` - Group membership changes

#### Server to Client

- `message received` - New message notification
- `Users in room` - Updated room participants
- `user typing` / `user stop typing` - Typing indicators
- `notification` - User join/leave/disconnect events
- `group updated` - Group membership changes
- `join request status` - Request approval/rejection

---

## 🏗️ Project Structure

```
chat-app/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── ChatArea.jsx    # Main chat interface
│   │   │   ├── Sidebar.jsx     # Group management sidebar
│   │   │   ├── UsersList.jsx   # Online users display
│   │   │   └── PrivateRoute.jsx # Route protection
│   │   ├── pages/           # Page components
│   │   │   ├── Chat.jsx         # Main chat page
│   │   │   ├── Login.jsx        # Authentication
│   │   │   ├── Register.jsx     # User registration
│   │   │   └── LandingPage.jsx  # Marketing page
│   │   ├── config/          # Configuration
│   │   │   └── api.js           # API endpoints
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── backend/                  # Node.js server
│   ├── models/              # Database models
│   │   ├── userModel.js         # User schema
│   │   ├── groupModel.js        # Group schema
│   │   └── messageModel.js      # Message schema
│   ├── routes/              # API routes
│   │   ├── userRoute.js         # Authentication routes
│   │   ├── groupRoute.js        # Group management
│   │   └── messageRouter.js     # Messaging API
│   ├── middleware/          # Custom middleware
│   │   └── authMiddleware.js    # JWT authentication
│   ├── socket.js            # Socket.IO configuration
│   ├── server.js            # Express server setup
│   ├── package.json         # Backend dependencies
│   └── env.example          # Environment template
├── README.md                # Project documentation
└── vercel.json             # Vercel configuration
```

---

## 🔒 Security Features

### Authentication & Authorization

- **JWT tokens** with configurable expiration
- **Password hashing** with bcryptjs
- **Protected routes** with middleware
- **Admin role verification** for privileged actions

### File Security

- **File type validation** (images only: JPG, PNG, GIF, WebP)
- **Size limits** (10MB maximum)
- **Cloudinary secure storage** with CDN
- **Access control** for file downloads

### Data Protection

- **Input validation** and sanitization
- **Error handling** without exposing internals
- **CORS configuration** for cross-origin requests
- **Environment variable** protection

---

## 📊 Performance & Scalability

### Optimizations

- **Real-time updates** without page refreshes
- **Efficient database queries** with population
- **Image optimization** with automatic thumbnails
- **Lazy loading** and code splitting
- **Caching strategies** for static assets

### Monitoring

- **Connection status** tracking
- **Error logging** and user feedback
- **Performance metrics** and analytics
- **Uptime monitoring** for production

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and test thoroughly
4. **Commit your changes** (`git commit -m 'Add amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Add appropriate tests for new features
- Update documentation for API changes
- Ensure mobile responsiveness for UI changes

---

## 🆘 Support

### Getting Help

- **GitHub Issues**: Open an issue for bugs or feature requests
- **Documentation**: Check this README and code comments
- **Community**: Join our discussions for questions

### Common Issues

- **Connection problems**: Check your environment variables
- **File upload errors**: Verify Cloudinary configuration
- **Authentication issues**: Ensure JWT secret is properly set

---

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Socket.IO** for real-time capabilities
- **Tailwind CSS** for the utility-first approach
- **Vercel & Render** for hosting services
- **MongoDB Atlas** for database hosting
- **Cloudinary** for file storage solutions


