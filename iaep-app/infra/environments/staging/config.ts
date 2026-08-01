export const config = {
  env: 'staging',
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://staging.apasific.org',
    timeout: 10000,
  },
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
  features: {
    enableMockData: false,
  }
};
