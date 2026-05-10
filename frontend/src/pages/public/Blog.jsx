import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = { page, search: searchParams.get('search') || undefined };
      const response = await api.get('/posts', { params });
      setPosts(response.data.data || []);
      setTotalPages(response.data.meta?.last_page || 1);
    } catch (error) {
      console.error('Error fetching posts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSidebar = async () => {
      try {
        const [catsRes, tagsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/tags')
        ]);
        setCategories(catsRes.data.data || []);
        setTags(tagsRes.data.data || []);
      } catch (error) {}
    };
    fetchSidebar();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [page, searchParams.get('search')]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchQuery });
    setPage(1);
  };

  return (
    <div className="blog-layout">
      <div className="blog-main">
        <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '2.5rem', marginBottom: '2rem' }}>
          {searchParams.get('search') ? `Search Results: "${searchParams.get('search')}"` : 'All Articles'}
        </h1>
        
        {loading ? (
          <div>Loading...</div>
        ) : posts.length > 0 ? (
          <>
            <div className="posts-list-view">
              {posts.map(post => (
                <article key={post.id} className="post-card">
                  <Link to={`/post/${post.slug}`} className="post-card-image">
                    <img src={post.featured_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'} alt={post.title} />
                  </Link>
                  <div className="post-card-content">
                    <div className="post-meta">
                      <Link to={`/category/${post.category?.slug}`} className="post-category">
                        {post.category?.name || 'Uncategorized'}
                      </Link>
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="post-title">
                      <Link to={`/post/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <div className="post-excerpt">{post.excerpt || 'A brief summary of the post content...'}</div>
                    <div style={{ marginTop: 'var(--space-4)', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>
                      {post.author?.name || 'Admin'}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                <button 
                  className="btn btn-secondary" 
                  disabled={page === 1}
                  onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                  Page {page} of {totalPages}
                </span>
                <button 
                  className="btn btn-secondary" 
                  disabled={page === totalPages}
                  onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
            No posts found.
          </div>
        )}
      </div>

      <aside className="blog-sidebar">
        <div className="sidebar-widget">
          <h3 className="sidebar-widget-title">Search</h3>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem' }}>Go</button>
          </form>
        </div>

        <div className="sidebar-widget">
          <h3 className="sidebar-widget-title">Categories</h3>
          <ul className="sidebar-list">
            {categories.map(cat => (
              <li key={cat.id}>
                <Link to={`/category/${cat.slug}`}>
                  <span>{cat.name}</span>
                  {/* Ideally backend returns post_count, but we just show name for now */}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-widget">
          <h3 className="sidebar-widget-title">Popular Tags</h3>
          <div className="sidebar-tags">
            {tags.map(tag => (
              <Link key={tag.id} to={`/tag/${tag.slug}`} className="post-tag">
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Blog;
