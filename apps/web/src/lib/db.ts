// In-memory database for development and E2E tests
// Provides a Prisma-like API surface used by the app
import { hashSync } from 'bcryptjs';

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

// Simple ID generator
const genId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

// Seed demo user and project
const now = new Date();
const demoUser: User = {
  id: 'demo-user',
  email: 'demo@example.com',
  name: 'Demo User',
  password: hashSync('demo123', 10),
  emailVerified: now,
  image: null,
  createdAt: now,
  updatedAt: now,
};

let users: User[] = [demoUser];
let projects: Project[] = [
  {
    id: genId(),
    name: 'Demo Project',
    description: 'A sample project to demonstrate features',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    userId: demoUser.id,
  },
];

class SimpleDB {
  user = {
    findUnique: async (args?: any): Promise<User | null> => {
      if (!args?.where) return null;
      if (args.where.email)
        return users.find((u) => u.email === args.where.email) || null;
      if (args.where.id)
        return users.find((u) => u.id === args.where.id) || null;
      return null;
    },
    create: async (args?: any): Promise<User> => {
      const data = args?.data || {};
      const user: User = {
        id: genId(),
        email: data.email,
        name: data.name ?? null,
        password: data.password ?? null,
        emailVerified: data.emailVerified ?? null,
        image: data.image ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(user);
      return user;
    },
    findMany: async (): Promise<User[]> => users.slice(),
    update: async (args?: any): Promise<User> => {
      const { where, data } = args || {};
      const idx = users.findIndex((u) => u.id === where?.id);
      if (idx === -1) throw new Error('User not found');
      users[idx] = { ...users[idx], ...data, updatedAt: new Date() };
      return users[idx];
    },
    delete: async (args?: any): Promise<User> => {
      const { where } = args || {};
      const idx = users.findIndex((u) => u.id === where?.id);
      if (idx === -1) throw new Error('User not found');
      const [deleted] = users.splice(idx, 1);
      return deleted;
    },
  };

  project = {
    findUnique: async (args?: any): Promise<Project | null> => {
      if (!args?.where?.id) return null;
      return projects.find((p) => p.id === args.where.id) || null;
    },
    findFirst: async (args?: any): Promise<Project | null> => {
      const where = args?.where || {};
      return (
        projects.find(
          (p) =>
            (!where.id || p.id === where.id) &&
            (!where.userId || p.userId === where.userId)
        ) || null
      );
    },
    create: async (args?: any): Promise<Project> => {
      const data = args?.data || {};
      const project: Project = {
        id: genId(),
        name: data.name,
        description: data.description ?? null,
        status: data.status ?? 'active',
        userId: data.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      projects.unshift(project);
      return project;
    },
    findMany: async (args?: any): Promise<Project[]> => {
      const where = args?.where || {};
      let list = projects.slice();
      if (where.userId) list = list.filter((p) => p.userId === where.userId);
      if (args?.orderBy?.createdAt === 'desc')
        list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      if (args?.orderBy?.createdAt === 'asc')
        list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      return list;
    },
    updateMany: async (args?: any): Promise<{ count: number }> => {
      const { where, data } = args || {};
      let count = 0;
      projects = projects.map((p) => {
        if (
          p.id === where?.id &&
          (!where.userId || p.userId === where.userId)
        ) {
          count += 1;
          return { ...p, ...data, updatedAt: new Date() } as Project;
        }
        return p;
      });
      return { count };
    },
    deleteMany: async (args?: any): Promise<{ count: number }> => {
      const { where } = args || {};
      const before = projects.length;
      projects = projects.filter(
        (p) =>
          !(p.id === where?.id && (!where.userId || p.userId === where.userId))
      );
      return { count: before - projects.length };
    },
  };

  async $queryRaw(): Promise<any[]> {
    return [];
  }

  async $disconnect(): Promise<void> {
    // no-op
  }
}

export const prisma = new SimpleDB();
