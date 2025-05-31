# Memorial Project

A web application that allows users to create and share memorial pages for their loved ones. Users can upload photos, videos, and information about the person, and share the memorial page via QR codes.

## Features

- Create memorial pages with personal information
- Upload photos and videos
- Generate QR codes for easy sharing
- Responsive design for all devices
- Secure authentication system
- Easy-to-use interface

## Tech Stack

- Frontend: React.js
- Backend: Node.js with Express
- Database: MongoDB
- File Storage: Local storage (can be extended to cloud storage)
- Authentication: JWT

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client
   npm install
   ```
3. Create a .env file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the development server:
   ```bash
   npm run dev:full
   ```

## Project Structure

```
memorial-project/
├── client/                 # React frontend
├── server.js              # Express server
├── models/                # Database models
├── routes/                # API routes
├── controllers/           # Route controllers
├── middleware/            # Custom middleware
└── uploads/              # File uploads directory
``` 