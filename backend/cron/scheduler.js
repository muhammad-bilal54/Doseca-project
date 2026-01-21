
//  Post Scheduler
//  Background job that publishes scheduled posts
 
const cron = require('node-cron');
const { Post, PublicationLog } = require('../models');


const processScheduledPosts = async () => {
  const now = new Date();
  console.log(`[Scheduler] Running at ${now.toISOString()}`);

  try {
   
    const postsToPublish = await Post.find({
      status: 'scheduled',
      scheduledAt: { $lte: now },
    })
      .sort({ createdAt: 1 }) 
      .limit(100); 
    if (postsToPublish.length === 0) {
      console.log('[Scheduler] No posts to publish');
      return;
    }

    console.log(`[Scheduler] Found ${postsToPublish.length} posts to publish`);

   
    for (const post of postsToPublish) {
      try {
       
        const existingLog = await PublicationLog.findOne({ post: post._id });
        if (existingLog) {
          console.log(`[Scheduler] Post ${post._id} already has publication log, skipping`);
         
          if (post.status === 'scheduled') {
            post.status = 'published';
            await post.save();
          }
          continue;
        }

       
        console.log(`[Scheduler] Publishing post ${post._id} to: ${post.platforms.join(', ')}`);

        // Update post status
        post.status = 'published';
        post._allowPastSchedule = true; 

        // Create publication log
        await PublicationLog.create({
          post: post._id,
          publishedAt: now,
        });

        console.log(`[Scheduler] Successfully published post ${post._id}`);
      } catch (postError) {
        
        console.error(`[Scheduler] Error publishing post ${post._id}:`, postError.message);

        
        try {
          post.status = 'failed';
          post._allowPastSchedule = true;
          await post.save();
        } catch (saveError) {
          console.error(`[Scheduler] Failed to update post status:`, saveError.message);
        }
      }
    }
  } catch (error) {
    console.error('[Scheduler] Error in scheduler:', error.message);
  }
};


const startScheduler = () => {
  console.log('[Scheduler] Starting post scheduler...');

  
  cron.schedule('* * * * *', processScheduledPosts, {
    scheduled: true,
    timezone: 'UTC',
  });

  console.log('[Scheduler] Scheduler started - runs every minute');

  
  processScheduledPosts();
};

module.exports = {
  startScheduler,
  processScheduledPosts, 
};
