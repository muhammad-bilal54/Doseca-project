
//  Input validation using express-validator
 

const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Auth validators
const registerValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

// Post validators
const createPostValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 500 })
    .withMessage('Content cannot exceed 500 characters'),
  body('platforms')
    .isArray({ min: 1 })
    .withMessage('At least one platform is required')
    .custom((platforms) => {
      const validPlatforms = ['twitter', 'facebook', 'instagram'];
      const isValid = platforms.every((p) => validPlatforms.includes(p));
      if (!isValid) {
        throw new Error(
          'Invalid platform(s). Choose from: twitter, facebook, instagram'
        );
      }
      return true;
    }),
  body('scheduledAt')
    .notEmpty()
    .withMessage('Scheduled time is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }
      return true;
    }),
  body('imageUrl')
    .optional({ nullable: true })
    .trim()
    .isURL()
    .withMessage('Invalid image URL'),
  body('status')
    .optional()
    .isIn(['draft', 'scheduled'])
    .withMessage('Status must be draft or scheduled when creating'),
  handleValidation,
];

const updatePostValidator = [
  param('id').isMongoId().withMessage('Invalid post ID'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Content cannot exceed 500 characters'),
  body('platforms')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one platform is required')
    .custom((platforms) => {
      const validPlatforms = ['twitter', 'facebook', 'instagram'];
      const isValid = platforms.every((p) => validPlatforms.includes(p));
      if (!isValid) {
        throw new Error(
          'Invalid platform(s). Choose from: twitter, facebook, instagram'
        );
      }
      return true;
    }),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }
      return true;
    }),
  body('imageUrl')
    .optional({ nullable: true })
    .trim()
    .isURL()
    .withMessage('Invalid image URL'),
  body('status')
    .optional()
    .isIn(['draft', 'scheduled', 'published', 'failed'])
    .withMessage('Invalid status'),
  handleValidation,
];

const postIdValidator = [
  param('id').isMongoId().withMessage('Invalid post ID'),
  handleValidation,
];

const getPostsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('status')
    .optional()
    .isIn(['draft', 'scheduled', 'published', 'failed'])
    .withMessage('Invalid status'),
  handleValidation,
];

module.exports = {
  registerValidator,
  loginValidator,
  createPostValidator,
  updatePostValidator,
  postIdValidator,
  getPostsValidator,
};
