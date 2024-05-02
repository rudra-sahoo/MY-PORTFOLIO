import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Blog.css';

const Blog = () => {
    const navigate = useNavigate();
    const [latestBlog, setLatestBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

    useEffect(() => {
        const fetchLatestBlog = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/latest-blog`);
                if (response.data && response.data.success && response.data.data) {
                    setLatestBlog(response.data.data);
                } else {
                    throw new Error('No latest blog post found');
                }
            } catch (error) {
                console.error('Error fetching latest blog:', error);
                setError(error.response?.data?.message || error.message || 'Unable to load blog');
            } finally {
                setLoading(false);
            }
        };

        fetchLatestBlog();
    }, [apiUrl]);

    const handleClick = () => {
        navigate('/blogs');
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="blog-container" onClick={handleClick} style={{ cursor: 'pointer' }}>
            {latestBlog ? (
                <div className="blog-card">
                    <img src={latestBlog.thumbnailUrl || 'default-thumbnail.png'} alt="Blog Thumbnail" className="blog-thumbnail" />
                    <div className="blog-details">
                        <h1>{latestBlog.title}</h1>
                    </div>
                </div>
            ) : (
                <div>No latest blog posted yet</div>
            )}
        </div>
    );
};

export default Blog;
