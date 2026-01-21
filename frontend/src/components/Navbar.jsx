/**
 * Navbar Component
 * Navigation bar with links and logout button
 */

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          Social Scheduler
        </Link>

        <div className="navbar-menu">
          <Link to="/" className={isActive('/')}>
            Dashboard
          </Link>
          <Link to="/posts" className={isActive('/posts')}>
            Posts
          </Link>
          <Link to="/posts/new" className={isActive('/posts/new')}>
            Create Post
          </Link>
        </div>

        <div className="navbar-user">
          <span className="navbar-email">{user?.email}</span>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">
            Logout
          </button>
        </div>
      </div>

      <style>{`
        .navbar {
          background: var(--card-background);
          border-bottom: 1px solid var(--border-color);
          padding: var(--spacing-md) 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }

        .navbar-brand {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary-color);
          text-decoration: none;
        }

        .navbar-menu {
          display: flex;
          gap: var(--spacing-md);
        }

        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-md);
          transition: color 0.2s, background-color 0.2s;
        }

        .nav-link:hover {
          color: var(--primary-color);
        }

        .nav-link.active {
          color: var(--primary-color);
          background-color: var(--background-color);
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .navbar-email {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .navbar-container {
            flex-direction: column;
          }

          .navbar-menu {
            order: 3;
            width: 100%;
            justify-content: center;
          }

          .navbar-email {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
