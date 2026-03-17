const express = require('express');
const { body } = require('express-validator');

const { createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('cafeId').isMongoId().withMessage('Valid cafeId is required.'),
    body('wifiSpeed').isFloat({ min: 0, max: 10 }).withMessage('wifiSpeed must be 0-10.'),
    body('noiseLevel').isFloat({ min: 0, max: 10 }).withMessage('noiseLevel must be 0-10.'),
    body('seatingComfort').isFloat({ min: 0, max: 10 }).withMessage('seatingComfort must be 0-10.'),
    body('comment').optional().isString().isLength({ max: 1000 })
  ],
  validateRequest,
  createReview
);

module.exports = router;
