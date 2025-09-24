import bcrypt from 'bcryptjs';
import connection from '../config/db';
import { v7 as uuidv7 } from 'uuid';
import dotenv from 'dotenv';
import e from 'express';

const createAdminUser = async () => {
  let conn: any = null;
  
  try {
    conn = await connection();

    // Admin user details
    const adminDetails = {
        name:"Lahiru Dilshan",
        role:"Admin",
        email:"adlahiru65@gmail.com",
        phone:"0714566635",
        hire_date:"2023-10-01",
        nic_no:"200330111405",
        salary:150000.00,
        username:"admin1",
        password:process.env.ADMIN_PWD || "", // Default password if not set in env
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminDetails.password, 10);

    // Check if admin already exists
    const [existing] = await conn.query(
      'SELECT user_id FROM users WHERE email = ?',
      [adminDetails.email]
    );

    if ((existing as any[]).length > 0) {
      console.log('Admin user already exists!');
      return;
    }

    await conn.query('START TRANSACTION');

    const userID = uuidv7();

    await conn.query(
        'INSERT INTO users (user_id, name, role, email, phone, nic_no, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userID, adminDetails.name, adminDetails.role, adminDetails.email, adminDetails.phone, adminDetails.nic_no, adminDetails.username, hashedPassword]
    );

    const staffID = uuidv7();
    await conn.query(
    'INSERT INTO staff (staff_id, user_id,hire_date,salary) VALUES (?, ?, ?, ?)',
    [
        staffID,
        userID,
        adminDetails.hire_date,
        adminDetails.salary
    ]
    );
    
    await conn.query('COMMIT');

    console.log(`Admin ${adminDetails.name} user created successfully!`);
    console.log('IMPORTANT: Change the default password after first login!');

  } catch (error) {
    if (conn) {
      try {
        await conn.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
    console.error('Error creating admin user:', error);
  } finally {
    if (conn) {
      await conn.end();
    }
  }
};

// Run if called directly
if (require.main === module) {
  createAdminUser();
}

export default createAdminUser;
