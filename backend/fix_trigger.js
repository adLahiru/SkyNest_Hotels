const mysql = require('mysql2/promise');

async function fixTrigger() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: '35.154.58.37',
            user: 'skynestadmin',
            password: 'M7CjWcxER2wLaKywV8VB',
            database: 'SkyNest_Hotels',
            port: 3306,
            multipleStatements: true
        });
        
        console.log('Connected! Dropping old trigger...');
        await connection.query('DROP TRIGGER IF EXISTS update_payment_after_transaction');
        console.log('✅ Old trigger dropped');
        
        console.log('Creating new trigger without payment_date...');
        const createTriggerSQL = `
CREATE TRIGGER update_payment_after_transaction
AFTER INSERT ON payment_transactions
FOR EACH ROW
BEGIN
    DECLARE v_total_paid DECIMAL(10,2);
    
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_paid
    FROM payment_transactions
    WHERE payment_id = NEW.payment_id;
    
    UPDATE payments
    SET amount_paid = v_total_paid,
        due_amount = total_charges - v_total_paid,
        payment_status = CASE
            WHEN v_total_paid = 0 THEN 'pending'
            WHEN v_total_paid >= total_charges THEN 'paid'
            ELSE 'partial'
        END
    WHERE payment_id = NEW.payment_id;
END`;
        
        await connection.query(createTriggerSQL);
        console.log('✅ New trigger created successfully!');
        console.log('\n🎉 Payment processing should now work correctly!');
        
    } catch (error) {
        console.error('❌ Error fixing trigger:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nDatabase connection closed.');
        }
    }
}

fixTrigger();
