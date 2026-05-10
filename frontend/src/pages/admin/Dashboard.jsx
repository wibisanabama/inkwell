import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiFileText, FiMessageSquare, FiEye, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../../styles/dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_posts: 0,
    total_comments: 0,
    total_views: 0,
    total_users: 0,
    recent_posts: [],
    recent_comments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      {/* Stat Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon icon-blue"><FiFileText /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total_posts}</span>
            <span className="stat-label">Total Posts</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon icon-green"><FiMessageSquare /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total_comments}</span>
            <span className="stat-label">Comments</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon icon-purple"><FiEye /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total_views}</span>
            <span className="stat-label">Total Views</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon icon-orange"><FiUsers /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total_users}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
      </div>

      {/* Tables Area */}
      <div className="dashboard-content">
        {/* Recent Posts Panel */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent Posts</h2>
          </div>
          <div className="panel-body">
            {stats.recent_posts.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_posts.map(post => (
                    <tr key={post.id} style={{cursor: 'pointer'}}>
                      <td>{post.title}</td>
                      <td>
                        <span className={`badge badge-${post.status}`}>
                          {post.status}
                        </span>
                      </td>
                      <td>{new Date(post.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>No posts found.</p>
            )}
          </div>
        </div>

        {/* Recent Comments Panel */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent Comments</h2>
          </div>
          <div className="panel-body">
            {stats.recent_comments.length > 0 ? (
              <ul className="comment-list">
                {stats.recent_comments.map(comment => (
                  <li key={comment.id} className="comment-item">
                    <div className="comment-author">{comment.user ? comment.user.name : comment.guest_name}</div>
                    <div className="comment-text">{comment.body}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>No comments found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
