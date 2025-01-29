import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // Number of virtual users
  duration: '30s', // Duration of the test
};

export default function () {
  // Define the endpoint URL
  const url = 'https://test-api.k6.io/public/crocodiles/';

  // Send a GET request to the endpoint
  const response = http.get(url);

  // Check if the response is HTTP 200 (OK)
  check(response, {
    'is status 200': (r) => r.status === 200,
  });

  // Sleep for a short random duration between requests
  sleep(Math.random() * 1 + 0.5); // 0.5 to 1.5s
}
