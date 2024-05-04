import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth, GoogleAuthProvider, signInWithPopup, signOut } from '../Blog/firebase-config';
import { ErrorBoundary } from 'react-error-boundary';
import './Logs.css';
import { CSVLink } from 'react-csv';  // Using react-csv for CSV download functionality
import animationVideo from '../../../Resources/Error_Animation.webm'; // Make sure path is correct

const AUTHORIZED_EMAIL = process.env.REACT_APP_MASTER_EMAIL;
const SECRET_KEYWORD = process.env.REACT_APP_SECRET_KEYWORD;  // This should be secure and stored appropriately
const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

const ErrorFallback = ({ error, resetErrorBoundary }) => (
    <div role="alert">
        <p>Something went wrong:</p>
        <pre>{error.message}</pre>
        <button onClick={resetErrorBoundary}>Try again</button>
    </div>
);

const Popup = ({ onClose, onSubmitKeyword }) => {
    const [keyword, setKeyword] = useState('');

    const checkKeyword = () => {
        if (keyword === SECRET_KEYWORD) {
            onSubmitKeyword(true);
        } else {
            alert('Incorrect keyword.');
            setKeyword('');
        }
    };

    return (
        <div className="popup">
            <div className="popup-content">
                <h2>Enter Secret Keyword to Access Logs</h2>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Enter keyword"
                />
                <button onClick={checkKeyword}>Submit</button>
                <button onClick={onClose} className="close-btn">&times;</button>
            </div>
        </div>
    );
};

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showPopup, setShowPopup] = useState(true);
    const [animationActive, setAnimationActive] = useState(true);

    useEffect(() => {
        const checkAuthorization = async () => {
            auth.onAuthStateChanged(user => {
                if (user) {
                    if (user.email === AUTHORIZED_EMAIL) {
                        setUser(user);
                    } else {
                        alert('Unauthorized access detected.');
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
                setLoading(false);
            });
        };
    
        checkAuthorization();
    }, []);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/logs`);
                const filteredAndMappedLogs = response.data.filter(log => log.includes('IP:'))
                    .map(logString => {
                        try {
                            const parts = logString.split(',');
                            // Combining the URL parts back together in case it was split by commas
                            const mapIndex = parts.findIndex(part => part.includes('Map:'));
                            const mapParts = parts.slice(mapIndex); // This gets all parts from 'Map:' onward
                            let mapLink = mapParts.join(',').split('Map: ')[1].trim(); // Rejoin and extract after 'Map: '
                            if (mapLink.includes('http')) { // Double-check to ensure we only capture until the end of the URL
                                mapLink = mapLink.match(/https:\/\/[^ ]+/)[0];
                            }
    
                            return {
                                ip: parts.find(part => part.includes('IP:')).split('IP: ')[1].trim(),
                                location: parts.find(part => part.includes('Location:')).split('Location: ')[1].trim(),
                                isp: parts.find(part => part.includes('ISP:')).split('ISP: ')[1].trim(),
                                postalCode: parts.find(part => part.includes('Postal Code:')).split('Postal Code: ')[1].trim(),
                                mapLink: mapLink
                            };
                        } catch (error) {
                            console.error('Error parsing log entry:', logString, error);
                            return null; // Return null to filter out any failed parses
                        }
                    })
                    .filter(log => log !== null); // Remove any nulls from failed parses
    
                setLogs(filteredAndMappedLogs.slice(0, 50));
            } catch (error) {
                console.error("Failed to fetch log history:", error);
            } finally {
                setLoading(false);
            }
        };
    
        if (!animationActive) {
            fetchLogs();
        }
    }, [animationActive]);
    

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, new GoogleAuthProvider());
        } catch (error) {
            console.error("Authentication failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } finally {
            setLoading(false);
        }
    };

    const handleKeywordSubmit = (isValid) => {
        if (isValid) {
            setAnimationActive(false);
            setShowPopup(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className="logs-container">
                {animationActive && (
                    <video autoPlay loop muted style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
                        <source src={animationVideo} type="video/webm" />
                    </video>
                )}
                {showPopup && <Popup onClose={() => setShowPopup(false)} onSubmitKeyword={handleKeywordSubmit} />}
                {user ? (
                    <>
                        <button onClick={handleLogout}>Sign Out</button>
                        <CSVLink data={logs} filename="logs.csv" className="btn">
                            Download Logs
                        </CSVLink>
                        <div className="logs">
                            {logs.map((log, index) => (
                                <p key={index}>
                                    IP: {log.ip}, Location: {log.location}, ISP: {log.isp}, Postal Code: {log.postalCode},
                                    Map: <a href={log.mapLink} target="_blank" rel="noopener noreferrer">Google Maps</a>
                                </p>
                            ))}
                        </div>
                    </>
                ) : (
                    <button onClick={handleLogin}>Sign In with Google</button>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default Logs;
