const express = require('express');
const router = express.Router();
const bfhlController = require('../controllers/bfhlController');

// POST /bfhl
router.post('/', bfhlController.processData);

module.exports = router;
