import React, { useState, useEffect, useCallback, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MoreAboutBlog.css';
import { auth, GoogleAuthProvider, signInWithPopup, signOut } from './firebase-config';
import { ReactComponent as LoadingAnimation } from '../../../Resources/icons/Loading.svg';
import LoadingVideo from '../../../Resources/Loading_Animation.webm';

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
    const [contentLoading, setContentLoading] = useState(true);
    const [videoFinished, setVideoFinished] = useState(false);

    const fetchUserData = useCallback(async (googleId) => {
        try {
            const response = await axios.get(`${apiUrl}/api/user/${googleId}`);
            if (response.data) {
                setUser(response.data);
            } else {
                throw new Error("No user data received");
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setError('Failed to load user data');
        }
    }, []);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.play();
            }
        }, );  // Delay the video play to simulate longer load, or wait for data
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!authLoading && !loading && videoFinished) {
            setContentLoading(false);
        } else {
            setContentLoading(true);  // Ensure it's set to true initially or when loading/auth state changes
        }
    }, [authLoading, loading, videoFinished]);

    const handleVideoEnd = () => {
        setVideoFinished(true);
    };
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);
                setIsAuthenticated(true);
                await fetchUserData(user.uid);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, [fetchUserData]);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/api/blogs`);
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
            const response = await axios.delete(`${apiUrl}/api/blog/${id}`);
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

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, new GoogleAuthProvider());
            setUser(result.user);  // This sets the initial user data from Google Auth
            setIsAuthenticated(true);
            
            // Save user data to MongoDB via backend or update if already exists
            const userData = {
                googleId: result.user.uid,
                displayName: result.user.displayName,
                email: result.user.email,
                imageUrl: result.user.photoURL
            };
    
            await axios.post(`${apiUrl}/api/saveUser`, userData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

        } catch (error) {
            console.error('Error during Google SignIn:', error);
            setError('Failed to sign in with Google');
        }
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
            const response = await axios.post(`${apiUrl}/api/blog`, formData, {
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
    const videoRef = useRef(null);



    if (contentLoading) {
        return (
            <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <video 
                    ref={videoRef} 
                    width="40%" 
                    muted 
                    onEnded={handleVideoEnd}
                    style={{ maxWidth: '500px', maxHeight: '300px' }}
                >
                    <source src={LoadingVideo} type="video/webm" />
                </video>
            </div>
        );
    }
    if (loading || authLoading) return <div>Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    
    return (
        <div className="more-about-blog">
            <h1>Blog List</h1>
            {blogs.length > 0 ? blogs.map((blog, index) => (
                <div key={index} className="blog-item" onClick={() => navigate(`/blogs/${blog.id}`)} style={{ cursor: 'pointer' }}>
                    <h2>{blog.title}</h2>
                    <img src={blog.thumbnailData || 'default-thumbnail.png'} alt={blog.title} />
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
    
            {isAuthenticated && user.email === myEmail && (
                <div>
                    <h2>Add a New Blog</h2>
                    <input type="text" placeholder="Title" name="title" value={newBlog.title} onChange={handleInputChange} />
                    <input type="text" placeholder="Author Name" name="author" value={newBlog.author} onChange={handleInputChange} />
                    <input type="file" onChange={handleThumbnailChange} />
                    <textarea placeholder="Blog content" name="content" value={newBlog.content} onChange={handleInputChange} />
                    <button onClick={submitBlog} disabled={submittingBlog}>
                        {submittingBlog ? <LoadingAnimation className="loading-icon" /> : "Submit Blog"}
                    </button>
                </div>
            )}
    
            {/* Authentication and User Interaction */}
            {isAuthenticated && user ? (
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px'}}>
                    <img src={user.imageUrl || 'default-user-image.png'} alt="Profile" style={{
                        width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px'
                    }} />
                    <h2>Welcome, {user.displayName}</h2>
                    <button onClick={handleSignOut} style={{marginLeft: 'auto' }}>Sign out</button>
                </div>
            ) : (
                <button onClick={signInWithGoogle} style={{ marginTop:'20px'}}>Sign in with Google</button>
            )}
        </div>
    );
}
export default MoreAboutBlog;
