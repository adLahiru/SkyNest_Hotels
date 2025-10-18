// Script to update hotel_branches table with photo (base64 image)
// Place this file in backend/src/scripts and run with: node updateBranchPhotos.js

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Update with your DB config
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'skynest_hotels',
};

// Map branch names to image files (update as needed)
const branchImages = {
  'Sky Nest Colombo': '../../Images/park-hyatt-sydney.png',
  'Sky Nest Kandy': '../../Images/umbrella-pool-chair.jpg',
  'Sky Nest Galle': '../../Images/6256702-middle.png',
};

async function updateBranchPhotos() {
  const connection = await mysql.createConnection(dbConfig);
  for (const [branchName, imagePath] of Object.entries(branchImages)) {
    const absPath = path.resolve(__dirname, imagePath);
    if (!fs.existsSync(absPath)) {
      console.error(`Image not found: ${absPath}`);
      continue;
    }
    const imageBuffer = fs.readFileSync(absPath);
    await connection.execute(
      'UPDATE hotel_branches SET photo = ? WHERE branch_name = ?',
      [imageBuffer, branchName]
    );
    console.log(`Updated photo for branch: ${branchName}`);
  }
  await connection.end();
  console.log('Done updating branch photos.');
}

updateBranchPhotos().catch(console.error);
