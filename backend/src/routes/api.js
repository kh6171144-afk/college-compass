const express = require('express');
const router = express.Router();

const collegeController = require('../controllers/collegeController');
const cutoffController = require('../controllers/cutoffController');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const ratingController = require('../controllers/ratingController');
const chatController = require('../controllers/chatController');

// --- AUTH ROUTES ---
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/google', authController.googleLogin);
router.get('/auth/me', authController.getMe);
router.post('/auth/send-otp', authController.sendOtp);
router.post('/auth/verify-otp', authController.verifyOtp);
router.post('/auth/reset-password', authController.forgotPasswordReset);
router.post('/auth/onboarding', authController.requireAuth, authController.onboardingUpdate);

// --- COLLEGE ROUTES ---
router.get('/colleges', collegeController.getAllColleges);
router.get('/colleges/filters', collegeController.getFilterOptions);
router.get('/colleges/:id', collegeController.getCollegeById);

// --- RATING ROUTES ---
router.post('/colleges/:id/ratings', authController.requireAuth, ratingController.submitRating);

// --- PREDICTOR ROUTES ---
router.get('/predictor/college', cutoffController.predictColleges);
router.get('/predictor/course', cutoffController.predictCourses);

// --- CHAT ROUTES ---
router.post('/chat', chatController.chat);

// --- ADMIN ROUTES ---
router.post('/admin/colleges', authController.requireAuth, authController.requireAdmin, adminController.createCollege);
router.put('/admin/colleges/:id', authController.requireAuth, authController.requireAdmin, adminController.updateCollege);
router.delete('/admin/colleges/:id', authController.requireAuth, authController.requireAdmin, adminController.deleteCollege);

router.post('/admin/courses', authController.requireAuth, authController.requireAdmin, adminController.createCourse);
router.delete('/admin/courses/:id', authController.requireAuth, authController.requireAdmin, adminController.deleteCourse);

router.post('/admin/cutoffs', authController.requireAuth, authController.requireAdmin, adminController.createCutoff);
router.delete('/admin/cutoffs/:id', authController.requireAuth, authController.requireAdmin, adminController.deleteCutoff);

module.exports = router;
