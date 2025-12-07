# Auth Template - Node.js Backend

A production-ready authentication template built with **Express.js**, **TypeScript**, **MongoDB**, and **Cloudinary**. This template provides all the essential authentication features developers need to kickstart their projects without building auth from scratch.

## ✨ Features

- **User Registration** - with email validation and password hashing
- **User Login** - secure authentication with JWT tokens
- **JWT Authentication** - access and refresh token system
- **Password Management** - change password with validation
- **User Profile Management** - update user details, avatar, and cover image
- **Image Upload** - Cloudinary integration for avatar and cover images
- **Protected Routes** - middleware-based JWT verification
- **Error Handling** - centralized error handling with custom ApiError class
- **Type Safety** - fully typed with TypeScript
- **Cookie Management** - HTTP-only secure cookies for tokens

## 📁 Project Structure

```
auth/
├── src/
│   ├── index.ts                        # Application entry point
│   ├── server.ts                       # Express server configuration
│   ├── controllers/
│   │   └── Auth.controller.ts          # Authentication business logic
│   ├── routes/
│   │   └── user.routes.ts              # API endpoints definition
│   ├── models/
│   │   └── user.model.ts               # MongoDB User schema
│   ├── middlewares/
│   │   ├── Auth.middleware.ts          # JWT verification middleware
│   │   └── multer.middleware.ts        # File upload configuration
│   ├── database/
│   │   └── index.ts                    # MongoDB connection setup
│   └── utils/
│       ├── ApiError.ts                 # Custom error class
│       ├── ApiResponse.ts              # Standard response format
│       ├── asyncHandler.ts             # Async route handler wrapper
│       └── cloudinary.ts               # Cloudinary upload utility
├── uploads/
│   └── temp/                           # Temporary file storage
├── .env                                # Environment variables
├── .gitignore                          # Git ignore configuration
├── package.json                        # Project dependencies
├── tsconfig.json                       # TypeScript configuration
└── README.md                           # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16+ 
- **npm** or **yarn**
- **MongoDB** (local or Atlas)
- **Cloudinary** account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone (https://github.com/Harshitnakrani/auth-template.git)
   cd auth-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see section below)

5. **Start the server**
   ```bash
    npx tsx src/index.ts
   ```

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Port
PORT=5000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net

# JWT Secrets (use strong random strings)
ACCESS_TOKEN=your_super_secret_access_token_key
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key

# JWT Expiry Times
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary Configuration
CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### How to Get Cloudinary Credentials

1. Sign up at [Cloudinary](https://cloudinary.com/) (free tier available)
2. Navigate to your **Dashboard**
3. Copy your **Cloud Name**, **API Key**, and **API Secret**
4. Add them to your `.env` file

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/users
```

### Standard Response Format

All responses follow this structure:

```json
{
  "statusCode": 200,
  "data": { /* response data */ },
  "message": "Success message",
  "success": true
}
```

---

## 🔓 Public Endpoints

### 1. Register User
```http
POST /register
Content-Type: multipart/form-data
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | ✅ | Letters and numbers only, must be unique |
| email | string | ✅ | Valid email format, must be unique |
| fullname | string | ✅ | User's full name |
| password | string | ✅ | Minimum 8 characters |
| avatar | file | ❌ | Image file (jpg, png, etc.) |
| coverImage | file | ❌ | Image file (jpg, png, etc.) |

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -F "username=johndoe" \
  -F "email=john@example.com" \
  -F "fullname=John Doe" \
  -F "password=password123" \
  -F "avatar=@path/to/avatar.jpg" \
  -F "coverImage=@path/to/cover.jpg"
```

**Success Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "johndoe",
    "email": "john@example.com",
    "fullname": "John Doe",
    "avatar": "https://res.cloudinary.com/...",
    "coverImage": "https://res.cloudinary.com/...",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "User registered successfully",
  "success": true
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Username must contain only letters and numbers",
  "success": false
}
```

---

### 2. Login User
```http
POST /login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "loggedInUser": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "username": "johndoe",
      "email": "john@example.com",
      "fullname": "John Doe",
      "avatar": "https://res.cloudinary.com/...",
      "coverImage": "https://res.cloudinary.com/..."
    }
  },
  "message": "user loggedin successfully",
  "success": true
}
```

**Cookies Set:**
- `accessToken` - JWT token (expires in 7 days)
- `refreshToken` - Refresh token (expires in 7 days)

**Error Response (404):**
```json
{
  "statusCode": 404,
  "data": null,
  "message": "User not found",
  "success": false
}
```

---

### 3. Refresh Access Token
```http
POST /refresh-token
Content-Type: application/json
```

**Request Body (choose one):**
```json
{
  "refreshToken": "your_refresh_token_here"
}
```
OR send via cookies automatically.

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_refresh_token"
  },
  "message": "Access token refreshed",
  "success": true
}
```

