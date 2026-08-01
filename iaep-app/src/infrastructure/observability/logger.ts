// src/infrastructure/observability/logger.ts

/**
 * Structured Logger using Pino-like interface for OpenTelemetry-first architecture.
 * Ensures consistent JSON logging format without vendor lock-in.
 */
export const logger = {
  info: (logData: { event: string; [key: string]: any }) => log('INFO', logData),
  warn: (logData: { event: string; [key: string]: any }) => log('WARN', logData),
  error: (logData: { event: string; [key: string]: any }) => log('ERROR', logData),
  debug: (logData: { event: string; [key: string]: any }) => log('DEBUG', logData),
};

function log(severity: string, data: any) {
  const payload = {
    timestamp: new Date().toISOString(),
    service: process.env.SERVICE_NAME || 'apasific-core',
    environment: process.env.ENVIRONMENT || 'development',
    severity,
    event: data.event,
    traceId: getActiveTraceId(),
    metadata: { ...data },
  };

  // Ensure "event" is not duplicated inside metadata
  delete payload.metadata.event;

  // In production, this writes to stdout for the container orchestrator (e.g., Filebeat/Fluentd) to collect
  console.log(JSON.stringify(payload));
}

function getActiveTraceId(): string {
  // Placeholder for OpenTelemetry context retrieval
  return 'trace-' + Math.random().toString(36).substring(7);
}
