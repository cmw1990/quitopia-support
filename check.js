import axios from 'axios';

const BASE_URL = 'http://localhost:6001/easier-focus';

const routes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/web-tools',
  '/enhanced-focus',
  '/anti-fatigue',
  '/energy',
  '/anti-googlitis',
  '/flow-state',
  '/body-doubling'
];

async function checkRoutes() {
  console.log('Checking routes...');
  
  for (const route of routes) {
    try {
      const response = await axios.get(`${BASE_URL}${route}`);
      console.log(`✅ ${route}: ${response.status}`);
    } catch (error) {
      console.error(`❌ ${route}: ${error.message}`);
    }
  }
}

checkRoutes().catch(console.error); 