import bcrypt from 'bcryptjs';
import connection from '../config/db';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v7: uuidv7 } = require('uuid');

const createManagers = async () => {
  let conn: any = null;
  
  try {
    conn = await connection();

    // Get all branches
    const [branches] = await conn.query('SELECT branch_id, branch_name FROM hotel_branches');
    
    if ((branches as any[]).length === 0) {
      console.log('No branches found! Please create branches first.');
      return;
    }

    console.log(`Found ${(branches as any[]).length} branches`);

    // Manager names for variety
    const managerNames = [
      { name: 'Sarah Johnson', email: 'sarah.j', phone: '0771234567', nic: '199012345678' },
      { name: 'Michael Chen', email: 'michael.c', phone: '0772345678', nic: '198523456789' },
      { name: 'Emily Davis', email: 'emily.d', phone: '0773456789', nic: '199234567890' },
      { name: 'James Wilson', email: 'james.w', phone: '0774567890', nic: '198745678901' },
      { name: 'Priya Sharma', email: 'priya.s', phone: '0775678901', nic: '199456789012' }
    ];

    const defaultPassword = 'Manager@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await conn.query('START TRANSACTION');

    let totalCreated = 0;
    let branchIndex = 0;

    for (const branch of branches as any[]) {
      console.log(`\nCreating managers for branch: ${branch.branch_name}`);

      for (let i = 0; i < 5; i++) {
        const manager = managerNames[i];
        if (!manager) continue;
        
        const userId = uuidv7();
        const username = `${manager.email.toLowerCase().replace(/\s+/g, '')}_${branch.branch_name.toLowerCase().replace(/\s+/g, '_')}_${i + 1}`;
        const email = `${manager.email.toLowerCase().replace(/\s+/g, '.')}@${branch.branch_name.toLowerCase().replace(/\s+/g, '')}.com`;
        // Generate unique NIC for each manager across all branches
        const uniqueNic = `${manager.nic}${branchIndex}${i}`;

        try {
          // Check if user already exists
          const [existing] = await conn.query(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
          );

          if ((existing as any[]).length > 0) {
            console.log(`  - ${manager.name} already exists for ${branch.branch_name}`);
            continue;
          }

          // Insert into users table
          await conn.query(
            'INSERT INTO users (user_id, name, email, phone, nic_no, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, manager.name, email, manager.phone, uniqueNic, username, hashedPassword]
          );

          // Insert into staff table
          await conn.query(
            'INSERT INTO staff (staff_id, branch_id, role, hire_date, salary) VALUES (?, ?, ?, ?, ?)',
            [
              userId,
              branch.branch_id,
              'MANAGER',
              new Date().toISOString().split('T')[0],
              80000.00
            ]
          );

          console.log(`  ✓ Created manager: ${manager.name} (${username})`);
          totalCreated++;
        } catch (error) {
          console.error(`  ✗ Error creating ${manager.name}:`, error);
        }
      }
      branchIndex++;
    }

    await conn.query('COMMIT');

    console.log(`\n✅ Successfully created ${totalCreated} managers!`);
    console.log(`\nDefault credentials:`);
    console.log(`  Password: ${defaultPassword}`);
    console.log(`\nIMPORTANT: Change passwords after first login!`);

  } catch (error) {
    if (conn) {
      try {
        await conn.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
    console.error('Error creating managers:', error);
  } finally {
    if (conn) {
      await conn.end();
    }
  }
};

// Run if called directly
if (require.main === module) {
  createManagers();
}

export default createManagers;
