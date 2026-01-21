

const { protect } = require('./auth');
const errorHandler = require('./errorHandler');
const { authLimiter, apiLimiter } = require('./rateLimiter');
const {
  registerValidator,
  loginValidator,
  createPostValidator,
  updatePostValidator,
  postIdValidator,
  getPostsValidator,
} = require('./validators');

module.exports = {
  protect,
  errorHandler,
  authLimiter,
  apiLimiter,
  registerValidator,
  loginValidator,
  createPostValidator,
  updatePostValidator,
  postIdValidator,
  getPostsValidator,
};
