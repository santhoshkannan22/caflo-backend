const express = require('express');
const { query, param, body } = require('express-validator');

const {
  getNearbyCafes,
  getCafeById,
  saveCafe,
  getSavedCafes
} = require('../controllers/cafeController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get(
  '/nearby',
  [
    query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required.'),
    query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required.'),
    query('radius').optional().isInt({ min: 100, max: 50000 }).withMessage('Radius must be 100-50000.')
  ],
  validateRequest,
  getNearbyCafes
);

router.post('/save', protect, [body('cafeId').isMongoId().withMessage('Valid cafeId is required.')], validateRequest, saveCafe);
router.get('/saved', protect, getSavedCafes);
router.get('/:id', [param('id').isMongoId().withMessage('Valid cafe id is required.')], validateRequest, getCafeById);

module.exports = router;
