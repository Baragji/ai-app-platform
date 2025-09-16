// Simple database stub for build
export interface User {
  id: string;
  email: string;
  name?: string | null;
  password?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

class SimpleDB {
  user = {
    findUnique: async (args?: any): Promise<User | null> => null,
    create: async (args?: any): Promise<User> => ({}) as User,
    findMany: async (args?: any): Promise<User[]> => [],
    update: async (args?: any): Promise<User> => ({}) as User,
    delete: async (args?: any): Promise<User> => ({}) as User,
  };

  project = {
    findUnique: async (args?: any): Promise<Project | null> => null,
    findFirst: async (args?: any): Promise<Project | null> => null,
    create: async (args?: any): Promise<Project> => ({}) as Project,
    findMany: async (args?: any): Promise<Project[]> => [],
    updateMany: async (args?: any): Promise<{ count: number }> => ({
      count: 0,
    }),
    deleteMany: async (args?: any): Promise<{ count: number }> => ({
      count: 0,
    }),
  };

  async $queryRaw(query?: any): Promise<any[]> {
    return [];
  }

  async $disconnect(): Promise<void> {
    // no-op
  }
}

export const prisma = new SimpleDB();
