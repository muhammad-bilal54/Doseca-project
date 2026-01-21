
//  PublicationLog Model
//  Tracks when posts are published
 

const mongoose = require('mongoose');

const publicationLogSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post reference is required'],
      // Note: index is created below with unique constraint
    },
    publishedAt: {
      type: Date,
      required: [true, 'Published time is required'],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one log per post (prevent duplicate publishing)
publicationLogSchema.index({ post: 1 }, { unique: true });

const PublicationLog = mongoose.model('PublicationLog', publicationLogSchema);

module.exports = PublicationLog;
