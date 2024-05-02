import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutMe.css';
import profilePic from './profile.jpeg';

const AboutMe = () => {
    const [typingText, setTypingText] = useState('');
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    const phrases = useMemo(() => ["Hey there", "It's Rudra"], []);

    useEffect(() => {
        const typeChar = () => {
            const currentPhrase = phrases[phraseIndex];
            const nextCharIndex = isDeleting ? typingText.length - 1 : typingText.length + 1;
            setTypingText(currentPhrase.substring(0, nextCharIndex));

            if (!isDeleting && typingText === currentPhrase) {
                setTimeout(() => setIsDeleting(true), 2000); // Increase pause time before deleting
            } else if (isDeleting && typingText === '') {
                setTimeout(() => { // Add delay before typing next phrase
                    setIsDeleting(false);
                    setPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
                }, 500);
            }
        };

        const typingSpeed = isDeleting ? 100 : 200; // Adjust speeds for more natural typing
        const timer = setTimeout(typeChar, typingSpeed);

        return () => clearTimeout(timer);
    }, [typingText, isDeleting, phrases, phraseIndex]);

    const navigateToMoreAboutMe = () => {
        navigate('/Aboutme');
    };

    return (
        <div className="about-me-container" onClick={navigateToMoreAboutMe}>
            <div className="about-me-card">
                <div className="about-me-header">
                    <img src={profilePic} alt="Rudra Sahoo" className="about-me-profile-pic"/>
                    <p className="profile-caption">A WEB DESIGNER AND A GAMER</p>
                    <div className="typing-text">
                        {typingText}
                        <span className="cursor"></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutMe;
