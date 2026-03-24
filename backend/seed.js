const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // using bcryptjs as it's often more compatible across OS
const User = require('./models/User');
const Category = require('./models/Category');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

// Load environment variables from backend/.env if available
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogmernstack';

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB. Starting seed process...');

        // Clear existing data to prevent duplicates
        await User.deleteMany({});
        await Category.deleteMany({});
        await Post.deleteMany({});
        await Comment.deleteMany({});
        console.log('Cleared existing data.');

        // 1. Create Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        
        const admin = await User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            status: true
        });
        console.log('Admin user created (admin@example.com / 123456)');

        // 2. Create Categories
        const categoriesData = [
            { name: 'Học Tập', description: 'Chia sẻ kinh nghiệm và tài liệu học tập', status: 'active' },
            { name: 'Thủ Thuật', description: 'Mẹo và thủ thuật công nghệ hữu ích', status: 'active' },
            { name: 'Kể Chuyện', description: 'Những câu chuyện đời sống thú vị', status: 'active' },
            { name: 'Tin Tức', description: 'Cập nhật tin tức công nghệ mới nhất', status: 'active' }
        ];
        const categories = await Category.insertMany(categoriesData);
        console.log(`Created ${categories.length} categories.`);

        // 3. Create Posts
        const postsData = [
            {
                title: 'Lộ Trình Học Lập Trình Web Trong 6 Tháng',
                content: '<p>Lập trình web đang là một trong những ngành hot. Bài viết này sẽ chia sẻ lộ trình từ zero đến hero.</p><p>Đầu tiên bạn cần học HTML, CSS, JavaScript. Sau đó tiến tới React.js, và Node.js.</p>',
                image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
                author: 'Admin',
                category: categories[0]._id, // Học Tập
                views: 120,
                status: true
            },
            {
                title: '5 Mẹo Tối Ưu Hóa VS Code Cực Đỉnh',
                content: '<p>VS Code là trình soạn thảo phổ biến nhất. Hãy cài các extension như Prettier, ESLint để tăng năng suất code. Sử dụng phím tắt cũng giúp bạn code nhanh hơn đáng kể.</p>',
                image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800',
                author: 'Admin',
                category: categories[1]._id, // Thủ Thuật
                views: 340,
                status: true
            },
            {
                title: 'Câu Chuyện Về Bug Đầu Tiên Của Tôi',
                content: '<p>Vào một ngày đẹp trời, tôi deploy code lên production và mọi thứ sập toàn diện. Đó là một bài học nhớ đời về việc tester quan trọng như thế nào.</p>',
                image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
                author: 'Admin',
                category: categories[2]._id, // Kể Chuyện
                views: 56,
                status: true
            },
            {
                title: 'Next.js 14 Ra Mắt Với Nhiều Cải Tiến',
                content: '<p>Vercel vừa ra mắt Next.js 14 với Server Actions thay thế hoàn toàn cho API routes trong nhiều trường hợp. Tốc độ build cũng được cải thiện nhờ TurboPack.</p>',
                image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=800',
                author: 'Admin',
                category: categories[3]._id, // Tin Tức
                views: 890,
                status: true
            },
            {
                title: 'Làm Sao Để Bắt Đầu Với MERN Stack?',
                content: '<p>MERN Stack bao gồm MongoDB, Express, React và Node.js. Đây là một bộ công cụ vô cùng mạnh mẽ để xây dựng các ứng dụng web chuyên nghiệp.</p>',
                image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
                author: 'Admin',
                category: categories[0]._id, // Học Tập
                views: 210,
                status: true
            }
        ];
        
        const posts = await Post.insertMany(postsData);
        console.log(`Created ${posts.length} posts.`);

        // Add posts to admin user's post list
        admin.posts = posts.map(p => p._id);
        await admin.save();

        // 4. Create Comments
        const commentsData = [
            {
                postId: posts[0]._id, // MERN Stack
                authorName: 'Nguyễn Minh',
                content: 'Bài viết rất hữu ích cho người mới bắt đầu như mình. Cảm ơn tác giả!',
                status: true
            },
            {
                postId: posts[0]._id,
                authorName: 'Lan Anh',
                content: 'Cho mình hỏi tài liệu tham khảo bạn lấy từ đâu vậy?',
                status: true
            },
            {
                postId: posts[1]._id, // VS Code
                authorName: 'Trung Kiên',
                content: 'Mình vừa cài thử extension bạn giới thiệu, thấy khá ngon!',
                status: true
            }
        ];

        const comments = await Comment.insertMany(commentsData);
        console.log(`Created ${comments.length} comments.`);

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Disconnect from database
        mongoose.connection.close();
    }
};

seedDatabase();
