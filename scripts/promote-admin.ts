import prisma from '../src/prisma.ts';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node --experimental-strip-types scripts/promote-admin.ts <email>');
  process.exit(1);
}

const user = await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
console.log(`${user.email} is now ADMIN`);
process.exit(0);
