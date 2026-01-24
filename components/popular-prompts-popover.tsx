'use client';

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import {
  ChartBarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
} from '@heroicons/react/20/solid';

interface PopularPromptsPopoverProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const PROMPT_CATEGORIES = [
  {
    name: 'Deal Info',
    icon: ChartBarIcon,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    prompts: [
      { label: 'Quick summary of the deal', prompt: 'Give me a quick summary of the ESPN deal status' },
      { label: 'Key numbers and metrics', prompt: 'What are the key numbers for the ESPN deal?' },
      { label: 'Show opportunity details', prompt: 'Show me the ESPN opportunity details' },
      { label: 'Current deal stage', prompt: 'What stage is the ESPN deal in?' },
    ],
  },
  {
    name: 'Contacts',
    icon: UserGroupIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    prompts: [
      { label: 'All contacts with roles', prompt: 'List all contacts at ESPN in a table with their roles and emails' },
      { label: "Sarah Chen's details", prompt: "Show me Sarah Chen's contact details" },
      { label: 'Last email from Jennifer', prompt: 'Show me the last email from Jennifer Walsh' },
      { label: "David Kim's preferences", prompt: "What do I know about David Kim's preferences and concerns?" },
    ],
  },
  {
    name: 'Tasks & Meetings',
    icon: CalendarDaysIcon,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    prompts: [
      { label: 'My tasks for this deal', prompt: 'What tasks do I have for ESPN?' },
      { label: 'Upcoming meetings', prompt: 'What meetings do I have coming up?' },
      { label: 'Create a follow-up task', prompt: 'I need to create a follow-up task for Sarah Chen' },
      { label: 'Add a new task', prompt: 'I want to add a new task' },
    ],
  },
  {
    name: 'Documents',
    icon: DocumentTextIcon,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    prompts: [
      { label: 'Deal documents', prompt: 'What documents do we have for the ESPN deal?' },
      { label: 'Summary with contacts', prompt: 'Show me the deal summary with contacts below it' },
      { label: 'Key metrics side by side', prompt: 'Show me all the key metrics side by side' },
    ],
  },
];

export function PopularPromptsPopover({ onSelectPrompt, disabled = false }: PopularPromptsPopoverProps) {
  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <PopoverButton
            disabled={disabled}
            className={`flex-shrink-0 p-2.5 rounded-lg transition-all duration-200 ${
              open
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Popular prompts"
          >
            <LightBulbIcon className="w-5 h-5" />
          </PopoverButton>

          <PopoverPanel
            anchor="top start"
            className="z-50 [--anchor-gap:12px]"
          >
            <div className="w-[540px] bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <LightBulbIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Quick Prompts</h3>
                    <p className="text-xs text-gray-500">Click any prompt to ask Ava</p>
                  </div>
                </div>
              </div>

              {/* Categories Grid */}
              <div className="p-4 grid grid-cols-2 gap-4">
                {PROMPT_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.name} className="space-y-2">
                      {/* Category Header */}
                      <div className="flex items-center gap-2 px-1">
                        <div className={`p-1 rounded ${category.bgColor}`}>
                          <Icon className={`w-3.5 h-3.5 ${category.color}`} />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          {category.name}
                        </span>
                      </div>

                      {/* Prompts */}
                      <div className="space-y-1">
                        {category.prompts.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => {
                              onSelectPrompt(item.prompt);
                              close();
                            }}
                            disabled={disabled}
                            className="w-full text-left px-3 py-2 text-[13px] text-gray-700 rounded-lg
                                     hover:bg-gray-100 hover:text-gray-900
                                     active:bg-gray-200
                                     transition-colors duration-100
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer hint */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                  Or type your own question in the input below
                </p>
              </div>
            </div>
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}
