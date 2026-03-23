# Environment Variables for Docker

## Backend (.env)
The backend `.env` file should contain:
```
MONGO_URI=mongodb://mongodb:27017/blog
JWT_SECRET=your-jwt-secret
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
PORT=5300
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Running the Application

### Start all services:
```bash
docker-compose up --build
```

### Start in detached mode:
```bash
docker-compose up -d --build
```

### View logs:
```bash
docker-compose logs -f
```

### Stop all services:
```bash
docker-compose down
```

### Stop and remove volumes (clean database):
```bash
docker-compose down -v
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5300
- **API Documentation**: http://localhost:5300/api-docs
- **MongoDB**: localhost:27017

## Notes

- MongoDB data persists in Docker volume `mongodb_data`
- Backend uploads stored in `./backend/uploads` directory
- Frontend built with production optimizations via Vite
- All services connected via `blog-network` Docker network
