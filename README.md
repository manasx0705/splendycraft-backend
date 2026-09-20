# SplendyCraft Backend API

Express REST API for SplendyCraft. Uses MongoDB for storage, Cloudinary for images, and Firebase Admin SDK for authenticating admin requests.

## Setup
1. Run `npm install`
2. Copy `.env.example` to `.env` and fill in the values:
   - `MONGODB_URI`: MongoDB connection string
   - `CLOUDINARY_*`: Cloudinary API keys
   - `FIREBASE_*`: Firebase service account credentials for Admin SDK
   - `CLIENT_ORIGIN` / `ADMIN_ORIGIN`: Allowed origins for CORS

## Running
- `npm run dev` for local development (uses nodemon)
- `npm start` for production

## API Routes
- `GET /api/products` - Public, get all products
- `POST /api/products` - Protected, create product
- `PUT /api/products/:id` - Protected, update product
- `DELETE /api/products/:id` - Protected, delete product
