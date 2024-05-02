import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTwitter, faRedditAlien, faSpotify } from '@fortawesome/free-brands-svg-icons';
import './Profile.css'; // Ensure this path is correct

const Profile = () => {
    const instagramUrl = "https://www.instagram.com/rudra.sahoo0/";
    const twitterUrl = "https://twitter.com/Rudra7555";
    const redditUrl = "https://www.reddit.com/user/Rudra7555/";
    const spotifyUrl = "https://open.spotify.com/user/exsjza11hdm11xgo1gzvm17gl?si=d41efadfbbf9441e";

    return (
        <div className="profile-card">
            <h3 className="profile-card-header">PROFILES</h3>
            <div className="social-media-container">
                <div className="social-row">
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="social-icon-container">
                        <FontAwesomeIcon icon={faInstagram} size="3x" className="social-icon"/>
                    </a>
                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="social-icon-container">
                        <FontAwesomeIcon icon={faTwitter} size="3x" className="social-icon"/>
                    </a>
                </div>
                <div className="social-row">
                    <a href={redditUrl} target="_blank" rel="noopener noreferrer" className="social-icon-container">
                        <FontAwesomeIcon icon={faRedditAlien} size="3x" className="social-icon"/>
                    </a>
                    <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="social-icon-container">
                        <FontAwesomeIcon icon={faSpotify} size="3x" className="social-icon"/>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Profile;
