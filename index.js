import http from 'k6/http';
import { check, sleep } from 'k6';

// Define test scenarios
export const options = {
  scenarios: {
    // Load test: "Knock knock, housekeeping"
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 }, // Ramp up to 100 users over 2 minutes
        { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
        { duration: '2m', target: 0 },   // Ramp down to 0 users over 2 minutes
      ],
      env: { SCENARIO: 'load' },
      tags: { scenario: 'load' },
    },

    // Stress test: "I will break you"
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 200 },   // Ramp up to 200 users over 3 minutes
        { duration: '5m', target: 200 },   // Stay at 200 users for 5 minutes
        { duration: '3m', target: 300 },   // Increase to 300 users over 3 minutes
        { duration: '2m', target: 0 },     // Ramp down to 0 users over 2 minutes
      ],
      env: { SCENARIO: 'stress' },
      tags: { scenario: 'stress' },
    },

    // Spike test: "You scared the CRAP out of me!"
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 0 },    // Start at 0 users for 30s
        { duration: '30s', target: 500 },  // Spike to 500 users over 30 seconds
        { duration: '1m', target: 500 },   // Maintain 500 users for 1 minute
        { duration: '30s', target: 0 },    // Ramp down to 0 users over 30 seconds
      ],
      env: { SCENARIO: 'spike' },
      tags: { scenario: 'spike' },
    },

    // Soak test: "Stop smothering me, MOM!"
    soak: {
      executor: 'constant-vus',
      vus: 50,
      duration: '2h',
      env: { SCENARIO: 'soak' },
      tags: { scenario: 'soak' },
    },

    // Define various thresholds
    thresholds: {
      http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
      http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
    },
  },
};

export default function () {
  // Fetch the scenario for functional logic
  const scenario = __ENV.SCENARIO || 'load';

  // Define the endpoint URL
  const BASE_URL = 'https://test-api.k6.io/';
  const endpoint = `${BASE_URL}/public/crocodiles/`

  // Example payload and headers
  const payload = JSON.stringify({
    test: 'data',
    timestamp: new Date().toISOString(),
  });

  // Define parameters
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer [token]',
    },
  };

  // Send a POST request to the endpolint
  const response = http.post(endpoint, payload, params);

  // Scenario-specific logic
  switch(scenario) {
    case 'load':
      // Check if the response is HTTP 200 (OK)
      check(response, {
        'is status 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
        'response includes success': (r) => r.json().success === true,
      });
      break;

    case 'stress':
      // Check if the response is HTTP 200 (OK)
      check(response, {
        'is status 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
        'response includes success': (r) => r.json().success === true,
      });
      break;

    case 'spike':
      // Check if the response is HTTP 200 (OK)
      check(response, {
        'is status 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
        'response includes success': (r) => r.json().success === true,
      });
      break;

    case 'soak':
      // Check if the response is HTTP 200 (OK)
      check(response, {
        'is status 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
        'response includes success': (r) => r.json().success === true,
      });
      break;
  }

  // Sleep for a short random duration between requests
  sleep(Math.random() * 4 + 1); // 1 to 5s
}
