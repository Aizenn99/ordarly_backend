const express = require('express');
const router = express.Router();

const { getDashboardStats } = require('../../controllers/Dashboard/report');

router.get("/metrics", getDashboardStats);


module.exports = router;