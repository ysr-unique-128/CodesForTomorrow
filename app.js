import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors';
import usageRouter from './endpoints/usage.endpoint.js';
import usersRouter from './endpoints/users.endpoint.js';
import dotenv from 'dotenv';


dotenv.config();


const app = express()
const PORT = process.env.PORT;


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());


app.use('/usage', usageRouter);
app.use('/users', usersRouter);


app.get('/status', (req, res) => {
	res.send('Up and running...');
});

const connectDB = () => {
	const MONGODB_URI = process.env.MONGODB_URI;
	if (MONGODB_URI) {
		mongoose.connect(MONGODB_URI)
			.then(() => {
				console.log('Connected to DB successfully!');

				// Start listening on port
				app.listen(PORT, () => {
					console.log(`Server is running on http://localhost:${PORT}`);
				});
			})
			.catch(() => {
				console.log('Database connection failed!');
			});
	}
}

connectDB();