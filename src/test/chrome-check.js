import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function runComprehensiveTest() {
    const browser = await puppeteer.launch({ 
        headless: true,
        defaultViewport: { width: 1920, height: 1080 }
    });
    const page = await browser.newPage();
    
    // Enhanced error and console logging
    page.on('console', (msg) => {
        const type = msg.type();
        const text = msg.text();
        
        // Log all console messages, not just errors
        console.log(`Console ${type}: ${text}`);
    });

    // Capture and log any page errors
    page.on('pageerror', (error) => {
        console.error('Page Error:', error);
    });

    // Comprehensive routes to test
    const routes = [
        'http://localhost:6001/',
        'http://localhost:6001/login',
        'http://localhost:6001/signup',
        'http://localhost:6001/well-charged/webapp/dashboard',
        'http://localhost:6001/well-charged/webapp/focus',
        'http://localhost:6001/well-charged/webapp/mood',
        'http://localhost:6001/well-charged/webapp/energy',
        'http://localhost:6001/well-charged/webapp/tasks',
        'http://localhost:6001/well-charged/webapp/games'
    ];

    const testResults = {
        routes: {},
        consoleErrors: [],
        pageErrors: []
    };

    // Test each route
    for (const route of routes) {
        try {
            const response = await page.goto(route, { 
                waitUntil: 'networkidle0', 
                timeout: 30000 
            });

            // Check response status
            const status = response.status();
            
            // Evaluate page content and potential rendering issues
            const pageEvaluation = await page.evaluate(() => {
                // Check for basic content rendering
                const bodyContent = document.body.innerText.trim();
                const elementCount = document.querySelectorAll('*').length;
                
                // Check for any React rendering errors
                const reactRootElement = document.getElementById('root');
                const hasReactRoot = !!reactRootElement;
                
                return {
                    bodyContent: bodyContent,
                    elementCount: elementCount,
                    hasReactRoot: hasReactRoot,
                    reactRootInnerHTML: reactRootElement ? reactRootElement.innerHTML : null
                };
            });

            testResults.routes[route] = {
                status: status,
                ...pageEvaluation
            };
        } catch (error) {
            testResults.routes[route] = {
                status: 'failed',
                error: error.message
            };
            testResults.pageErrors.push({
                route: route,
                error: error.message,
                stack: error.stack
            });
        }
    }

    await browser.close();

    // Write comprehensive results
    const resultsPath = path.resolve('chrome-results/comprehensive-test-report.json');
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));

    // Log summary
    console.log('Comprehensive Test Complete');
    console.log('Total Routes Tested:', Object.keys(testResults.routes).length);
    console.log('Page Errors:', testResults.pageErrors.length);
    console.log('Detailed Results:', JSON.stringify(testResults, null, 2));
}

runComprehensiveTest().catch(console.error);
