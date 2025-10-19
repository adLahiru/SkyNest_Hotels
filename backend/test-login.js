const bcrypt = require('bcryptjs');

// Test passwords against the admin hash from database
const adminHashFromDB = '$2b$10$fbhntVcNlpJBmPqDMvq3ouPTvETAuCMZctmTOPBZDRksWn9.ryEU.';
const seededHash = '$2b$10$O7zQvGmYx1oF4E8k6nn3au7f3sQnqQ3o4M7a9e3QpCqF/0H7o1uL2';

const testPasswords = [
    'temppwd',
    '12345678',
    'admin',
    'password',
    'admin123'
];

console.log('Testing Admin Password (mrlahiru):');
console.log('=====================================\n');

testPasswords.forEach(pwd => {
    const matchAdmin = bcrypt.compareSync(pwd, adminHashFromDB);
    console.log(`Password: "${pwd}" -> ${matchAdmin ? '✓ MATCH' : '✗ NO MATCH'}`);
});

console.log('\n\nTesting Seeded Users Password:');
console.log('=====================================\n');

testPasswords.forEach(pwd => {
    const matchSeeded = bcrypt.compareSync(pwd, seededHash);
    console.log(`Password: "${pwd}" -> ${matchSeeded ? '✓ MATCH' : '✗ NO MATCH'}`);
});

console.log('\n\nLogin Credentials for Testing:');
console.log('=====================================');
console.log('Admin: username=mrlahiru, password=?');
console.log('Seeded users: username=mrviran (or others), password=12345678');
