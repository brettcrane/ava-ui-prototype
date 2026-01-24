'use client';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    active: true,
  },
  {
    label: 'Spaces',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: 'Training',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: 'Users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
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
