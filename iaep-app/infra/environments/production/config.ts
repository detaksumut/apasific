export const config = {
  env: 'production',
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.apasific.org',
    timeout: 15000,
  },
  logger: {
    level: process.env.LOG_LEVEL || 'warn',
  },
  features: {
    enableMockData: false,
  }
};
