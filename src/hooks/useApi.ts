import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useEffect, useMemo } from 'react';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useApi = (): AxiosInstance => {
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // To handle cookies for authentication
    });

    // Request interceptor - adds auth token if available
    instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle common errors
    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response) {
          // Handle different HTTP status codes
          switch (error.response.status) {
            case 401:
              // Unauthorized - clear storage and redirect to login
              localStorage.removeItem('authToken');
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
              toast({
                title: 'Session expired',
                description: 'Please log in again to continue.',
                variant: 'destructive',
              });
              break;
            case 403:
              toast({
                title: 'Access denied',
                description: 'You do not have permission to perform this action.',
                variant: 'destructive',
              });
              break;
            case 404:
              // Not found - could handle with a toast or redirect to 404
              break;
            case 500:
              toast({
                title: 'Server error',
                description: 'Something went wrong on our end. Please try again later.',
                variant: 'destructive',
              });
              break;
            default:
              // Handle other status codes
              if (error.response.data?.message) {
                toast({
                  title: 'Error',
                  description: error.response.data.message,
                  variant: 'destructive',
                });
              }
          }
        } else if (error.request) {
          // Request made but no response received
          toast({
            title: 'Network error',
            description: 'Unable to connect to the server. Please check your internet connection.',
            variant: 'destructive',
          });
        } else {
          // Error in setting up the request
          toast({
            title: 'Request error',
            description: error.message || 'An unexpected error occurred',
            variant: 'destructive',
          });
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  // For offline support, we could add a mechanism to queue requests when offline
  useEffect(() => {
    const handleOffline = () => {
      toast({
        title: 'You are offline',
        description: 'Some features may be unavailable until you reconnect.',
        variant: 'default',
      });
    };

    const handleOnline = () => {
      toast({
        title: 'Back online',
        description: 'Your connection has been restored.',
        variant: 'default',
      });
      // Here we could process any queued requests
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return api;
}; 