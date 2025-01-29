import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users over 30 seconds
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users over 30 seconds
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
  },
};

export default function () {
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

  // Send a POST request to the endpoint
  const response = http.post(endpoint, payload, params);

  // Check if the response is HTTP 200 (OK)
  check(response, {
    'is status 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
    'response includes success': (r) => r.json().success === true,
  });

  // Sleep for a short random duration between requests
  sleep(Math.random() * 4 + 1); // 1 to 5s
}
