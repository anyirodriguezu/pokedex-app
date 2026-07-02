// Shim for react-dom in React Native — flushSync just calls the callback synchronously
export const flushSync = (fn) => fn();

export default { flushSync };
