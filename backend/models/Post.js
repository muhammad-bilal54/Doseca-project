
  // Post Model
  // Handles social media post data with scheduling
 
const mongoose = require('mongoose');

// Valid platform options
const PLATFORMS = ['twitter', 'facebook', 'instagram'];

// Valid status options
const STATUSES = ['draft', 'scheduled', 'published', 'failed'];

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [500, 'Content cannot exceed 500 characters'],
      trim: true,
    },
    platforms: {
      type: [String],
      required: [true, 'At least one platform is required'],
      validate: {
        validator: function (v) {
          return (
            v.length > 0 &&
            v.every((platform) => PLATFORMS.includes(platform))
          );
        },
        message: 'Invalid platform(s). Choose from: twitter, facebook, instagram',
      },
    },
    imageUrl: {
      type: String,
      trim: true,
      default: null,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled time is required'],
      index: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'draft',
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compound index for efficient queries
postSchema.index({ user: 1, status: 1 });
postSchema.index({ status: 1, scheduledAt: 1 });

// Validate scheduledAt is in the future when scheduling
postSchema.pre('save', function (next) {
  if (this.status === 'scheduled' && this.scheduledAt <= new Date()) {
   
    if (!this._allowPastSchedule) {
      return next(new Error('Scheduled time must be in the future'));
    }
  }
  next();
});

// Static method to get valid platforms
postSchema.statics.getValidPlatforms = function () {
  return PLATFORMS;
};

// Static method to get valid statuses
postSchema.statics.getValidStatuses = function () {
  return STATUSES;
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
