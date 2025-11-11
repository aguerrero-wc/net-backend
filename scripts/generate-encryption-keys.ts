import * as crypto from 'crypto';

console.log('=== Encryption Keys Generator ===\n');
console.log('Add these to your .env file:\n');
console.log(`ENCRYPTION_KEY=${crypto.randomBytes(32).toString('hex')}`);
console.log(`ENCRYPTION_IV=${crypto.randomBytes(16).toString('hex')}`);
console.log('\n⚠️  Keep these keys secret and never commit them to git!');