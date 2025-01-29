import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // Number of virtual users
  duration: '30s', // Duration of the test
};

export default function () {
  // Define the endpoint URL
  const BASE_URL = 'https://test-api.k6.io/';
  const endpoint = `${BASE_URL}/public/crocodiles/`

  // Example payload and headers
  const payload = JSON.stringify({
    test: 'data',
    timestamp = new Date().toISOString(),
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
