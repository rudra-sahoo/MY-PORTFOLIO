import { Link } from 'react-router-dom';
import React from 'react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    return (
        <div className={styles.titleContainer}>
            <h1 className={styles.sidebarHeader}>
                <Link to="/" className={styles.homeLink}>𝔽𝕠𝕟𝕏</Link>
            </h1>
        </div>
    );
}

export default Sidebar;
