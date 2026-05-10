import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const CategoryPosts = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch posts filtered by category (assuming backend supports category_slug filter or similar)
        // Adjust parameter name based on backend implementation. For now, assuming `category=slug`
        const response = await api.get('/posts', { params: { category: slug, page } });
        setPosts(response.data.data || []);
        setTotalPages(response.data.meta?.last_page || 1);
        
        // Usually, the category info can be fetched if backend provides it, or extracted from the first post
        if (response.data.data && response.data.data.length > 0) {
          setCategory(response.data.data[0].category);
        } else {
          // Fallback fetch if we need category details even if empty
          const catRes = await api.get(`/categories/${slug}`);
          setCategory(catRes.data.data || { name: slug, description: '' });
        }
      } catch (error) {
        console.error('Failed to load category posts', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    window.scrollTo(0, 0);
  }, [slug, page]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <header style={{ textAlign: 'center', marginBottom: 'var(--space-12)', padding: 'var(--space-8) 0', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '3rem', marginBottom: '1rem', textTransform: 'capitalize' }}>
          {category?.name || slug.replace('-', ' ')}
        </h1>
        {category?.description && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
            {category.description}
          </p>
        )}
        <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem', fontSize: '0.875rem' }}>
          Explore articles in this category.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading articles...</div>
      ) : posts.length > 0 ? (
        <>
          <div className="posts-grid">
            {posts.map(post => (
              <article key={post.id} className="post-card">
                <Link to={`/post/${post.slug}`} className="post-card-image">
                  <img src={post.featured_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'} alt={post.title} />
                </Link>
                <div className="post-card-content">
                  <div className="post-meta">
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="post-title">
                    <Link to={`/post/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <div className="post-excerpt">{post.excerpt || 'A brief summary...'}</div>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
              <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                Page {page} of {totalPages}
              </span>
              <button className="btn btn-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
          No posts found in this category.
        </div>
      )}
    </div>
  );
};

export default CategoryPosts;
