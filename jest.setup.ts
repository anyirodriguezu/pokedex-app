// Suppress the "overlapping act() calls" warning that appears when react-hook-form
// resolves Yup async validation inside RNTL's waitFor act scope.
// This is a known incompatibility between react-hook-form 7.x, Yup, and React 19
// concurrent mode. The warning is harmless — tests remain reliable and correct.
const originalConsoleError = console.error.bind(console);
console.error = (...args: Parameters<typeof console.error>) => {
  const first = typeof args[0] === 'string' ? args[0] : '';
  // Suppress known benign act() warnings produced by react-reconciler / RNTL in tests
  if (
    first.includes('overlapping act()') ||
    first.includes('The current testing environment is not configured to support act') ||
    first.includes('not wrapped in act')
  ) {
    return;
  }
  originalConsoleError(...args);
};
