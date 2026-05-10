import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiClock, FiCalendar, FiUser, FiShare2, FiTwitter, FiFacebook, FiLinkedin } from 'react-icons/fi';
import api from '../../api/axios';
import CommentSection from '../../components/CommentSection';

const PostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/posts/${slug}`);
        setPost(response.data.data || response.data);
        
        // Fetch related posts (if endpoint exists as described in Feature 8)
        try {
          const relatedRes = await api.get(`/posts/${slug}/related`);
          setRelatedPosts(relatedRes.data.data || []);
        } catch (relatedErr) {
          console.error('Failed to fetch related posts', relatedErr);
        }
      } catch (error) {
        console.error('Failed to load post', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading article...</div>;
  }

  if (!post) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
        <p>Post not found.</p>
        <Link to="/blog" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Blog</Link>
      </div>
    );
  }

  // Calculate rough reading time
  const wordCount = post.body ? post.body.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <article className="post-detail-wrapper">
      <header className="post-detail-header">
        <Link to={`/category/${post.category?.slug}`} className="post-category" style={{ display: 'inline-block', marginBottom: '1rem' }}>
          {post.category?.name || 'Uncategorized'}
        </Link>
        <h1 className="post-detail-title">{post.title}</h1>
        <div className="post-detail-meta">
          <div className="post-detail-meta-item">
            <FiUser /> {post.author?.name || 'Admin'}
          </div>
          <div className="post-detail-meta-item">
            <FiCalendar /> {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="post-detail-meta-item">
            <FiClock /> {readingTime} min read
          </div>
        </div>
      </header>

      {post.featured_image && (
        <div className="post-detail-hero">
          <img src={post.featured_image} alt={post.title} />
        </div>
      )}

      <div className="post-detail-content">
        {/* Render TipTap HTML */}
        <div 
          className="post-body ProseMirror" 
          dangerouslySetInnerHTML={{ __html: post.body }} 
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map(tag => (
              <Link key={tag.id} to={`/tag/${tag.slug}`} className="post-tag">
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Share Section UI */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
          <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiShare2 /> Share:
          </span>
          <button className="btn-icon"><FiTwitter /></button>
          <button className="btn-icon"><FiFacebook /></button>
          <button className="btn-icon"><FiLinkedin /></button>
        </div>

        {/* Comment Section (Feature 7) */}
        <CommentSection postSlug={post.slug} />
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div style={{ background: 'var(--color-surface)', marginTop: '4rem', padding: '4rem 0' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 var(--space-4)' }}>
            <h2 style={{ fontFamily: 'var(--font-family-heading)', marginBottom: '2rem' }}>Read Next</h2>
            <div className="posts-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {relatedPosts.map(rp => (
                <article key={rp.id} className="post-card">
                  <Link to={`/post/${rp.slug}`} className="post-card-image">
                    <img src={rp.featured_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80'} alt={rp.title} />
                  </Link>
                  <div className="post-card-content">
                    <h3 className="post-title" style={{ fontSize: '1.125rem' }}>
                      <Link to={`/post/${rp.slug}`}>{rp.title}</Link>
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default PostDetail;
