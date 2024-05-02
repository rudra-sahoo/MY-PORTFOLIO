import React, { useState, useEffect } from 'react';
import './ContactPage.css';
// Import the SVG as a React component
import { ReactComponent as LoadingAnimation } from '../../../../src/Resources/icons/Loading.svg';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [responseMessage, setResponseMessage] = useState({
        message: '',
        isError: false
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (responseMessage.message !== '') {
            const timer = setTimeout(() => {
                setResponseMessage({ message: '', isError: false });
            }, 3000); // Automatically clear message after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [responseMessage.message]);

    const validateField = (name, value) => {
        let errorMsg = '';
        if (!value.trim()) {
            errorMsg = `${name} is required`;
        } else if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
            errorMsg = 'Email is invalid';
        }
        setErrors(prevErrors => ({ ...prevErrors, [name]: errorMsg }));
        return errorMsg === '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}api/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                setResponseMessage({ message: 'Message sent successfully! Check your email for confirmation.', isError: false });
                setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form on success
            } else {
                throw new Error(data.message || 'Failed to send message.');
            }
        } catch (error) {
            setResponseMessage({ message: error.message, isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="contact-container">
            <div className="contact-info">
                <h2>Contact Info</h2>
                <div className="info-section email-section">
                    <i className="fas fa-envelope email-icon"></i>
                    <div className="email-addresses">
                        <p>rudra.workwith@gmail.com</p>
                    </div>
                </div>
            </div>
            <div className="contact-form">
                <h2>Let's work together.</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="name" aria-label="Name" placeholder="Name *" required value={formData.name} onChange={handleChange} />
                    <input type="email" name="email" aria-label="Email" placeholder="Email *" required value={formData.email} onChange={handleChange} />
                    <input type="text" name="subject" aria-label="Subject" placeholder="Your Subject *" required value={formData.subject} onChange={handleChange} />
                    <textarea name="message" aria-label="Message" placeholder="Your Message *" required value={formData.message} onChange={handleChange}></textarea>
                    <button type="submit" disabled={isLoading || Object.values(errors).some(err => err)}>
                        {isLoading ? <LoadingAnimation className="loading-icon" /> : 'Send Message'}
                    </button>
                </form>
                {responseMessage.message && (
                    <div className={`response-message ${responseMessage.isError ? 'error' : 'success'}`}>
                        {responseMessage.message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactForm;
