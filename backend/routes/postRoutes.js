
//  Post Routes
// Handles post CRUD endpoints
 

const express = require('express');
const router = express.Router();
const { postController } = require('../controllers');
const {
  protect,
  createPostValidator,
  updatePostValidator,
  postIdValidator,
  getPostsValidator,
} = require('../middleware');

// All routes are protected
router.use(protect);

router.route('/')
  .post(createPostValidator, postController.createPost)
  .get(getPostsValidator, postController.getPosts);

router.route('/:id')
  .get(postIdValidator, postController.getPost)
  .put(updatePostValidator, postController.updatePost)
  .delete(postIdValidator, postController.deletePost);

module.exports = router;
