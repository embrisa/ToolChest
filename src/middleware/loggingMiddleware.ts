import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';

// Use 'dev' format for logging in development, or 'combined' for production
const morganMiddleware = morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev');

export default morganMiddleware; 