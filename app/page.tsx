'use client';

import { ChatInterface } from '@/components/chat-interface';
import { Sidebar } from '@/components/sidebar';
import { LeftSidebar } from '@/components/left-sidebar';

export default function AvaPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left sidebar - navigation */}
      <LeftSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4">
          <nav className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Home</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500">Spaces</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Easy Metrics Inc.</span>
            <span className="text-gray-300">/</span>
            <span className="text-purple-700 font-medium">Add lens</span>
          </nav>
        </header>

        {/* Chat interface */}
        <main className="flex-1 overflow-hidden">
          <ChatInterface />
        </main>
      </div>

      {/* Right sidebar - context */}
      <Sidebar />
    </div>
  );
}
