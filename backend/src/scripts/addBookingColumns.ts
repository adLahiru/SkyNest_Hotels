import { db } from '../config/db';

async function addBookingColumns() {
  const connection = await db.getConnection();
  
  try {
    console.log('Adding number_of_guests and special_requests columns to booking table...');
    
    // Check if columns already exist
    const [columns]: any = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'SkyNest_Hotels' 
      AND TABLE_NAME = 'booking' 
      AND COLUMN_NAME IN ('number_of_guests', 'special_requests')
    `);
    
    if (columns.length > 0) {
      console.log('Columns already exist. Skipping...');
      return;
    }
    
    // Add the columns
    await connection.query(`
      ALTER TABLE booking 
      ADD COLUMN number_of_guests INT DEFAULT 1 AFTER booking_date,
      ADD COLUMN special_requests TEXT DEFAULT NULL AFTER number_of_guests
    `);
    
    console.log('✅ Successfully added columns to booking table');
    
  } catch (error: any) {
    console.error('❌ Error adding columns:', error.message);
    throw error;
  } finally {
    connection.release();
    await db.end();
  }
}

addBookingColumns()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
