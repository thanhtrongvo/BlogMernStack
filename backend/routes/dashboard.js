const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getDashboardStats,
    getWeeklyViewsData,
    getMonthlyViewsData,
    getTopPosts
} = require('../controllers/dashboardController');

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Lấy thống kê tổng quan cho dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/stats', auth, getDashboardStats);

/**
 * @swagger
 * /api/dashboard/views/weekly:
 *   get:
 *     summary: Lấy thống kê lượt xem theo tuần
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/views/weekly', auth, getWeeklyViewsData);

/**
 * @swagger
 * /api/dashboard/views/monthly:
 *   get:
 *     summary: Lấy thống kê lượt xem theo tháng
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/views/monthly', auth, getMonthlyViewsData);

/**
 * @swagger
 * /api/dashboard/posts/top:
 *   get:
 *     summary: Lấy danh sách bài viết được xem nhiều nhất
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Số lượng bài viết cần lấy
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/posts/top', auth, getTopPosts);

module.exports = router;
