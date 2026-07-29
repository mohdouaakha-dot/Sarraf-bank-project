import prisma from './src/prisma.ts';

async function makeAdmin() {
  const email = 'moh.douaakha@gmail.com';
  const updated = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }
  });
  console.log('✅ Successfully updated user role to ADMIN:', updated.email, 'Role:', updated.role);
  process.exit(0);
}

makeAdmin().catch(err => {
  console.error('❌ Failed to update user:', err.message);
  process.exit(1);
});
