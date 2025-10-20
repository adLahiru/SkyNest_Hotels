const bcrypt = require('bcryptjs');

const seededHash = '$2b$10$O7zQvGmYx1oF4E8k6nn3au7f3sQnqQ3o4M7a9e3QpCqF/0H7o1uL2';
const password = '12345678';

// Test if the hash matches the password
bcrypt.compare(password, seededHash, (err, result) => {
    if (err) {
        console.error('Error comparing:', err);
        return;
    }
    
    console.log(`Password "${password}" matches hash: ${result ? '✓ YES' : '✗ NO'}`);
    
    if (!result) {
        console.log('\n⚠️  The seeded hash does NOT match "12345678"!');
        console.log('Generating a NEW hash for "12345678"...\n');
        
        bcrypt.hash(password, 10, (err, newHash) => {
            if (err) {
                console.error('Error generating hash:', err);
                return;
            }
            
            console.log('New hash for "12345678":');
            console.log(newHash);
            console.log('\nYou need to UPDATE the database with this new hash:');
            console.log(`UPDATE users SET password = '${newHash}' WHERE username LIKE 'mr%' AND username != 'mrlahiru';`);
        });
    }
});
