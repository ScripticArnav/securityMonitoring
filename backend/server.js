import app from './app.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const PORT = process.env.PORT || 3001;
const DB_NAME = process.env.DB_NAME;

mongoose.connect(process.env.MONGO_URI,{
  dbName: DB_NAME,
})
  .then(() => app.listen(PORT, () => console.log(`Server running on ${PORT}`)))
  .catch(err => console.log(err));

