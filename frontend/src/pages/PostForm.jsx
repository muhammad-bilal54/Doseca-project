/**
 * Post Form Page
 * Handles creating and editing posts
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { postApi } from '../api';
import { Loading } from '../components';

const PLATFORMS = ['twitter', 'facebook', 'instagram'];

const PostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [content, setContent] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('scheduled');

  // Load post data if editing
  useEffect(() => {
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postApi.getById(id);
      const post = response.data.post;

      setContent(post.content);
      setPlatforms(post.platforms);
      setScheduledAt(formatDateForInput(post.scheduledAt));
      setImageUrl(post.imageUrl || '');
      setStatus(post.status);
    } catch (error) {
      toast.error('Failed to load post');
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

  // Format date for datetime-local input
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  // Get minimum date (now)
  const getMinDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // At least 1 minute in future
    return formatDateForInput(now);
  };

  // Handle platform toggle
  const handlePlatformToggle = (platform) => {
    setPlatforms((prev) => {
      if (prev.includes(platform)) {
        return prev.filter((p) => p !== platform);
      }
      return [...prev, platform];
    });
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.length > 500) {
      newErrors.content = 'Content cannot exceed 500 characters';
    }

    if (platforms.length === 0) {
      newErrors.platforms = 'Select at least one platform';
    }

    if (!scheduledAt) {
      newErrors.scheduledAt = 'Scheduled time is required';
    } else if (new Date(scheduledAt) <= new Date()) {
      newErrors.scheduledAt = 'Scheduled time must be in the future';
    }

    if (imageUrl && !/^https?:\/\/.+/.test(imageUrl)) {
      newErrors.imageUrl = 'Invalid URL format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    try {
      const postData = {
        content: content.trim(),
        platforms,
        scheduledAt: new Date(scheduledAt).toISOString(),
        imageUrl: imageUrl.trim() || null,
        status,
      };

      if (isEditing) {
        await postApi.update(id, postData);
        toast.success('Post updated successfully');
      } else {
        await postApi.create(postData);
        toast.success('Post created successfully');
      }

      navigate('/posts');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save post';
      toast.error(message);
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{isEditing ? 'Edit Post' : 'Create Post'}</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          {/* Content */}
          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Content <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <textarea
              id="content"
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share?"
              rows={4}
              disabled={submitting}
            />
            <p className="form-hint">
              {content.length}/500 characters
            </p>
            {errors.content && <p className="form-error">{errors.content}</p>}
          </div>

          {/* Platforms */}
          <div className="form-group">
            <label className="form-label">
              Platforms <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <div className="checkbox-group">
              {PLATFORMS.map((platform) => (
                <label key={platform} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={platforms.includes(platform)}
                    onChange={() => handlePlatformToggle(platform)}
                    disabled={submitting}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{platform}</span>
                </label>
              ))}
            </div>
            {errors.platforms && <p className="form-error">{errors.platforms}</p>}
          </div>

          {/* Scheduled Time */}
          <div className="form-group">
            <label htmlFor="scheduledAt" className="form-label">
              Schedule For <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              type="datetime-local"
              id="scheduledAt"
              className="form-input"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={getMinDate()}
              disabled={submitting}
            />
            {errors.scheduledAt && <p className="form-error">{errors.scheduledAt}</p>}
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label htmlFor="imageUrl" className="form-label">
              Image URL (optional)
            </label>
            <input
              type="url"
              id="imageUrl"
              className="form-input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={submitting}
            />
            {errors.imageUrl && <p className="form-error">{errors.imageUrl}</p>}
          </div>

          {/* Status */}
          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={submitting || status === 'published'}
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              {/* Published is system-only, shown when viewing */}
              {status === 'published' && <option value="published">Published</option>}
              {/* Failed posts can be re-scheduled */}
              {status === 'failed' && <option value="failed">Failed (select another status to retry)</option>}
            </select>
            {status === 'published' && (
              <p className="form-hint">
                This post has been published and cannot be edited.
              </p>
            )}
            {status === 'failed' && (
              <p className="form-hint" style={{ color: 'var(--warning-color)' }}>
                This post failed to publish. Change status to "Scheduled" to retry.
              </p>
            )}
          </div>

          {errors.form && (
            <p className="form-error text-center mb-md">{errors.form}</p>
          )}

          {/* Buttons */}
          <div className="btn-group">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? 'Saving...'
                : isEditing
                ? 'Update Post'
                : 'Create Post'}
            </button>
            <Link to="/posts" className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;
