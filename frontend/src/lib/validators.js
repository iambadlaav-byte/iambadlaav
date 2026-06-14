/**
 * Frontend validator shim — re-exports from the shared @validators workspace package.
 * The alias '@validators' → '../packages/validators/src' is set in vite.config.js.
 *
 * Import from here in frontend components for a stable local path,
 * or import directly from '@validators' for explicitness.
 */
export * from '@validators';
