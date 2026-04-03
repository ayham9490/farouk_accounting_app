import XLSX from 'xlsx';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function seedDatabase() {
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    // Read Excel file
    const workbook = XLSX.readFile('/home/ubuntu/upload/ملف_فاروق_إكسل(1).xlsx');
    
    // Get sheets
    const dailySheet = workbook.Sheets['اليومية'];
    const balanceSheet = workbook.Sheets['الرصيد النهائي'];
    
    // Parse daily transactions
    const dailyData = XLSX.utils.sheet_to_json(dailySheet, { header: 1 });
    
    // Parse balances
    const balanceData = XLSX.utils.sheet_to_json(balanceSheet, { header: 1 });

    // Insert accounts from balance sheet
    const accountsSet = new Set();
    for (let i = 4; i < balanceData.length; i++) {
      const row = balanceData[i];
      if (row[0] && row[0] !== 'الحساب' && row[0].trim() !== '') {
        accountsSet.add(row[0]);
      }
    }

    console.log('Inserting accounts...');
    for (const accountName of accountsSet) {
      const accountType = balanceData.find(r => r[0] === accountName)?.[1] || 'آخر';
      await connection.execute(
        'INSERT INTO accounts (name, accountType) VALUES (?, ?)',
        [accountName, accountType]
      );
    }

    // Insert transactions from daily sheet
    console.log('Inserting transactions...');
    for (let i = 2; i < dailyData.length; i++) {
      const row = dailyData[i];
      if (row[0] && row[0] !== 'الحساب') {
        const [accountName, amount, currency, description, type, dateStr] = row;
        
        // Get account ID
        const [accounts] = await connection.execute(
          'SELECT id FROM accounts WHERE name = ?',
          [accountName]
        );
        
        if (accounts.length > 0) {
          const accountId = accounts[0].id;
          let transactionDate = new Date(dateStr);
          
          // Validate date
          if (isNaN(transactionDate.getTime()) || transactionDate.getFullYear() < 2000) {
            transactionDate = new Date();
          }
          
          await connection.execute(
            'INSERT INTO transactions (accountId, amount, currency, description, type, transactionDate) VALUES (?, ?, ?, ?, ?, ?)',
            [accountId, parseFloat(amount) || 0, currency, description, type, transactionDate.toISOString().slice(0, 19).replace('T', ' ')]
          );
        }
      }
    }

    // Insert account balances
    console.log('Inserting account balances...');
    for (let i = 4; i < balanceData.length; i++) {
      const row = balanceData[i];
      if (row[0] && row[0] !== 'الحساب' && row[0].trim() !== '') {
        const accountName = row[0];
        const balanceSAR = parseFloat(row[2]) || 0;
        const balanceEUR = parseFloat(row[3]) || 0;
        
        const [accounts] = await connection.execute(
          'SELECT id FROM accounts WHERE name = ?',
          [accountName]
        );
        
        if (accounts.length > 0) {
          const accountId = accounts[0].id;
          
          if (balanceSAR !== 0) {
            await connection.execute(
              'INSERT INTO accountBalances (accountId, currency, balance) VALUES (?, ?, ?)',
              [accountId, 'دولار', balanceSAR]
            );
          }
          
          if (balanceEUR !== 0) {
            await connection.execute(
              'INSERT INTO accountBalances (accountId, currency, balance) VALUES (?, ?, ?)',
              [accountId, 'يورو', balanceEUR]
            );
          }
        }
      }
    }

    console.log('✓ Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await connection.end();
  }
}

seedDatabase();
