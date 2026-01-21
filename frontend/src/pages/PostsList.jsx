/**
 * Posts List Page
 * Shows paginated list of user's posts with filtering
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { postApi } from '../api';
import { Loading } from '../components';

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current filter values from URL
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentStatus = searchParams.get('status') || '';

  useEffect(() => {
    fetchPosts();
  }, [currentPage, currentStatus]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
      };

      if (currentStatus) {
        params.status = currentStatus;
      }

      const response = await postApi.getAll(params);
      setPosts(response.data.posts);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    const status = e.target.value;
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('page', '1');
    setSearchParams(params);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postApi.delete(id);
      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Get status badge class
  const getStatusClass = (status) => {
    return `badge badge-${status}`;
  };

  // Get platform badge class
  const getPlatformClass = (platform) => {
    return `platform-badge platform-${platform}`;
  };

  return (
    <div className="page">
      <div className="page-header flex-between">
        <h1 className="page-title">Posts</h1>
        <Link to="/posts/new" className="btn btn-primary">
          Create Post
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-md">
        <div className="flex gap-md" style={{ alignItems: 'center' }}>
          <label htmlFor="status-filter" style={{ fontWeight: 500 }}>
            Filter by Status:
          </label>
          <select
            id="status-filter"
            className="form-select"
            value={currentStatus}
            onChange={handleStatusChange}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="card">
        {loading ? (
          <Loading />
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <p>No posts found</p>
            <Link to="/posts/new" className="btn btn-primary mt-md">
              Create your first post
            </Link>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Content</th>
                    <th className="hide-mobile">Platforms</th>
                    <th>Status</th>
                    <th className="hide-mobile">Scheduled</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post._id}>
                      <td>
                        <span className="truncate" title={post.content}>
                          {post.content.substring(0, 50)}
                          {post.content.length > 50 ? '...' : ''}
                        </span>
                      </td>
                      <td className="hide-mobile">
                        {post.platforms.map((platform) => (
                          <span key={platform} className={getPlatformClass(platform)}>
                            {platform}
                          </span>
                        ))}
                      </td>
                      <td>
                        <span className={getStatusClass(post.status)}>
                          {post.status}
                        </span>
                      </td>
                      <td className="hide-mobile">{formatDate(post.scheduledAt)}</td>
                      <td>
                        <div className="btn-group">
                          {post.status !== 'published' && (
                            <Link
                              to={`/posts/${post._id}/edit`}
                              className={`btn btn-sm ${post.status === 'failed' ? 'btn-warning' : 'btn-outline'}`}
                            >
                              {post.status === 'failed' ? 'Retry' : 'Edit'}
                            </Link>
                          )}
                          {post.status === 'published' && (
                            <Link
                              to={`/posts/${post._id}/edit`}
                              className="btn btn-outline btn-sm"
                            >
                              View
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-outline btn-sm"
                >
                  Previous
                </button>

                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} posts)
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.pages}
                  className="btn btn-outline btn-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PostsList;
