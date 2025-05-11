import compression from 'compression';

// Default compression options are usually fine
const compressionMiddleware = compression();

export default compressionMiddleware; 