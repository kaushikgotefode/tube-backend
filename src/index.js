import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';
dotenv.config({path: './.env'});

connectDB()
.then(() => {
    console.log('Database connected successfully');
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
    app.on('error', (err) => {
        console.error('Server error:', err);
    });
}).catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
});

