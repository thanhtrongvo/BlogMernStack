require('dotenv').config();
const express   = require('express');
const connectDB = require('./config/db');
const cors      = require('cors');
const morgan    = require('morgan');
const auth      = require('./middleware/auth');
const swaggerSpec = require('./docs/swagger');
const swaggerUi = require('swagger-ui-express');
const authRoutes = require('./routes/auth');

const dashboardRoutes = require('./routes/dashboard');


const app = express();
const PORT = process.env.PORT || 5300;

// 1) Kết nối database
connectDB();

// 2) Middleware chung
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// 3) Public routes (register/login)
app.use('/api/auth', authRoutes);


// 4) Protected routes - áp dụng middleware auth chỉ cho routes bảo vệ
app.use('/api/posts',require('./routes/post'));
app.use('/api/comments', auth, require('./routes/comment'));
app.use('/api/dashboard', auth, dashboardRoutes);
app.use('/api/users', auth, require('./routes/user'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/upload', require('./routes/upload'));


app.listen(PORT, () => console.log(`Server chạy port ${PORT}`));
