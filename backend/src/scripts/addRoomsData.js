const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Biragith@2003',
  database: 'SkyNest_Hotels'
};

// Room types data with detailed information
const roomTypes = [
  {
    type: 'Deluxe Room',
    capacity: 2,
    daily_rate: 150.00,
    amenities: JSON.stringify(['King Bed', 'Mini Bar', 'Smart TV', 'Free Wi-Fi', 'Air Conditioning', 'Safe']),
    description: 'Spacious and elegantly furnished room with modern amenities and stunning city views. Perfect for business travelers and couples seeking comfort and style.',
    photo_url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'
  },
  {
    type: 'Executive Suite',
    capacity: 3,
    daily_rate: 250.00,
    amenities: JSON.stringify(['King Bed', 'Sofa Bed', 'Living Area', 'Jacuzzi', 'Mini Bar', 'Smart TV', 'Free Wi-Fi', 'Premium Toiletries', 'Butler Service']),
    description: 'Luxury suite with separate living area, executive privileges and premium amenities. Features a spacious work area and stunning panoramic views.',
    photo_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
  },
  {
    type: 'Family Room',
    capacity: 4,
    daily_rate: 200.00,
    amenities: JSON.stringify(['Two Queen Beds', 'Mini Bar', 'Smart TV', 'Free Wi-Fi', 'Kitchenette', 'Children Play Area', 'Air Conditioning']),
    description: 'Perfect for families with extra space and child-friendly amenities. Features connecting rooms and a comfortable seating area for quality family time.',
    photo_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'
  },
  {
    type: 'Presidential Suite',
    capacity: 4,
    daily_rate: 500.00,
    amenities: JSON.stringify(['California King Bed', 'Private Terrace', 'Jacuzzi', 'Premium Entertainment System', 'Full Kitchen', 'Mini Bar', 'Personal Concierge', 'Chauffeur Service']),
    description: 'The ultimate luxury experience with private terrace, jacuzzi, and personalized service. Spanning 120m², this suite offers unparalleled comfort and elegance.',
    photo_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'
  },
  {
    type: 'Standard Room',
    capacity: 2,
    daily_rate: 100.00,
    amenities: JSON.stringify(['Queen Bed', 'Cable TV', 'Free Wi-Fi', 'Air Conditioning', 'Work Desk', 'Coffee Maker']),
    description: 'Comfortable and affordable room with all essential amenities. Ideal for travelers looking for quality accommodation at great value.',
    photo_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
  },
  {
    type: 'Ocean View Suite',
    capacity: 3,
    daily_rate: 300.00,
    amenities: JSON.stringify(['King Bed', 'Private Balcony', 'Ocean View', 'Smart TV', 'Mini Bar', 'Free Wi-Fi', 'Premium Bath Amenities', 'Beach Access']),
    description: 'Stunning oceanfront room with direct beach access and water sports included. Wake up to breathtaking ocean views and the sound of waves.',
    photo_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
  }
];

// Function to insert room types and rooms
async function addRoomsData() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('Starting to add room types and rooms...\n');
    
    // Clear existing data
    console.log('Clearing existing room data...');
    await connection.execute('DELETE FROM rooms');
    await connection.execute('DELETE FROM room_types');
    console.log('✓ Existing data cleared\n');
    
    // Insert room types
    for (const roomType of roomTypes) {
      // Generate UUID for room_type_id
      const roomTypeId = require('crypto').randomUUID();
      
      await connection.execute(
        'INSERT INTO room_types (room_type_id, type, description, daily_rate, capacity, amenities, photo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          roomTypeId,
          roomType.type, 
          roomType.description, 
          roomType.daily_rate, 
          roomType.capacity, 
          roomType.amenities,
          roomType.photo_url // Storing URL as text in LONGBLOB field
        ]
      );
      console.log(`✓ Added room type: ${roomType.type} ($${roomType.daily_rate}/night)`);
      
      // Get all branches
      const [branches] = await connection.execute('SELECT branch_id, branch_name FROM hotel_branches');
      
      if (branches.length === 0) {
        console.log('⚠ No branches found. Please add branches first.');
        continue;
      }
      
      // Add rooms for each branch
      for (const branch of branches) {
        // Add 3-5 rooms of each type per branch (varies by type)
        const roomCount = roomType.type === 'Presidential Suite' ? 1 : 
                         roomType.type === 'Ocean View Suite' ? 2 :
                         roomType.type === 'Executive Suite' ? 2 : 3;
        
        for (let i = 1; i <= roomCount; i++) {
          const roomNumber = `${roomType.type.substring(0, 3).toUpperCase()}${i}`;
          const floorNumber = Math.floor(Math.random() * 10) + 1; // Random floor 1-10
          const roomStatus = i === roomCount ? 'maintenance' : 'available'; // Last room in maintenance
          
          await connection.execute(
            'INSERT INTO rooms (room_type_id, branch_id, room_no, floor_no, state) VALUES (?, ?, ?, ?, ?)',
            [
              roomTypeId,
              branch.branch_id,
              roomNumber,
              floorNumber,
              roomStatus
            ]
          );
        }
        console.log(`  → Added ${roomCount} ${roomType.type}(s) to ${branch.branch_name}`);
      }
      console.log('');
    }
    
    // Display summary
    const [roomCount] = await connection.execute('SELECT COUNT(*) as total FROM rooms');
    const [typeCount] = await connection.execute('SELECT COUNT(*) as total FROM room_types');
    const [branchCount] = await connection.execute('SELECT COUNT(*) as total FROM hotel_branches');
    
    console.log('═══════════════════════════════════════');
    console.log('✓ DATA INSERTION COMPLETED SUCCESSFULLY');
    console.log('═══════════════════════════════════════');
    console.log(`Total Branches: ${branchCount[0].total}`);
    console.log(`Total Room Types: ${typeCount[0].total}`);
    console.log(`Total Rooms Created: ${roomCount[0].total}`);
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error adding rooms data:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await connection.end();
  }
}

// Run the script
addRoomsData()
  .then(() => console.log('Script execution completed.'))
  .catch(err => console.error('Script failed:', err));