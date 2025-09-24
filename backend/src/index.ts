import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';


dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/', (req, res) => {
  res.send('Welcome to SkyNet Hotels API!');
});

// Middleware
app.use(express.json());

// Routes
// app.use('/api/auth', authRoutes);


app.listen(PORT, () => {
  try {
    const bannerPath = path.join(__dirname, '..', 'banner.txt');
    const banner = fs.readFileSync(bannerPath, 'utf8');
    console.log(banner);
  } catch (error) {
    console.log('Banner file not found');
  }
  console.log(`\nServer is running on port ${PORT}`);
});




