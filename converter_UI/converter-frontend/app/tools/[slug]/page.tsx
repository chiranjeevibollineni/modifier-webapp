import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { conversionToolsIndex } from '../../data/tools';
import WorkspaceClient from './WorkspaceClient';

interface ServerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return conversionToolsIndex.map((tool) => ({
    slug: tool.slug,
  }));
}

// 1. Core Page Entry Shell (Keeps the Shell Prefetch Instant)
export default function ToolWorkspacePage({ params }: ServerPageProps) {
  return (
    <main className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-xs text-slate-400 font-bold">Loading tool context...</div>}>
        <ToolLoader params={params} />
      </Suspense>
    </main>
  );
}

// 2. Child Leaf Component that Awaits Parameters Inside the Suspense Sandbox
async function ToolLoader({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = conversionToolsIndex.find((t) => t.slug === slug);

  if (!tool) {
    notFound();
  }

  return <WorkspaceClient toolTitle={tool.title} apiRoute={tool.apiRoute} />;
}
