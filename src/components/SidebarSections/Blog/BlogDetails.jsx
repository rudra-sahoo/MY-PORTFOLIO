import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './BlogDetails.css';
import { auth, GoogleAuthProvider, signInWithPopup } from './firebase-config';

const BlogDetails = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setUser(user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        });

        const fetchBlogDetails = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${apiUrl}api/blog/${id}`);
                if (response.data.success) {
                    setBlog(response.data.data);
                    fetchComments();
                } else {
                    throw new Error('Blog not found');
                }
            } catch (error) {
                setError(error.response ? error.response.data.message : 'Error fetching blog');
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const commentsResponse = await axios.get(`${apiUrl}api/comments/${id}`);
                if (commentsResponse.data.success) {
                    setComments(commentsResponse.data.comments);
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchBlogDetails();
        return () => unsubscribe();
    }, [id, apiUrl]);

    const submitComment = async (content, parentId = null) => {
        if (!content) return;
        try {
            const postData = {
                content,
                blogId: id,
                userId: user.uid,
                userName: user.displayName,
                parentId
            };
            const response = await axios.post(`${apiUrl}api/comments`, postData);
            if (response.data.success) {
                setComments([...comments, response.data.comment]);
                setCommentText('');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, new GoogleAuthProvider());
            setUser(result.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error during Google SignIn', error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="blog-details-container">
            {blog ? (
                <>
                    <h1>{blog.title}</h1>
                    {blog.content.split(/\n+/).map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                    <div className="author-signature">
                        <p>Written by: {blog.authorSignature}</p>
                    </div>
                    <CommentsSection 
                        comments={comments}
                        submitComment={submitComment}
                        isAuthenticated={isAuthenticated}
                        signInWithGoogle={signInWithGoogle}
                        commentText={commentText}
                        setCommentText={setCommentText}
                    />
                </>
            ) : <p>Blog not found.</p>}
        </div>
    );
};

const CommentsSection = ({
    comments,
    submitComment,
    isAuthenticated,
    signInWithGoogle,
    commentText,
    setCommentText
}) => {
    return (
        <div className="comments-section">
            <h2>Comments</h2>
            {comments.map((comment, index) => (
                <div key={index} className="comment-item">
                    <p>{comment.userName}: {comment.content}</p>
                </div>
            ))}
            {isAuthenticated ? (
                <>
                    <textarea 
                        value={commentText} 
                        onChange={(e) => setCommentText(e.target.value)} 
                        placeholder="Write a comment..."
                    ></textarea>
                    <button onClick={() => submitComment(commentText)}>Submit Comment</button>
                </>
            ) : (
                <div>
                    <p>You need to be logged in to comment.</p>
                    <button onClick={signInWithGoogle}>Sign in with Google</button>
                </div>
            )}
        </div>
    );
};
export default BlogDetails;
