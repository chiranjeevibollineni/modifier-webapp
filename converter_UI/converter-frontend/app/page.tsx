// src/app/page.tsx
import React from 'react';
import Link from 'next/link';
import { conversionToolsIndex } from './data/tools';

export default function HomeDashboard() {
  return (
    <main className="min-h-screen bg-slate-50/40 py-20 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-800">
      <div className="max-w-6xl mx-auto">

        {/* Value Proposition Cluster */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
            Every Document Tool, <span className="text-indigo-600">Built to Scale</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Pre-rendered, high-speed static utility engines connecting directly to your active FastAPI pipelines.
          </p>
        </div>

        {/* Dynamic 4-Column Utility Grid Component */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {conversionToolsIndex.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-lg mb-5 border ${tool.accentColor} shadow-sm group-hover:scale-105 transition-transform duration-150`}>
                  {tool.title.charAt(0)}
                </div>
                <h2 className="text-base font-black text-slate-950 mb-1 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {tool.title}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {tool.description}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-50 flex items-center text-[11px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                Open Utility <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
