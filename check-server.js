// Simple script to check if the server is running
import fetch from 'node-fetch';

const checkServerOnPort = async (port) => {
  console.log(`Checking server on port ${port}...`);
  
  try {
    const response = await fetch(`http://localhost:${port}/`);
    console.log(`Port ${port} response status: ${response.status}`);
    if (response.status === 200) {
      console.log(`Server on port ${port} is running and responding correctly!`);
      return true;
    } else {
      console.log(`Server on port ${port} responded with a non-200 status code`);
      return false;
    }
  } catch (error) {
    console.error(`Error connecting to port ${port}:`, error.message);
    return false;
  }
};

const checkAllServers = async () => {
  // Check multiple ports
  const ports = [3000, 3001, 5005, 5006];
  
  for (const port of ports) {
    await checkServerOnPort(port);
    console.log('-------------------');
  }
  
  // Also check the Supabase connection
  try {
    console.log('Checking Supabase connection...');
    const response = await fetch('https://zoubqdwxemivxrjruvam.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs'
      }
    });
    console.log(`Supabase response status: ${response.status}`);
    console.log('Supabase is accessible!');
  } catch (error) {
    console.error('Error connecting to Supabase:', error.message);
  }
};

checkAllServers(); 