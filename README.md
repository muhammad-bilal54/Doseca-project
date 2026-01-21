# Social Media Content Scheduler

A full-stack MERN application for scheduling social media posts across multiple platforms. Built as a technical assessment project demonstrating clean code, proper architecture, and best practices.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Post Management**: Create, read, update, and delete social media posts
- **Multi-Platform Support**: Schedule posts for Twitter, Facebook, and Instagram
- **Automatic Publishing**: Background job that publishes posts at scheduled times
- **Dashboard**: Statistics and upcoming posts overview
- **Pagination & Filtering**: Browse posts with status filtering
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for password hashing
- node-cron for background scheduling
- express-validator for input validation
- express-rate-limit for security

### Frontend
- React 18 (Vite)
- React Router v6
- Axios with interceptors
- React Toastify for notifications
- Custom CSS (no frameworks)

## Project Structure

```
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers
│   ├── cron/           # Background scheduler
│   ├── middleware/     # Auth, validation, error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── utils/          # Helper functions
│   ├── app.js          # Express app configuration
│   └── server.js       # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/        # API client functions
│   │   ├── components/ # Reusable components
│   │   ├── context/    # React context (Auth)
│   │   ├── pages/      # Page components
│   │   ├── App.jsx     # Main app with routing
│   │   └── main.jsx    # Entry point
│   └── index.html
│
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- Git (optional)

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend folder:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/social_media_scheduler

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRES_IN=7d

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the backend server:
   ```bash
   # Development with auto-reload
   npm run dev

   # Production
   npm start
   ```

   The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend folder:
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

   The app will be available at `http://localhost:5173`

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment (development/production) | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/social_media_scheduler |
| JWT_SECRET | Secret key for JWT signing | (required) |
| JWT_EXPIRES_IN | JWT expiration time | 7d |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login user | No |
| POST | /api/auth/logout | Logout user | Yes |
| GET | /api/auth/me | Get current user | Yes |

### Posts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/posts | Create new post | Yes |
| GET | /api/posts | Get all posts (paginated) | Yes |
| GET | /api/posts/:id | Get single post | Yes |
| PUT | /api/posts/:id | Update post | Yes |
| DELETE | /api/posts/:id | Delete post | Yes |

**Query Parameters for GET /api/posts:**
- `page` - Page number (default: 1)
- `limit` - Posts per page (default: 10, max: 50)
- `status` - Filter by status (draft, scheduled, published, failed)

### Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/dashboard/stats | Get statistics | Yes |
| GET | /api/dashboard/upcoming | Get next 5 scheduled posts | Yes |

## Demo Credentials

After setting up the project, register a new account:

- **Email**: demo@example.com
- **Password**: demo123

## Architecture Decisions

### 1. Clean Separation of Concerns
The backend follows MVC-like architecture with clear separation:
- **Models**: Data schema definitions with validation
- **Controllers**: Business logic and request handling
- **Routes**: URL mappings and middleware chains
- **Middleware**: Reusable request processing (auth, validation, error handling)

### 2. JWT-Based Authentication
Stateless authentication using JWT tokens:
- Tokens stored in localStorage on the client
- Authorization header with Bearer scheme
- Automatic token refresh handling via Axios interceptors

### 3. Background Scheduling
Using node-cron (not external services) for scheduling:
- Runs every minute to check for due posts
- Processes posts in order of creation (FIFO)
- Creates publication logs to prevent duplicate publishing
- Handles failures gracefully without stopping other posts

### 4. Input Validation
Multi-layer validation approach:
- Express-validator for request validation
- Mongoose schema validation for data integrity
- Client-side validation for better UX

### 5. Security Measures
- Password hashing with bcrypt (10 salt rounds)
- Rate limiting on authentication endpoints
- JWT token verification
- Input sanitization
- CORS configuration
- Owner-only access for posts

### 6. Error Handling
Centralized error handling middleware that:
- Formats errors consistently
- Handles Mongoose validation errors
- Handles duplicate key errors
- Provides stack traces in development only

## Database Indexes

Indexes are added for performance optimization:

**User Model:**
- `email` (unique)

**Post Model:**
- `user` (for filtering by owner)
- `scheduledAt` (for sorting and scheduler queries)
- `status` (for filtering)
- Compound: `user + status`, `status + scheduledAt`

**PublicationLog Model:**
- `post` (unique - prevents duplicate publishing)

## How the Scheduler Works

1. **Cron Job**: Runs every minute using node-cron
2. **Query**: Finds posts where `status = 'scheduled'` AND `scheduledAt <= now`
3. **Sort**: Orders by `createdAt` ascending (publish older posts first)
4. **Process**: For each post:
   - Check if already published (via PublicationLog)
   - Update status to 'published'
   - Create publication log entry
   - Handle any errors (mark as 'failed')

**Note**: This is a simulation. In a real application, step 4 would include API calls to actual social media platforms.

## API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Response data here
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## Future Improvements

If more time was available:

1. **Unit & Integration Tests**: Jest tests for API endpoints and components
2. **Real Social Media Integration**: OAuth flows and platform APIs
3. **Media Upload**: Image/video upload to cloud storage
4. **Analytics**: Post performance tracking
5. **Team Features**: Multiple users per organization
6. **Recurring Posts**: Schedule posts on a recurring basis
7. **Draft Preview**: Preview how posts will look on each platform
8. **Bulk Actions**: Select and manage multiple posts at once

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or check Atlas connection string
- Verify network access if using MongoDB Atlas

### Port Already in Use
- Change PORT in .env file
- Or kill the process using the port

### CORS Errors
- Verify FRONTEND_URL in backend .env matches your frontend URL
- Check that credentials are enabled in CORS configuration

## License

MIT License - Feel free to use this project for learning and development.
