
//  Dashboard Routes
//  Handles dashboard and statistics endpoints
 

const express = require('express');
const router = express.Router();
const { dashboardController } = require('../controllers');
const { protect } = require('../middleware');

// All routes are protected
router.use(protect);

router.get('/stats', dashboardController.getStats);
router.get('/upcoming', dashboardController.getUpcoming);

module.exports = router;
