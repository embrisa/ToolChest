import 'reflect-metadata';
import dotenv from 'dotenv';
import { createApp } from './app';

// Load environment variables from .env file
dotenv.config();

const app = createApp();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 