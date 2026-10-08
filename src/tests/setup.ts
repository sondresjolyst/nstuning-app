import '@testing-library/jest-dom';

// The API clients refuse to start without it, as they do in a real build.
process.env.NEXT_PUBLIC_API_URL = 'http://api.test/api';
