# 📝 BlogMernStack

A full-stack blog application built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js). Features a modern UI with Vite + TypeScript frontend and a robust Express.js backend with JWT authentication.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![MongoDB](https://img.shields.io/badge/mongodb-7.0-green.svg)

## ✨ Features

- **User Authentication** - JWT-based login/register with access & refresh tokens
- **Blog CRUD** - Create, read, update, and delete blog posts
- **Rich Text Editor** - TinyMCE integration for content creation
- **Image Upload** - Cloudinary integration for media storage
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS
- **API Documentation** - Swagger UI for API exploration
- **Docker Support** - One-command deployment with Docker Compose

## 🛠️ Tech Stack

### Backend
- **Express.js 5** - Web framework
- **MongoDB + Mongoose** - Database & ODM
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **Swagger** - API documentation
- **Node-cron** - Scheduled tasks

### Frontend
- **React + TypeScript** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Axios** - HTTP client
- **TinyMCE** - Rich text editor

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/thanhtrongvo/BlogMernStack.git
cd BlogMernStack

# Create environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your Cloudinary credentials

# Start all services
docker-compose up -d
```

Access the app:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5300
- API Docs: http://localhost:5300/api-docs

### Option 2: Manual Setup

#### Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configurations

# Start development server
npm run dev
```

#### Frontend

```bash
cd frontend
npm install

# Start development server
npm run dev
```

### Environment Variables

Create `backend/.env` based on `.env.example`:

```env
PORT=5300
MONGO_URI=mongodb://localhost:27017/blog
JWT_SECRET=your_jwt_secret
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📁 Project Structure

```
BlogMernStack/
├── backend/
│   ├── config/         # Database & service configs
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth & validation middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── index.js        # Entry point
├── frontend/
│   ├── src/
│   └── ...
├── docker-compose.yml
└── README.md
```

## 📜 Available Scripts

### Backend
| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot reload |

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Thanh Trong Vo**
- GitHub: [@thanhtrongvo](https://github.com/thanhtrongvo)

---

⭐ Star this repo if you find it helpful!
