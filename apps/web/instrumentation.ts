// Next.js instrumentation hook for OpenTelemetry
// This runs before the application starts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import and initialize observability only on the server side
    const { initializeObservability } = await import(
      '@ai-app-platform/observability'
    );
    initializeObservability();
  }
}
