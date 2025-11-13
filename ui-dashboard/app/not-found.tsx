"use client";

import { House, Warning } from '@phosphor-icons/react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-gp-bg-app min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <Warning size={64} weight="thin" className="text-red-500" />
      
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-600 text-center max-w-md">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>

      <Link 
        href="/dashboard"
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
      >
        <House size={20} weight="regular" />
        Back to Dashboard
      </Link>
    </div>
  );
}
