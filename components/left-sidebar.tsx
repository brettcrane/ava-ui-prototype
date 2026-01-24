'use client';

import {
  HomeIcon,
  ArchiveBoxIcon,
  BookOpenIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    icon: <HomeIcon className="w-5 h-5" />,
    active: true,
  },
  {
    label: 'Spaces',
    icon: <ArchiveBoxIcon className="w-5 h-5" />,
  },
  {
    label: 'Training',
    icon: <BookOpenIcon className="w-5 h-5" />,
  },
  {
    label: 'Users',
    icon: <UsersIcon className="w-5 h-5" />,
  },
];

interface Account {
  name: string;
  company: string;
  active?: boolean;
}

const recentSpaces: Account[] = [
  { name: 'Scrapehype', company: 'Sales', active: false },
  { name: 'D Hover Inc.', company: 'Support', active: false },
  { name: 'Easy Metrics Inc.', company: 'Sales', active: true },
  { name: 'ABP Inc.', company: 'Sales', active: false },
  { name: 'Robou.ai', company: 'Sales', active: false },
  { name: 'Neo4j Inc.', company: 'Support', active: false },
  { name: 'Integrated Research', company: 'Sales', active: false },
];

export function LeftSidebar() {
  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="font-semibold text-gray-900">Ava</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              item.active
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Recent Spaces */}
      <div className="flex-1 overflow-y-auto border-t border-gray-200 mt-2">
        <div className="p-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Recent Spaces
          </h3>
          <div className="space-y-1">
            {recentSpaces.map((space) => (
              <button
                key={space.name}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors ${
                  space.active
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  space.active ? 'bg-purple-500' : 'bg-gray-300'
                }`} />
                <span className="truncate">{space.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
            BC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Brett Crane</p>
            <p className="text-xs text-gray-500 truncate">Sales Rep</p>
          </div>
        </div>
      </div>
    </div>
  );
}
