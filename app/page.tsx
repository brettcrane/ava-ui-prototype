'use client';

import { JSONUIProvider } from '@json-render/react';
import { ChatInterface } from '@/components/chat-interface';
import { Sidebar } from '@/components/sidebar';
import { LeftSidebar } from '@/components/left-sidebar';
import { componentRegistry } from '@/components/ava-components';

// Action handlers for json-render
const actionHandlers = {
  create_task: async (params: Record<string, unknown>) => {
    const response = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_task', params }),
    });
    return response.json();
  },
  complete_task: async (params: Record<string, unknown>) => {
    const response = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete_task', params }),
    });
    return response.json();
  },
  update_task_status: async (params: Record<string, unknown>) => {
    const response = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_task_status', params }),
    });
    return response.json();
  },
  delete_task: async (params: Record<string, unknown>) => {
    const response = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_task', params }),
    });
    return response.json();
  },
  create_contact: async (params: Record<string, unknown>) => {
    const response = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_contact', params }),
    });
    return response.json();
  },
  delete_contact: async (params: Record<string, unknown>) => {
    const response = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_contact', params }),
    });
    return response.json();
  },
  update_opportunity_stage: async (params: Record<string, unknown>) => {
    const response = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_opportunity_stage', params }),
    });
    return response.json();
  },
  update_close_date: async (params: Record<string, unknown>) => {
    const response = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_close_date', params }),
    });
    return response.json();
  },
  save_memory: async (params: Record<string, unknown>) => {
    const response = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_memory', params }),
    });
    return response.json();
  },
  draft_email: async (params: Record<string, unknown>) => {
    const response = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'draft_email', params }),
    });
    return response.json();
  },
  schedule_meeting: async (params: Record<string, unknown>) => {
    const response = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'schedule_meeting', params }),
    });
    return response.json();
  },
};

export default function AvaPage() {
  return (
    <JSONUIProvider
      registry={componentRegistry}
      actionHandlers={actionHandlers}
    >
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
    </JSONUIProvider>
  );
}
