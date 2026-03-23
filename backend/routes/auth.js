const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  login,
  refreshToken,
  logout,
  logoutAll,
} = require("../controllers/authController");

// NOTE: /api/auth/register has been removed intentionally.
// Admin accounts must be created directly via database (seed/CLI).

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: yourpassword
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Làm mới access token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Thành công, trả về access token mới
 *       401:
 *         description: Refresh token không hợp lệ
 */
router.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Đăng xuất khỏi tất cả thiết bị
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công từ tất cả thiết bị
 *       401:
 *         description: Không có quyền truy cập
 */
router.post("/logout-all", auth, logoutAll);

module.exports = router;
