export const config = {
  env: 'development',
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 5000,
  },
  logger: {
    level: process.env.LOG_LEVEL || 'debug',
  },
  features: {
    enableMockData: true,
  }
};
