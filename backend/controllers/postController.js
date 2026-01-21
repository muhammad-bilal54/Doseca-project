
//  Handles CRUD operations for social media posts
 

const { Post } = require('../models');


const createPost = async (req, res, next) => {
  try {
    const { content, platforms, imageUrl, scheduledAt, status } = req.body;

    const post = await Post.create({
      user: req.user._id,
      content,
      platforms,
      imageUrl: imageUrl || null,
      scheduledAt: new Date(scheduledAt),
      status: status || 'scheduled',
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};


const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    // Build query
    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    // Get posts with pagination
    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


const getPost = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    res.json({
      success: true,
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};


const updatePost = async (req, res, next) => {
  try {
    // Find post
    let post = await Post.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if post is already published (published posts cannot be edited)
    if (post.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a published post',
      });
    }

    // Update allowed fields
    const { content, platforms, imageUrl, scheduledAt, status } = req.body;

    if (content !== undefined) post.content = content;
    if (platforms !== undefined) post.platforms = platforms;
    if (imageUrl !== undefined) post.imageUrl = imageUrl || null;
    if (scheduledAt !== undefined) post.scheduledAt = new Date(scheduledAt);
    
    // Handle status change
    if (status !== undefined) {
      // Allow changing from failed to scheduled (re-schedule failed post)
      // Allow changing between draft and scheduled
      // Don't allow setting to published or failed manually (system only)
      if (status === 'published') {
        return res.status(400).json({
          success: false,
          message: 'Cannot manually set status to published',
        });
      }
      // Allow re-scheduling failed posts
      if (post.status === 'failed' && (status === 'scheduled' || status === 'draft')) {
        post.status = status;
      } else if (post.status !== 'failed') {
        post.status = status;
      }
    }

    await post.save();

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};


const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
};
