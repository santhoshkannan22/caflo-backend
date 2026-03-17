const express = require('express');
const { query } = require('express-validator');

const { getRecommendations } = require('../controllers/recommendationController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get(
  '/',
  [
    query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required.'),
    query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required.'),
    query('radius').optional().isInt({ min: 100, max: 50000 }).withMessage('Radius must be 100-50000.'),
    query('preference')
      .optional()
      .isIn(['quiet', 'fast wifi', 'fast-wifi', 'fast_wifi', 'comfortable seating', 'comfortable-seating', 'comfortable_seating'])
      .withMessage('Unsupported preference value.')
  ],
  validateRequest,
  getRecommendations
);

module.exports = router;
