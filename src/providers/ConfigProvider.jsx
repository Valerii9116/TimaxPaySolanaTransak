import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const ConfigContext = createContext(null);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get('/api/getConfig');
        if (response.data && response.data.data) {
          setConfig(response.data.data);
        } else {
          throw new Error('Invalid config structure received from the server.');
        }
      } catch (err) {
        console.error('Failed to fetch application config:', err);
        setError('Could not load application configuration. Please ensure the API is running and configured correctly.');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading Configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
         <div className="error-message main-status">{error}</div>
      </div>
    );
  }

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};

ConfigProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
