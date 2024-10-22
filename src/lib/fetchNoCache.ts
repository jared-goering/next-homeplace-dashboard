// src/lib/fetchNoCache.ts
import axios, { AxiosRequestConfig } from 'axios';

const fetchNoCache = (url: string, options: AxiosRequestConfig = {}) => {
  return axios.get(url, {
    ...options,
    headers: {
      ...options.headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate'  // Ensures responses are not cached
    }
  });
};

export default fetchNoCache;
