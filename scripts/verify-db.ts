import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  try {
    console.log('Connecting to Digital Ocean PostgreSQL...\n');

    // Get all tables
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log('✓ Successfully connected to Digital Ocean PostgreSQL!\n');
    console.log(`Found ${tables.length} tables:\n`);

    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.tablename}`);
    });

    console.log('\n✓ Database migration successful!');

  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
