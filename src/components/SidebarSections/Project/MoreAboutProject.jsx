import React, { useState, useEffect } from 'react';
import styles from './MoreAboutProject.module.css';

// Import the SVGs as React components
import { ReactComponent as CplusplusIcon } from './icons/cplusplus.svg';
import { ReactComponent as JavascriptIcon } from './icons/javascript.svg';
import { ReactComponent as PythonIcon } from './icons/python.svg';
import { ReactComponent as Html5Icon } from './icons/html5.svg';
import { ReactComponent as Css3Icon } from './icons/css3.svg';
import { ReactComponent as DefaultIcon } from './icons/default.svg';

const MoreAboutProject = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
/** hello*/
    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_API_URL}/api/projects`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP status ${response.status}`);
                return response.json();
            })
            .then(setProjects)
            .catch(error => {
                console.error('Error fetching data:', error);
                setError(`Failed to load: ${error.message}`);
            })
            .finally(() => setLoading(false));
    }, []);

    const IconComponent = ({ language }) => {
        const iconMap = {
            'C++': CplusplusIcon,
            'JavaScript': JavascriptIcon,
            'Python': PythonIcon,
            'HTML': Html5Icon,
            'CSS': Css3Icon,
            // Add more mappings as required
        };
        const Icon = iconMap[language] || DefaultIcon; // DefaultIcon needs to be imported or defined
        return <Icon className={styles.icon} style={{ width: '18px', height: '18px' }} />;
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className={styles.projectsContainer}>
            {projects.length > 0 ? projects.map(project => (
                <div key={project._id} className={styles.projectCard}>
                    <h2 className={styles.projectHeader}>{project.name}</h2>
                    <div className={styles.languagesContainer}>
                        {project.languages && Object.entries(project.languages).map(([language, percentage]) => (
                            <span key={language} className={styles.languageTag}>
                                <IconComponent language={language} />
                                {language}: {percentage}%
                            </span>
                        ))}
                    </div>
                    <p className={styles.projectDescription}>{project.description || "No description available."}</p>
                    <p className={styles.projectDate}>Created on: {new Date(project.createdAt).toLocaleDateString()}</p>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                        View on GitHub
                    </a>
                </div>
            )) : <p>No projects found.</p>}
        </div>
    );
};

export default MoreAboutProject;
