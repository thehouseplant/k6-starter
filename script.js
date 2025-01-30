import http from 'k6/http';
import { check, sleep } from 'k6';

// Define test scenarios
export const options = {
  scenarios: {
    // Smoke test: Quick test with minimal load
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      env: { SCENARIO: 'smoke' },
      tags: { scenario: 'smoke' },
    },

    // Load test: Sustained moderate load
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

    // Stress test: Heavy load to find breaking points
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

    // Spike test: Sudden burst of traffic
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

    // Soak test: Long duration with sustained load
    soak: {
      executor: 'constant-vus',
      vus: 50,
      duration: '2h',
      env: { SCENARIO: 'soak' },
      tags: { scenario: 'soak' },
    },

    // Define various thresholds
    thresholds: {
      // Define thresholds based on scenario
      'http_req_duration': [
        // Strict threshold for smoke test
        {
          threshold: 'p(95)<500', // 95% of requests should be below 500ms
          abortOnFail: true,
          delayAbortFail: '10s',
        },
        // More lenient load for load/stress tests
        {
          threshold: 'p(95)<1000', // 95% of requests should be below 1000ms
          abortOnFail: false,
        }
      ],
      'http_req_failed': ['rate<0.01'], // Less than 1% of requests should fail
    },
  },
};

export default function () {
  // Fetch the scenario for functional logic
  const scenario = __ENV.SCENARIO || 'smoke';

  // Define endpoint URL
  const BASE_URL = 'http://localhost:3000';

  // Define headers
  const headers = {
    'Content-Type': 'application/json',
    //'Authorization': `Bearer ${__ENV.API_TOKEN}`,
  };

  // Scenario-specific logic
  switch(scenario) {
    case 'smoke':
      // Simple health check
      const healthCheck = http.get(`${BASE_URL}/health`);
      check(healthCheck, {
        'status is 200': (r) => r.status === 200,
      });
      break;

    case 'load':
    case 'stress':
      // Full API workflow
      const payload = JSON.stringify({
        test: 'data',
        timestamp: new Date().toISOString(),
      });

      const responses = http.batch([
        ['GET', `${BASE_URL}/api/items`, null, { headers }],
        ['POST', `${BASE_URL}/api/items`, JSON.stringify(payload), { headers }],
        ['GET', `${BASE_URL}/api/status`, null, { headers }],
      ]);

      responses.forEach((response, index) => {
        check(response, {
          'status is 200': (r) => r.status === 200,
          'response time OK': (r) => r.timings.duration < getThresholdForScenario(scenario)
        });
      });
      break;

    case 'spike':
      // Simple API workflow
      const response = http.post(`${BASE_URL}/api/items`, JSON.stringify(payload), { headers });
      break;

    case 'soak':
      // Mixed operations for soak testing
      if (Math.random() < 0.7) {
        http.get(`${BASE_URL}/api/items`, { headers });
      } else {
        http.post(`${BASE_URL}/api/items`, JSON.stringify(payload), { headers });
      }
      break;
  }

  // Sleep for a short random duration between requests
  const sleepTime = getSleepTimeForScenario(scenario);
  sleep(sleepTime);
}

// Function for setting thresholds for each scenario
function getThresholdForScenario(scenario) {
  const thresholds = {
    smoke: 200,    // 200ms
    load: 500,     // 500ms
    stress: 1000,  // 1s
    spike: 2000,   // 2s
    soak: 500      // 500ms
  };
  return thresholds[scenario] || 500;
}

// Function for generating sleep times for each scenario
function getSleepTimeForScenario(scenario) {
  const sleepTimes = {
    smoke: 1,
    load: Math.random() * 2 + 1,    // 1-3s
    stress: Math.random() * 1 + 0.5, // 0.5-1.5s
    spike: 0.1,                      // 100ms
    soak: Math.random() * 3 + 2     // 2-5s
  };
  return sleepTimes[scenario] || 1;
}
