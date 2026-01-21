

const { Post } = require('../models');


const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get counts in parallel
    const [
      totalPosts,
      scheduledPosts,
      publishedPosts,
      draftPosts,
      failedPosts,
      platformStats,
    ] = await Promise.all([
      Post.countDocuments({ user: userId }),
      Post.countDocuments({ user: userId, status: 'scheduled' }),
      Post.countDocuments({ user: userId, status: 'published' }),
      Post.countDocuments({ user: userId, status: 'draft' }),
      Post.countDocuments({ user: userId, status: 'failed' }),
      // Group by platform
      Post.aggregate([
        { $match: { user: userId } },
        { $unwind: '$platforms' },
        {
          $group: {
            _id: '$platforms',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Format platform stats
    const postsByPlatform = {};
    platformStats.forEach((stat) => {
      postsByPlatform[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalPosts,
          scheduledPosts,
          publishedPosts,
          draftPosts,
          failedPosts,
          postsByPlatform,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


const getUpcoming = async (req, res, next) => {
  try {
    const posts = await Post.find({
      user: req.user._id,
      status: 'scheduled',
      scheduledAt: { $gt: new Date() },
    })
      .sort({ scheduledAt: 1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: { posts },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUpcoming,
};
