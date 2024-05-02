import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LetsWorkTogether.css';

const LetsWorkTogether = () => {
    const navigate = useNavigate();

    const navigateToContact = () => {
        navigate('/contact');
    };

    return (
        <div className="lets-work-together-container"> {/* Container added here */}
            <div className="lets-work-together-card" onClick={navigateToContact}>
                <div className="text-container">
                    <h3>Let's</h3>
                    <h3>work <span className="text-blue">together.</span></h3>
                </div>
            </div>
        </div>
    );
};

export default LetsWorkTogether;