---

## 🔐 Protected Endpoints

All protected endpoints require JWT authentication via the Authorization header:

```http
Authorization: Bearer <access_token>
```

### 4. Get User Details
```http
GET /get-user-details
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "johndoe",
    "email": "john@example.com",
    "fullname": "John Doe",
    "avatar": "https://res.cloudinary.com/...",
    "coverImage": "https://res.cloudinary.com/...",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "user details found",
  "success": true
}
```

---

### 5. Update User Details
```http
POST /update-user-details
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullname": "Jane Doe",
  "email": "jane@example.com"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "johndoe",
    "email": "jane@example.com",
    "fullname": "Jane Doe",
    "avatar": "https://res.cloudinary.com/...",
    "coverImage": "https://res.cloudinary.com/..."
  },
  "message": "userdetail updated",
  "success": true
}
```

---

### 6. Update User Avatar
```http
POST /update-avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| avatar | file | ✅ |

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/users/update-avatar \
  -H "Authorization: Bearer <token>" \
  -F "avatar=@path/to/new-avatar.jpg"
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "johndoe",
    "email": "john@example.com",
    "fullname": "John Doe",
    "avatar": "https://res.cloudinary.com/.../new-avatar.jpg",
    "coverImage": "https://res.cloudinary.com/..."
  },
  "message": "User avatar updated",
  "success": true
}
```

---

### 7. Update Cover Image
```http
POST /update-coverimage
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| coverImage | file | ✅ |

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "johndoe",
    "email": "john@example.com",
    "fullname": "John Doe",
    "avatar": "https://res.cloudinary.com/...",
    "coverImage": "https://res.cloudinary.com/.../new-cover.jpg"
  },
  "message": "CoverImage updated successfuly",
  "success": true
}
```

---

### 8. Change Password
```http
POST /change-password
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "oldPassword": "currentPassword123",
  "newPassword": "newPassword123"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Password canged successfully",
  "success": true
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "data": null,
  "message": "password incorrect",
  "success": false
}
```

---

### 9. Logout User
```http
GET /logout
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "User Logged out",
  "success": true
}
```

**Side Effects:**
- Clears `accessToken` cookie
- Clears `refreshToken` cookie
- Removes refresh token from database

---

## 🔐 Security Implementation

### Password Security
- **Bcryptjs hashing** with 10 salt rounds
- Passwords hashed before saving to database
- Password comparison using bcrypt (constant-time comparison)

### Token Security
- **JWT tokens** with expiration times
- **HTTP-only cookies** prevent JavaScript access
- **Secure flag** ensures cookies sent only over HTTPS (production)
- **SameSite strict** prevents CSRF attacks
- **Access tokens** expire in 15 minutes
- **Refresh tokens** expire in 7 days

### Validation
- Email format validation using regex
- Username alphanumeric-only validation
- Password minimum 8 characters
- All required fields validated

---

## 🏗️ Core Architecture

### Error Handling - [`ApiError`](src/utils/ApiError.ts)

Custom error class extending JavaScript Error with status codes:

```typescript
throw new ApiError(400, "Invalid input", ["username required"])
```

**Properties:**
- `statusCode` - HTTP status code
- `message` - Error message
- `errors` - Array of additional error details
- `success` - Always false

---

### Response Format - [`ApiResponse`](src/utils/ApiResponse.ts)

Standard response wrapper for all endpoints:

```typescript
new ApiResponse(200, userData, "User found successfully")
```

**Properties:**
- `statusCode` - HTTP status code
- `data` - Response payload
- `message` - Success/info message
- `success` - Calculated from statusCode (< 400 = true)

---

### Async Handler - [`asyncHandler`](src/utils/asyncHandler.ts)

Wrapper function that catches async errors automatically:

```typescript
export const loginUser = asyncHandler(async (req, res) => {
  // Any thrown error is caught automatically
})
```

**Benefits:**
- Eliminates try-catch boilerplate
- Catches all async errors
- Returns proper error response

---

### Cloudinary Utility - [`uploadOnCloudinary`](src/utils/cloudinary.ts)

Handles file uploads to Cloudinary:

```typescript
const response = await uploadOnCloudinary(localFilePath)
// Returns: { url, secure_url, public_id, ... }
```

**Features:**
- Auto-detects file type
- Deletes local temp file after upload
- Error handling with cleanup
- Throws ApiError on failure

---

### JWT Middleware - [`verifyJWT`](src/middlewares/Auth.middleware.ts)

Middleware to verify JWT tokens on protected routes:

```typescript
// Used in routes
userRouter.route("/logout").get(verifyJWT, logoutUser)
```

