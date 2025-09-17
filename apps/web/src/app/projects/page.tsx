import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import ProjectsClient from './ProjectsClient';
import { authOptions } from '@/lib/auth';

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/signin');
  }
  return <ProjectsClient />;
}
