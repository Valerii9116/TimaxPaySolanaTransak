import { useState, useEffect } from 'react';
import axios from 'axios';

const TRANSAK_API_URL = 'https://api.transak.com/api/v2';

export const useTransak = () => {
  const [supportedAssets, setSupportedAssets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupportedAssets = async () => {
      try {
        // In a real app, you might proxy this to avoid CORS issues if they arise.
        const response = await axios.get(`${TRANSAK_API_URL}/currencies/crypto-currencies`);
        if (response.data && response.data.response) {
          setSupportedAssets(response.data.response);
        } else {
          throw new Error('Invalid data structure from Transak API');
        }
      } catch (err) {
        console.error("Failed to fetch Transak's supported assets", err);
        setError('Could not load supported assets from Transak.');
      } finally {
        setLoading(false);
      }
    };

    fetchSupportedAssets();
  }, []);

  return { supportedAssets, loading, error };
};