**Process:**
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token using `REFRESH_TOKEN_SECRET`
3. Attaches decoded user data to `req.user`
4. Calls next() or returns 401 error

---

### Multer Configuration - [`upload`](src/middlewares/multer.middleware.ts)

File upload middleware for handling multipart form data:

```typescript
upload.single("avatar")  // Single file
upload.fields([...])     // Multiple file fields
```

**Configuration:**
- Destination: `./uploads/temp`
- Filename: Original file name
- Used with Cloudinary (temp files deleted after upload)

---

### User Model - [`User`](src/models/user.model.ts)

MongoDB schema with methods:

**Schema Fields:**
```typescript
{
  username: String (unique, lowercase),
  email: String (unique, lowercase),
  fullname: String,
  avatar: String (URL),
  coverImage: String (URL),
  password: String (hashed),
  refreshToken: String,
  timestamps: true
}
```

**Methods:**
- `isPasswordCorrect(password)` - Compare hashed passwords
- `generateAccessToken()` - Create JWT access token
- `generateRefreshToken()` - Create JWT refresh token

**Hooks:**
- Pre-save: Auto-hash passwords using bcrypt

---

## 🛠️ How to Extend This Template

### Adding a New Protected Endpoint

**Step 1: Add controller method** in [`Auth.controller.ts`](src/controllers/Auth.controller.ts):

```typescript
export const myNewFeature = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id
    
    // Your business logic here
    
    return res.status(200).json(new ApiResponse(200, data, "Success message"))
})
```

**Step 2: Add route** in [`user.routes.ts`](src/routes/user.routes.ts):

```typescript
userRouter.route("/my-feature").post(verifyJWT, myNewFeature)
```

**Step 3: Test the endpoint:**
```bash
curl -X POST http://localhost:5000/api/users/my-feature \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

---

### Adding File Upload to an Endpoint

**Step 1: Add multer middleware to route:**
```typescript
userRouter.route("/upload-doc")
  .post(verifyJWT, upload.single("document"), uploadDocument)
```

**Step 2: Handle file in controller:**
```typescript
export const uploadDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filePath = req.file?.path
    if (!filePath) throw new ApiError(400, "File required")
    
    const uploaded = await uploadOnCloudinary(filePath)
    // Save URL to database
    
    return res.status(200).json(new ApiResponse(200, { url: uploaded.url }))
})
```

---

### Extending the User Model

**Step 1: Modify schema** in [`user.model.ts`](src/models/user.model.ts):

```typescript
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        // ...existing fields...
        bio: { type: String, default: "" },
        phone: { type: String },
        isVerified: { type: Boolean, default: false }
    },
    { timestamps: true }
)
```

**Step 2: Update interfaces:**
```typescript
export interface IUser extends Document {
    // ...existing fields...
    bio: string
    phone?: string
    isVerified: boolean
}
```

---

## 📦 Technologies Used

| Technology | Purpose |
|-----------|---------|
| **Express.js** | Web server framework |
| **TypeScript** | Type-safe JavaScript |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication tokens |
| **Bcryptjs** | Password hashing |
| **Cloudinary** | Image storage |
| **Multer** | File upload handling |
| **Cookie-parser** | Cookie management |
| **CORS** | Cross-origin requests |

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Change CORS origin from `["your domain"]` to actual frontend URL in [`server.ts`](src/server.ts)
- [ ] Generate strong random strings for `ACCESS_TOKEN` and `REFRESH_TOKEN_SECRET`
- [ ] Enable HTTPS (secure cookies require HTTPS in production)
- [ ] Use MongoDB Atlas instead of local database
- [ ] Set up proper environment variables on hosting platform
- [ ] Enable Cloudinary security settings
- [ ] Test all endpoints thoroughly
- [ ] Set up monitoring and error logging
- [ ] Configure database backups
- [ ] Review security headers and CORS settings

---

## ⚙️ Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

Then run:
```bash
npm run dev      # Development with hot reload
npm run build    # Build TypeScript
npm run start    # Production server
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Solution: Ensure MongoDB is running and MONGODB_URI is correct
```

### Cloudinary Upload Fails
```
Solution: Verify CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

### JWT Verification Fails
```
Solution: Ensure access token is valid and not expired. Use /refresh-token endpoint
```

### CORS Errors
```
Solution: Update CORS origin in src/server.ts to match frontend URL
```

---

## 📝 Notes

- The `uploads/temp` folder is used temporarily for Cloudinary uploads
- Local temp files are automatically deleted after successful upload
- All passwords are hashed before storage
- Refresh tokens are stored in database for validation
- Both access and refresh tokens expire and need renewal
- Images are stored on Cloudinary, not locally

---

## 🤝 Contributing

Feel free to fork, modify, and extend this template for your projects!

## 📄 License

ISC

---

**Perfect starter template for building your next app with authentication** ✨
