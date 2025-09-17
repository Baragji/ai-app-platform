import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Ensure Node.js runtime for compatibility (e.g., bcrypt, stable cookie handling)
export const runtime = 'nodejs';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
