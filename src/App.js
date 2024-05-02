import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Loading from './components/Loading';
import Sidebar from './components/Sidebar/Sidebar';
import AboutMe from './components/SidebarSections/About-Me/AboutMe';
import LetsWorkTogether from './components/SidebarSections/Contact-Page/LetsWorkTogether';
import MoreAboutMe from './components/SidebarSections/About-Me/MoreAboutMe';
import Ticker from './components/SidebarSections/Ticker/Ticker';
import Project from './components/SidebarSections/Project/Project';
import Blog from './components/SidebarSections/Blog/Blog';
import MoreAboutBlog from "./components/SidebarSections/Blog/MoreAboutBlog";
import BlogDetails from './components/SidebarSections/Blog/BlogDetails';
import MoreAboutProject from './components/SidebarSections/Project/MoreAboutProject';
import ContactPage from './components/SidebarSections/Contact-Page/ContactPage';
import Profile from './components/SidebarSections/Profile/Profile';
import './App.css';

const AppWrapper = () => {
    return (
        <Router>
            <App />
        </Router>
    );
};

const App = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [shutterOpen, setShutterOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleRouteChange = () => {
            setShutterOpen(true);
            setTimeout(() => setShutterOpen(false), 5000); // Corresponds to animation time
        };

        handleRouteChange(); // Call on initial load and route changes
        return () => setShutterOpen(false); // Clean up
    }, [location]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`App ${isLoading ? '' : 'layout-after-loading'}`}>
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    {shutterOpen && <div className="shutter"></div>}
                    <Sidebar />
                    <div className="main-layout">
                        <Routes>
                            <Route path="/" element={
                                <>
                                    <div className="lines-container">
                                        <div className="line" style={{ left: '18%' }}></div>
                                        <div className="line" style={{ left: '36%' }}></div>
                                        <div className="line" style={{ left: '56%' }}></div>
                                        <div className="line" style={{ right: '23%' }}></div>
                                    </div>
                                    <div className="horizontal-section">
                                        <div className="vertical-section">
                                            <AboutMe />
                                            <LetsWorkTogether />
                                            <Profile />
                                            <Project />
                                        </div>
                                        <div className="vertical-section">
                                            <Ticker />
                                            
                                        </div>
                                    </div>
                                    <Blog />
                                </>
                            } />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/Aboutme" element={<MoreAboutMe />} />
                            <Route path="/more-about-project" element={<MoreAboutProject />} />
                            <Route path="/blogs" element={<MoreAboutBlog />} />
                            <Route path="/blogs/:id" element={<BlogDetails />} />
                        </Routes>
                        <div className="footer">
                            CRAFTED WITH LOVE BY RUDRA
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AppWrapper;
