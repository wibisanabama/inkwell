import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const Home = () => {
  const [featuredPost, setFeaturedPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [postsRes, catsRes] = await Promise.all([
          api.get('/posts?per_page=7'),
          api.get('/categories')
        ]);
        
        const posts = postsRes.data.data || [];
        if (posts.length > 0) {
          setFeaturedPost(posts[0]);
          setRecentPosts(posts.slice(1, 7));
        }
        setCategories(catsRes.data.data || []);
      } catch (error) {
        console.error('Failed to load home data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (loading) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      {/* Featured Post Hero */}
      {featuredPost && (
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-content">
              <Link to={`/category/${featuredPost.category?.slug}`} className="post-category" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                {featuredPost.category?.name || 'Uncategorized'}
              </Link>
              <h1>
                <Link to={`/post/${featuredPost.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {featuredPost.title}
                </Link>
              </h1>
              <p>{featuredPost.excerpt || 'Read this amazing article to discover more about the topic. It is filled with great insights.'}</p>
              <div className="post-meta" style={{ fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>By {featuredPost.author?.name || 'Admin'}</span>
                <span>•</span>
                <span>{new Date(featuredPost.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span>{featuredPost.views_count || 0} views</span>
              </div>
            </div>
            <Link to={`/post/${featuredPost.slug}`} className="hero-image-wrapper">
              <div className="hero-badge">Featured</div>
              <img src={featuredPost.featured_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80'} alt={featuredPost.title} />
            </Link>
          </div>
        </section>
      )}

      {/* Category Pills */}
      {categories.length > 0 && (
        <section className="category-pills-container">
          <div className="category-pills">
            <Link to="/blog" className="category-pill active">All Topics</Link>
            {categories.map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="category-pill">
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '0 auto var(--space-16)', padding: '0 var(--space-4)' }}>
          <div className="section-title">
            <h2>Latest Articles</h2>
            <Link to="/blog" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>View All</Link>
          </div>
          <div className="posts-grid">
            {recentPosts.map(post => (
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
                  <div className="post-excerpt">{post.excerpt || 'A brief summary of the post content goes here...'}</div>
                  <div style={{ marginTop: 'var(--space-4)', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>
                    {post.author?.name || 'Admin'}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="newsletter-section">
        <h2 className="newsletter-title">Subscribe to Inkwell</h2>
        <p className="newsletter-desc">Get the latest articles and insights delivered directly to your inbox. No spam, ever.</p>
        <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }}>
          <input type="email" placeholder="Your email address" className="newsletter-input" required />
          <button type="submit" className="btn btn-primary">Subscribe</button>
        </form>
      </section>
    </div>
  );
};

export default Home;
