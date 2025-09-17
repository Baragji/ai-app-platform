const { compare, hash } = require('bcryptjs');

async function testPassword() {
  const plainPassword = 'demo123';
  const storedHash =
    '$2a$12$Cg9avIFLYqhSdB4LnuAdg.WCkSK6pLVNfcgkAEJ7vlXgq2ecPcs0a';

  console.log('Testing password verification...');
  console.log('Plain password:', plainPassword);
  console.log('Stored hash:', storedHash);

  try {
    const isValid = await compare(plainPassword, storedHash);
    console.log('Password valid:', isValid);

    // Also test creating a new hash to compare
    const newHash = await hash(plainPassword, 12);
    console.log('New hash:', newHash);

    const isNewValid = await compare(plainPassword, newHash);
    console.log('New hash valid:', isNewValid);
  } catch (error) {
    console.error('Error:', error);
  }
}

testPassword();
