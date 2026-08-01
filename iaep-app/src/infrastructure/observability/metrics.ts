// src/infrastructure/observability/metrics.ts

/**
 * Metrics Collector Interface
 * Agnostic wrapper for recording application, domain, and infrastructure metrics.
 */

export const metrics = {
  recordCounter: (name: string, value: number = 1, tags?: Record<string, string>) => {
    // Integration point for OpenTelemetry Counter
    internalMetricsBuffer.push({ type: 'counter', name, value, tags });
  },
  recordHistogram: (name: string, value: number, tags?: Record<string, string>) => {
    // Integration point for OpenTelemetry Histogram (e.g., latency, duration)
    internalMetricsBuffer.push({ type: 'histogram', name, value, tags });
  },
  recordGauge: (name: string, value: number, tags?: Record<string, string>) => {
    // Integration point for OpenTelemetry Gauge (e.g., active queues)
    internalMetricsBuffer.push({ type: 'gauge', name, value, tags });
  },
};

// In-memory buffer for mock export
const internalMetricsBuffer: any[] = [];

// Expose endpoint for Prometheus or OpenTelemetry Collector scrape
export function exportMetrics() {
  return internalMetricsBuffer;
}
