// src/infrastructure/observability/tracer.ts

/**
 * Distributed Tracing Abstraction
 * Wraps OpenTelemetry Tracer to provide seamless context propagation across boundaries.
 */

export const tracer = {
  startSpan: (name: string, attributes?: Record<string, any>) => {
    // Mock span creation
    const spanId = 'span-' + Math.random().toString(36).substring(7);
    return {
      spanId,
      name,
      attributes,
      end: () => {
        // Mock span completion
      }
    };
  },
  withActiveSpan: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const span = tracer.startSpan(name);
    try {
      return await fn();
    } finally {
      span.end();
    }
  }
};
