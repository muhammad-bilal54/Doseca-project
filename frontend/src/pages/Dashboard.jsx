/**
 * Dashboard Page
 * Shows statistics and upcoming posts
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { dashboardApi } from '../api';
import { Loading } from '../components';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, upcomingRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getUpcoming(),
      ]);

      setStats(statsRes.data.stats);
      setUpcoming(upcomingRes.data.posts);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Get platform badge class
  const getPlatformClass = (platform) => {
    return `platform-badge platform-${platform}`;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalPosts || 0}</div>
          <div className="stat-label">Total Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.scheduledPosts || 0}</div>
          <div className="stat-label">Scheduled</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.publishedPosts || 0}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.draftPosts || 0}</div>
          <div className="stat-label">Drafts</div>
        </div>
      </div>

      {/* Posts by Platform */}
      {stats?.postsByPlatform && Object.keys(stats.postsByPlatform).length > 0 && (
        <div className="card mb-md">
          <div className="card-header">
            <h2 className="card-title">Posts by Platform</h2>
          </div>
          <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
            {Object.entries(stats.postsByPlatform).map(([platform, count]) => (
              <div key={platform} className="stat-card" style={{ flex: '1', minWidth: '120px' }}>
                <div className="stat-value">{count}</div>
                <div className="stat-label" style={{ textTransform: 'capitalize' }}>
                  {platform}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Posts */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Upcoming Scheduled Posts</h2>
          <Link to="/posts/new" className="btn btn-primary btn-sm">
            Create Post
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="empty-state">
            <p>No upcoming posts scheduled</p>
            <Link to="/posts/new" className="btn btn-primary mt-md">
              Schedule your first post
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Content</th>
                  <th>Platforms</th>
                  <th>Scheduled For</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((post) => (
                  <tr key={post._id}>
                    <td>
                      <span className="truncate" title={post.content}>
                        {post.content.substring(0, 50)}
                        {post.content.length > 50 ? '...' : ''}
                      </span>
                    </td>
                    <td>
                      {post.platforms.map((platform) => (
                        <span key={platform} className={getPlatformClass(platform)}>
                          {platform}
                        </span>
                      ))}
                    </td>
                    <td>{formatDate(post.scheduledAt)}</td>
                    <td>
                      <Link
                        to={`/posts/${post._id}/edit`}
                        className="btn btn-outline btn-sm"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
