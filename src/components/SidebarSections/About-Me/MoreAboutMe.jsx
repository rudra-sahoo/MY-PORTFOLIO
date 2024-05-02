import React from 'react';
import './MoreAboutMe.css';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import profilePic from './profile.jpeg';
import reactIcon from '../../../../src/Resources/icons/react.svg';  // Adjust path as necessary
import nodeIcon from '../../../../src/Resources/icons/nodejs.svg';  // Adjust path as necessary
import cssIcon from '../../../../src/Resources/icons/css3.svg';     // Adjust path as necessary
import htmlIcon from '../../../../src/Resources/icons/html5.svg';   // Adjust path as necessary
import jsIcon from '../../../../src/Resources/icons/javascript.svg'; 
import cppIcon from '../../../../src/Resources/icons/c++.svg'; 
import javaIcon from '../../../../src/Resources/icons/java.svg'; 
import pythonIcon from '../../../../src/Resources/icons/python.svg'; 

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
    labels: ['React', 'Node.js', 'CSS', 'HTML', 'JavaScript', 'C++', 'Java', 'Python'],
    datasets: [
      {
        label: 'Skill Level',
        data: [12, 19, 3, 5, 2, 3, 10, 15],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(199, 199, 199, 0.2)',
          'rgba(118, 93, 105, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(118, 93, 105, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
  };
  
  const MoreAboutMe = () => {
    return (
      <div className="more-about-me-card">
        <img src={profilePic} alt="Profile" className="more-about-me-profile-pic" />
        <h2>More About Me</h2>
        <p>This section delves deeper into my personal and professional life. Here, I expand on my unique skills and career goals.</p>
        <div style={{ height: '300px' }}>
          <Doughnut data={data} options={options} />
        </div>
        <div className="icons-container">
          <div className="icon-box"><img src={reactIcon} alt="React" /></div>
          <div className="icon-box"><img src={nodeIcon} alt="Node.js" /></div>
          <div className="icon-box"><img src={cssIcon} alt="CSS3" /></div>
          <div className="icon-box"><img src={htmlIcon} alt="HTML5" /></div>
          <div className="icon-box"><img src={jsIcon} alt="JavaScript" /></div>
          <div className="icon-box"><img src={cppIcon} alt="C++" /></div>
          <div className="icon-box"><img src={javaIcon} alt="Java" /></div>
          <div className="icon-box"><img src={pythonIcon} alt="Python" /></div>
        </div>
      </div>
    );
  };
  
  export default MoreAboutMe;
