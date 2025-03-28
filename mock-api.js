#!/usr/bin/env node

/**
 * Mock API Server for Mission Fresh
 * 
 * This script creates a simple Express server to simulate the Supabase API,
 * providing mock responses to API requests to avoid console errors.
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create the Express app
const app = express();
const port = 3005;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
  next();
});

// Sample mock data
const mockData = {
  users: [
    {
      id: 'user123',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      user_metadata: {
        name: 'Test User',
        avatar_url: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
      }
    }
  ],
  progress: [],
  consumption_logs: [],
  health_data: [],
  user_stats: [],
  notifications: []
};

// Auth endpoints
app.post('/auth/v1/token', (req, res) => {
  const { email, password, grant_type } = req.body;
  
  if (grant_type === 'password') {
    // Handle sign in
    if (email === 'test@example.com' && password === 'password123') {
      res.json({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockData.users[0]
      });
    } else {
      res.status(401).json({
        error: 'invalid_credentials',
        error_description: 'Invalid email or password'
      });
    }
  } else if (grant_type === 'refresh_token') {
    // Handle token refresh
    res.json({
      access_token: 'mock_access_token_refreshed',
      refresh_token: 'mock_refresh_token_refreshed',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockData.users[0]
    });
  } else {
    res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Invalid grant type'
    });
  }
});

app.post('/auth/v1/logout', (req, res) => {
  res.json({ success: true });
});

// Data endpoints
app.get('/rest/v1/:table', (req, res) => {
  const table = req.params.table;
  
  if (mockData[table]) {
    res.json(mockData[table]);
  } else {
    res.json([]);
  }
});

// User-specific data endpoints
app.get('/rest/v1/users/:userId/progress', (req, res) => {
  res.json([
    {
      id: 'progress1',
      user_id: req.params.userId,
      date: new Date().toISOString().split('T')[0],
      category: 'nicotine',
      value: Math.floor(Math.random() * 10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);
});

app.get('/rest/v1/users/:userId/consumption', (req, res) => {
  res.json([
    {
      id: 'consumption1',
      user_id: req.params.userId,
      consumption_date: new Date().toISOString().split('T')[0],
      product_type: 'cigarette',
      brand: 'Mock Brand',
      quantity: Math.floor(Math.random() * 5) + 1,
      unit: 'cigarettes',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);
});

// Fallback route for any other endpoint
app.all('*', (req, res) => {
  res.json({ message: 'Mock API endpoint' });
});

// Start the server
app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
}); 