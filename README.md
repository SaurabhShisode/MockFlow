# MockFlow - Instant API Mocking Service

MockFlow is a full-stack application that allows developers to quickly create and manage mock API endpoints for frontend development and testing. No backend setup required - just create your mocks and start testing!

## Features

- 🚀 **Instant Mock Creation** - Create mock endpoints in seconds
- 💾 **Persistent Storage** - Mocks are saved to MongoDB and survive server restarts
- 📊 **Usage Statistics** - Track how many times each mock has been accessed
- 🎨 **Modern UI** - Beautiful, responsive interface with dark theme
- 🔄 **Real-time Updates** - See your mocks update instantly
- 📋 **Easy Integration** - Copy URLs or CURL commands with one click
- 🗑️ **Mock Management** - View, delete, and manage all your mocks

## Tech Stack

### Frontend
- React 19 with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- React Toastify for notifications

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- CORS enabled for cross-origin requests

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier works great)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd MockFlow
```

### 2. Set Up MongoDB
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Create a database named `mockflow`

### 3. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=your-app
PORT=5000
```

Start the backend:
```bash
npm start
```

### 4. Frontend Setup
```bash
cd client
npm install
```

Start the frontend:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Deployment on Render

### 1. Backend Deployment
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set the following:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `MONGO_URI`: Your MongoDB connection string
     - `PORT`: `5000` (or leave empty for Render to set)

### 2. Frontend Deployment
1. Create a new Static Site service on Render
2. Set the following:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**: None required

### 3. Update Frontend API URL
Update the API URL in `client/src/components/MockForm.tsx` and `client/src/components/MockList.tsx` to point to your deployed backend URL.

## API Endpoints

### Create Mock
```http
POST /start-mock
Content-Type: application/json

{
  "path": "/api/users",
  "method": "GET",
  "status": 200,
  "response": { "users": [] },
  "delay": 1000
}
```

### Get All Mocks
```http
GET /mocks
```

### Delete Mock
```http
DELETE /mocks/:id
```

### Health Check
```http
GET /
```

## Database Schema

The MongoDB collection stores mock endpoints with the following structure:

```javascript
{
  _id: ObjectId,
  path: String,           // Endpoint path (e.g., "/api/users")
  method: String,         // HTTP method (GET, POST, PUT, DELETE, PATCH)
  status: Number,         // HTTP status code
  response: Mixed,        // JSON response body
  delay: Number,          // Response delay in milliseconds
  createdAt: Date,        // Creation timestamp
  lastAccessed: Date,     // Last access timestamp
  accessCount: Number     // Number of times accessed
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/mockflow` |
| `PORT` | Server port | `5000` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Built with ❤️ for developers who want to focus on frontend development without backend setup headaches.** 