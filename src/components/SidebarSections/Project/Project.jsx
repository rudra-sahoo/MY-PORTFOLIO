import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Project.css'; // Make sure your CSS file path is correct

const Project = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/projects`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setProjects(data);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching projects:', err);
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleCardClick = () => {
        navigate('/more-about-project');
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
                    <p>No projects found.</p> // Adjusted for better semantics
                )}
            </div>
        </div>
    );
};

export default Project;
