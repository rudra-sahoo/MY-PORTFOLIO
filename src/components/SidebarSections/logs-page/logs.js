import React, { useEffect, useState } from 'react';
import { auth, GoogleAuthProvider, signInWithPopup, signOut } from '../Blog/firebase-config';
import { ErrorBoundary } from 'react-error-boundary';
import { useSocket } from './useSocket';
import axios from 'axios';
import './Logs.css';

const ErrorFallback = ({ error, resetErrorBoundary }) => (
    <div role="alert">
        <p>Something went wrong:</p>
        <pre>{error.message}</pre>
        <button onClick={resetErrorBoundary}>Try again</button>
    </div>
);

const Popup = ({ onClose }) => (
    <div className="popup">
        <div className="popup-content">
            <button onClick={onClose} className="close-btn">&times;</button>
            <p>This is a confidential website. Do not visit without authorized access or else you will be blocked permanently.</p>
        </div>
    </div>
);

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(true);
    const [showIPLogs, setShowIPLogs] = useState(false);
    const socket = useSocket("http://localhost:3001", user);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        // Fetch historical logs from the backend
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:3001/api/logs');
                const fetchedLogs = response.data.map(log => parseLog(log));
                setLogs(fetchedLogs);
            } catch (error) {
                console.error("Failed to fetch log history:", error);
            }
            setLoading(false);
        };

        fetchLogs();

        if (socket) {
            socket.on('httpLog', log => {
                const parsedLog = parseLog(log);
                setLogs(prevLogs => [...prevLogs, parsedLog]);
            });
        }
    
        // Clean up on unmount
        return () => {
            if (socket) {
                socket.off('httpLog');
            }
        };
    }, [socket]);

    const parseLog = (log) => {
        // Assume log might be a string formatted as "IP: ..., Location: ..., ISP: ..., Postal Code: ..., Map: ..."
        if (typeof log === 'string') {
            // Extract IP and Location from a standard log string
            const ipMatch = log.match(/IP: ([\d.]+)/);
            const locationMatch = log.match(/Location: ([\w\s,]+)/);
            const ispMatch = log.match(/ISP: ([\w\s,]+)/);
            const postalMatch = log.match(/Postal Code: ([\w\s,]+)/);
            const mapMatch = log.match(/Map: ([\w\s,:\/\.\?=]+)/);
    
            return {
                message: `Log from IP: ${ipMatch ? ipMatch[1] : 'N/A'}`,
                ip: ipMatch ? ipMatch[1] : 'N/A',
                location: locationMatch ? locationMatch[1] : 'N/A',
                isp: ispMatch ? ispMatch[1] : 'N/A',
                postalCode: postalMatch ? postalMatch[1] : 'N/A',
                mapLink: mapMatch ? mapMatch[1] : 'N/A'
            };
        } else if (typeof log === 'object') {
            // If the log is already an object, directly format it
            return {
                message: log.message || 'Log entry',
                ip: log.ip || 'N/A',
                location: log.location || 'N/A',
                isp: log.isp || 'N/A',
                postalCode: log.postalCode || 'N/A',
                mapLink: log.mapLink || 'N/A'
            };
        } else {
            // Handle unexpected log types
            console.error("Unexpected log type:", typeof log);
            return {
                message: 'Unexpected log format',
                ip: 'N/A',
                location: 'N/A',
                isp: 'N/A',
                postalCode: 'N/A',
                mapLink: 'N/A'
            };
        }
    };   

    const handleLogin = async () => {
        setLoading(true);
        try {
            await signInWithPopup(auth, new GoogleAuthProvider());
        } catch (error) {
            console.error("Authentication failed:", error);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    };

    const handleClosePopup = () => setShowPopup(false);

    const toggleIPLogs = () => {
        setShowIPLogs(!showIPLogs);
    };

    const filteredLogs = showIPLogs ? logs.filter(log => log.ip !== 'N/A' && log.location !== 'N/A') : logs;

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className="logs-container">
                {showPopup && <Popup onClose={handleClosePopup} />}
                {user ? (
                    <>
                        <button onClick={handleLogout} disabled={loading}>Sign Out</button>
                        <button onClick={toggleIPLogs}>
                            {showIPLogs ? 'Show All Logs' : 'Show Only IP/Location Logs'}
                        </button>
                        <div className="logs">
                            {filteredLogs.map((log, index) => (
                                <p key={index} className="log">
                                IP: {log.ip}, Location: {log.location}, ISP: {log.isp}, Postal Code: {log.postalCode}, Map: <a href={log.mapLink} target="_blank" rel="noopener noreferrer">Google Maps</a>
                                </p>
                            ))}
                        </div>
                    </>
                ) : (
                    <button onClick={handleLogin} disabled={loading}>Sign In with Google</button>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default Logs;
