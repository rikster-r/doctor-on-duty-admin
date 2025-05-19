import postgres from 'postgres';

const conn = postgres(process.env.DATABASE_URL!, { ssl: 'verify-full' });

export default conn;
