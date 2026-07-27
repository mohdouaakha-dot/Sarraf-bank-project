import { prisma } from '../src/lib/prisma';

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error('? Please provide an email: npx tsx scripts/make-admin.ts user@example.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log(? Success! User \ is now an ADMIN.);
  } catch (err) {
    console.error('? User not found or update failed.');
  } finally {
    await prisma.\();
  }
}

makeAdmin();
