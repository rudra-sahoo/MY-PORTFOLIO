import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Project.css'; 

const Project = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasFetched = useRef(false);  // Using useRef to track the fetch status across re-renders

    useEffect(() => {
        // Only perform the fetch if it has not been done yet
        if (!hasFetched.current) {
            hasFetched.current = true;  // Set this to true to prevent future fetches
            console.log('Project component mounted and fetching data.')
            const fetchProjects = async () => {
                try {
                    const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/api/projects`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const data = await response.json();
                    setProjects(data);
                } catch (err) {
                    console.error('Error fetching projects:', err);
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchProjects();
        }
    }, []);

    const handleCardClick = () => {
        navigate('/project');
    };

    if (isLoading) return <div className="project-container">Loading...</div>;
    if (error) return <div className="project-container">Error: {error}</div>;

    return (
        <div className="project-container">
            <div className="project-card" onClick={handleCardClick}>
                <h3 className="project-title">Latest Projects</h3>
                {projects.length > 0 ? (
                    <ul>
                        {projects.map(project => (
                            <li key={project._id}>
                                <span className="star-icon">★</span> {project.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No projects found.</p>
                )}
            </div>
        </div>
    );
};

export default Project;
