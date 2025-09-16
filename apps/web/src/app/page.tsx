import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to AI App Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A production-ready modular monolith built with Next.js 14
        </p>

        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Link
            href="/projects"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            View Projects
          </Link>
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Sign In
          </Link>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Authentication
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              NextAuth with email/password and provider-ready setup
            </p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Database</h3>
            <p className="mt-2 text-sm text-gray-500">
              PostgreSQL with Prisma ORM for type-safe database operations
            </p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Job Queue</h3>
            <p className="mt-2 text-sm text-gray-500">
              BullMQ with Redis for reliable background job processing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
