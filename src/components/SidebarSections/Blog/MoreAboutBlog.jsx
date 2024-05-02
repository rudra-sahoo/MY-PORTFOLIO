import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MoreAboutBlog.css';
import { auth, GoogleAuthProvider, signInWithPopup, signOut } from './firebase-config';
import { ReactComponent as LoadingAnimation } from '../../../Resources/icons/Loading.svg';

const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
const myEmail = process.env.REACT_APP_MASTER_EMAIL;

const MoreAboutBlog = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [newBlog, setNewBlog] = useState({ title: '', content: '', author: '' });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submittingBlog, setSubmittingBlog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState(null); 
    const [authLoading, setAuthLoading] = useState(true);
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setUser(user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();  // Cleanup subscription
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}api/blogs`);
            if (response.data && Array.isArray(response.data.data)) {
                setBlogs(response.data.data);
                setError(null);
            } else {
                throw new Error('Data format is incorrect, expected an array.');
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setError(error.message || 'Unable to fetch blogs');
        } finally {
            setLoading(false);
        }
    };
    

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, new GoogleAuthProvider());
            setUser(result.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error during Google SignIn:', error);
            setError('Failed to sign in with Google');
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
            setError('Failed to sign out');
        }
    };

    const deleteBlog = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) return;
    
        setIsDeleting(true);
        setDeletingId(id);
    
        try {
            const response = await axios.delete(`${apiUrl}api/blog/${id}`);
            if (response.data.success) {
                const updatedBlogs = blogs.filter(blog => blog.id !== id);
                setBlogs(updatedBlogs);
                console.log('Blog deleted successfully, updated blogs:', updatedBlogs);
            } else {
                throw new Error('API did not confirm deletion');
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            setError('Failed to delete blog');
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };
    
    const handleThumbnailChange = (event) => {
        setThumbnailFile(event.target.files[0]);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewBlog(prev => ({ ...prev, [name]: value }));
    };

    const submitBlog = async () => {
        if (!isAuthenticated || user.email !== myEmail) {
            setError('Unauthorized attempt to submit a blog.');
            return;
        }
    
        const formData = new FormData();
        formData.append('title', newBlog.title);
        formData.append('content', newBlog.content);
        formData.append('authorSignature', newBlog.author);
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }
    
        setSubmittingBlog(true);  // Start submitting, show loading icon
        try {
            const response = await axios.post(`${apiUrl}api/blog`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data && response.data.success) {
                fetchBlogs();
                setNewBlog({ title: '', content: '', author: '' });
                setThumbnailFile(null);
                setError('');
            } else {
                throw new Error('Failed to post blog');
            }
        } catch (error) {
            console.error('Error posting blog:', error);
            setError('Failed to post blog');
        } finally {
            setSubmittingBlog(false);  // Stop submitting, hide loading icon
        }
    };

    if (loading || authLoading) return <div>Loading...</div>;  // Show loading while fetching blogs or checking auth state
    if (error) return <div className="error">{error}</div>;
    
    return (
        <div className="more-about-blog">
            <h1>Blog List</h1>
            {blogs.length > 0 ? blogs.map((blog, index) => (
                <div key={index} className="blog-item" onClick={() => navigate(`/blogs/${blog.id}`)} style={{ cursor: 'pointer' }}>
                    <h2>{blog.title}</h2>
                    <img src={blog.thumbnailData ? blog.thumbnailData : 'default-thumbnail.png'} alt={blog.title} />
                    {isAuthenticated && user.email === myEmail && (
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation();  // Prevent navigation
                                deleteBlog(blog.id);
                            }}
                            disabled={isDeleting && deletingId === blog.id}
                        >
                            {isDeleting && deletingId === blog.id ? (
                                <LoadingAnimation className="loading-icon" />
                            ) : "Delete Blog"}
                        </button>
                    )}
                </div>
            )) : <p>No blogs available.</p>}
            {isAuthenticated ? (
                <div>
                    {user.email === myEmail && (
                        <>
                            <h2>Add a New Blog</h2>
                            <input type="text" placeholder="Title" name="title" value={newBlog.title} onChange={handleInputChange} />
                            <input type="text" placeholder="Author Name" name="author" value={newBlog.author} onChange={handleInputChange} />
                            <input type="file" onChange={handleThumbnailChange} />
                            <textarea placeholder="Blog content" name="content" value={newBlog.content} onChange={handleInputChange} />
                            <button onClick={submitBlog} disabled={submittingBlog}>
                                {submittingBlog ? <LoadingAnimation className="loading-icon" /> : "Submit Blog"}
                            </button>
                        </>
                    )}
                    <button onClick={handleSignOut}>Sign out</button>
                </div>
            ) : (
                <button onClick={signInWithGoogle}>Sign in with Google</button>
            )}
        </div>
    );    
}    
export default MoreAboutBlog;
