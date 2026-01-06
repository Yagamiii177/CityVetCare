import { query } from './config/database.js';

console.log('🔧 Fixing Database Issues...\n');

async function fixDatabase() {
  try {
    // 1. Add incident_type column
    console.log('1. Adding incident_type column...');
    try {
      await query(`
        ALTER TABLE incidents 
        ADD COLUMN incident_type ENUM('bite', 'stray', 'abuse', 'health', 'other') DEFAULT 'other'
        AFTER priority
      `);
      console.log('✅ incident_type column added');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('   Column already exists, skipping');
      } else {
        throw err;
      }
    }

    // 2. Check current status enum
    console.log('\n2. Checking status enum values...');
    const statusInfo = await query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'incidents' 
        AND COLUMN_NAME = 'status'
    `, [process.env.DB_NAME || 'cityvetcare_db']);
    
    const currentStatus = statusInfo[0].COLUMN_TYPE;
    console.log('   Current status values:', currentStatus);
    
    // 3. Update status enum to use consistent naming
    console.log('\n3. Updating status enum...');
    try {
      await query(`
        ALTER TABLE incidents 
        MODIFY COLUMN status ENUM(
          'pending',
          'PENDING_VERIFICATION',
          'verified',
          'in_progress',
          'resolved',
          'rejected',
          'cancelled'
        ) DEFAULT 'pending'
      `);
      console.log('✅ Status enum updated with PENDING_VERIFICATION');
    } catch (err) {
      console.error('   Error updating status:', err.message);
    }

    // 4. Add verified_by column
    console.log('\n4. Adding verified_by column...');
    try {
      await query(`
        ALTER TABLE incidents 
        ADD COLUMN verified_by INT NULL
        AFTER status
      `);
      console.log('✅ verified_by column added');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('   Column already exists, skipping');
      } else {
        throw err;
      }
    }

    // 5. Add verified_at column
    console.log('\n5. Adding verified_at column...');
    try {
      await query(`
        ALTER TABLE incidents 
        ADD COLUMN verified_at TIMESTAMP NULL
        AFTER verified_by
      `);
      console.log('✅ verified_at column added');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('   Column already exists, skipping');
      } else {
        throw err;
      }
    }

    // 6. Add foreign key for verified_by
    console.log('\n6. Adding foreign key for verified_by...');
    try {
      await query(`
        ALTER TABLE incidents 
        ADD CONSTRAINT fk_incidents_verified_by 
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
      `);
      console.log('✅ Foreign key added');
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        console.log('   Foreign key already exists, skipping');
      } else {
        console.warn('   Warning:', err.message);
      }
    }

    // 7. Verify the changes
    console.log('\n7. Verifying changes...');
    const columns = await query('DESCRIBE incidents');
    
    console.log('\n📋 Current incidents table structure:');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}${col.Null === 'YES' ? ' (nullable)' : ''}`);
    });

    console.log('\n✅ Database fixes completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error fixing database:', error.message);
    process.exit(1);
  }
}

fixDatabase();
