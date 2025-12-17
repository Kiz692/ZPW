// Quick script to check if SKIP_AUTH is being read
require('dotenv').config();

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SKIP_AUTH:', process.env.SKIP_AUTH);
console.log('SKIP_AUTH type:', typeof process.env.SKIP_AUTH);
console.log('SKIP_AUTH === "true":', process.env.SKIP_AUTH === 'true');
console.log('Will skip auth:', process.env.NODE_ENV === 'development' && (process.env.SKIP_AUTH === 'true' || process.env.SKIP_AUTH === '1'));

