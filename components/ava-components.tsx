'use client';

import type { ComponentType } from 'react';
import { useState } from 'react';
import type { ComponentRenderProps } from '@json-render/react';
import { useActions } from '@json-render/react';
import type { Action } from '@json-render/core';
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react';
import {
  ChevronDownIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  CogIcon,
  BriefcaseIcon,
  ScaleIcon,
  CheckBadgeIcon,
  LightBulbIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  DocumentIcon,
  TableCellsIcon,
  PresentationChartBarIcon,
  FolderIcon,
} from '@heroicons/react/20/solid';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Helper to format values
function formatValue(value: string | number, format?: string): string {
  if (typeof value === 'number') {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
      case 'percent':
        return `${value}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  }
  return String(value);
}

// InfoCard Component - with subtle gradient and icon
export function InfoCard({ element }: ComponentRenderProps) {
  const { title, content, variant = 'default' } = element.props as {
    title: string;
    content: string;
    variant?: 'default' | 'success' | 'warning' | 'error';
  };

  const styles = {
    default: { bg: 'bg-gradient-to-br from-purple-50 to-white', border: 'border-purple-200', accent: 'text-purple-700' },
    success: { bg: 'bg-gradient-to-br from-emerald-50 to-white', border: 'border-emerald-200', accent: 'text-emerald-700' },
    warning: { bg: 'bg-gradient-to-br from-amber-50 to-white', border: 'border-amber-200', accent: 'text-amber-700' },
    error: { bg: 'bg-gradient-to-br from-red-50 to-white', border: 'border-red-200', accent: 'text-red-700' },
  };

  const s = styles[variant];

  return (
    <div className={`${s.bg} rounded-xl border ${s.border} p-4 shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <h4 className={`text-sm font-semibold ${s.accent} mb-1.5`}>{title}</h4>
      <p className="text-gray-600 text-[13px] leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

// DataTable Component - with hover rows and sticky header
export function DataTable({ element }: ComponentRenderProps) {
  const { columns, rows, emptyMessage = 'No data available' } = element.props as {
    columns: Array<{ key: string; label: string }>;
    rows: Array<Record<string, unknown>>;
    emptyMessage?: string;
  };

  if (!rows || rows.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-2">
          <DocumentTextIcon className="w-8 h-8 mx-auto" />
        </div>
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap ${idx === 0 ? 'rounded-tl-xl' : ''} ${idx === columns.length - 1 ? 'rounded-tr-xl' : ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-purple-50/50 transition-colors duration-150 cursor-default group"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap group-hover:text-gray-900 transition-colors"
                  >
                    {String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// MetricCard Component - with animated value and trend indicator
export function MetricCard({ element }: ComponentRenderProps) {
  const { label, value, format, trend, change } = element.props as {
    label: string;
    value: string | number;
    format?: 'currency' | 'number' | 'percent';
    trend?: 'up' | 'down' | 'neutral';
    change?: string;
  };

  const trendStyles = {
    up: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '↑' },
    down: { bg: 'bg-red-100', text: 'text-red-700', icon: '↓' },
    neutral: { bg: 'bg-gray-100', text: 'text-gray-600', icon: '→' },
  };

  const t = trend ? trendStyles[trend] : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 group">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
          {formatValue(value, format)}
        </span>
        {t && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${t.bg} ${t.text}`}>
            <span>{t.icon}</span>
            {change || ''}
          </span>
        )}
      </div>
    </div>
  );
}

// ContactCard Component - with hover effects and quick actions
export function ContactCard({ element }: ComponentRenderProps) {
  const { name, title, email, phone, isPrimary } = element.props as {
    name: string;
    title?: string;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all duration-200 group">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm">
          {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
              {name}
            </h4>
            {isPrimary && (
              <StarIconSolid className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
          </div>
          {title && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{title}</p>
          )}
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="mt-3 flex gap-2">
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-purple-700 rounded-lg text-xs font-medium transition-colors"
          >
            <EnvelopeIcon className="w-3.5 h-3.5" />
            Email
          </a>
        )}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-purple-700 rounded-lg text-xs font-medium transition-colors"
          >
            <PhoneIcon className="w-3.5 h-3.5" />
            Call
          </a>
        )}
      </div>
    </div>
  );
}

// OpportunityCard Component - with progress bar and stage visualization
export function OpportunityCard({ element }: ComponentRenderProps) {
  const { name, amount, stage, closeDate, probability } = element.props as {
    name: string;
    amount: number;
    stage: string;
    closeDate: string;
    probability?: number;
  };

  const stages = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won'];
  const stageIndex = stages.indexOf(stage);
  const progressPercent = ((stageIndex + 1) / stages.length) * 100;

  const stageColors: Record<string, { bg: string; text: string; ring: string }> = {
    discovery: { bg: 'bg-blue-500', text: 'text-blue-700', ring: 'ring-blue-200' },
    qualification: { bg: 'bg-cyan-500', text: 'text-cyan-700', ring: 'ring-cyan-200' },
    proposal: { bg: 'bg-amber-500', text: 'text-amber-700', ring: 'ring-amber-200' },
    negotiation: { bg: 'bg-orange-500', text: 'text-orange-700', ring: 'ring-orange-200' },
    closed_won: { bg: 'bg-emerald-500', text: 'text-emerald-700', ring: 'ring-emerald-200' },
    closed_lost: { bg: 'bg-red-500', text: 'text-red-700', ring: 'ring-red-200' },
  };

  const sc = stageColors[stage] || stageColors.discovery;

  const formattedDate = new Date(closeDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className={`h-full ${sc.bg} transition-all duration-500`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h4 className="text-sm font-semibold text-gray-900">{name}</h4>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ring-2 ${sc.ring} ${sc.text} bg-white`}>
            {stage.replace('_', ' ')}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <div className="min-w-[100px]">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Value</p>
            <p className="text-lg font-bold text-gray-900">{formatValue(amount, 'currency')}</p>
          </div>
          <div className="min-w-[80px]">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Close</p>
            <p className="text-sm font-semibold text-gray-700">{formattedDate}</p>
          </div>
          {probability !== undefined && (
            <div className="min-w-[120px] flex-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Probability</p>
              <div className="flex items-center gap-1">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${probability}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700">{probability}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// EmailPreview Component - with Disclosure for expandable content
export function EmailPreview({ element }: ComponentRenderProps) {
  const { subject, from, to, body, date, direction } = element.props as {
    subject: string;
    from?: string;
    to?: string;
    body: string;
    date?: string;
    direction?: 'inbound' | 'outbound';
  };

  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }) : '';

  const isLongBody = body.length > 150;

  return (
    <Disclosure as="div" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {({ open }) => (
        <>
          <DisclosureButton className="w-full p-4 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  direction === 'inbound' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <EnvelopeIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{subject}</h4>
                  <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      direction === 'inbound' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {direction === 'inbound' ? 'Received' : 'Sent'}
                    </span>
                    {from && <span className="truncate">from {from}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {formattedDate && <span className="text-xs text-gray-400">{formattedDate}</span>}
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </DisclosureButton>

          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <DisclosurePanel className="px-4 pb-4">
              <div className="pt-3 border-t border-gray-100">
                {to && <p className="text-xs text-gray-500 mb-2">To: {to}</p>}
                <div className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3">
                  {body}
                </div>
              </div>
            </DisclosurePanel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}

// TaskItem Component - with checkbox animation
export function TaskItem({ element, onAction }: ComponentRenderProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { id, title, description, status, dueDate } = element.props as {
    id: number;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'done';
    dueDate?: string;
  };

  const statusStyles = {
    todo: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'To Do' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
    done: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Done' },
  };

  const s = statusStyles[status];

  const formattedDate = dueDate ? new Date(dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) : '';

  const handleComplete = () => {
    if (status !== 'done' && onAction) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
      onAction({ name: 'complete_task', params: { taskId: id } } as Action);
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 ${status === 'done' ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={handleComplete}
          disabled={status === 'done'}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            status === 'done'
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50'
          } ${isAnimating ? 'scale-125' : ''}`}
        >
          {status === 'done' && <CheckCircleIcon className="w-3 h-3" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-medium transition-all ${status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {title}
            </h4>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${s.bg} ${s.text}`}>
              {s.label}
            </span>
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>
          )}
          {formattedDate && (
            <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              Due {formattedDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// MeetingCard Component - with timeline-style design
export function MeetingCard({ element }: ComponentRenderProps) {
  const { title, date, time, attendees, meetingType } = element.props as {
    title: string;
    date: string;
    time?: string;
    attendees?: string[];
    meetingType?: string;
  };

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const typeStyles: Record<string, { bg: string; text: string; Icon: ComponentType<{ className?: string }> }> = {
    discovery: { bg: 'bg-blue-100', text: 'text-blue-700', Icon: MagnifyingGlassIcon },
    technical: { bg: 'bg-purple-100', text: 'text-purple-700', Icon: CogIcon },
    executive: { bg: 'bg-amber-100', text: 'text-amber-700', Icon: BriefcaseIcon },
    negotiation: { bg: 'bg-orange-100', text: 'text-orange-700', Icon: ScaleIcon },
    closing: { bg: 'bg-emerald-100', text: 'text-emerald-700', Icon: CheckBadgeIcon },
  };

  const ts = meetingType ? typeStyles[meetingType] : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 group">
      <div className="flex">
        {/* Date column */}
        <div className="w-16 bg-gradient-to-b from-purple-600 to-purple-700 text-white flex flex-col items-center justify-center py-3">
          <span className="text-2xl font-bold">{new Date(date).getDate()}</span>
          <span className="text-[10px] uppercase tracking-wide opacity-80">
            {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
              {title}
            </h4>
            {ts && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${ts.bg} ${ts.text}`}>
                <ts.Icon className="w-3 h-3" />
                {meetingType}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {formattedDate}
            {time && ` at ${time}`}
          </p>
          {attendees && attendees.length > 0 && (
            <div className="mt-2 flex items-center gap-1">
              <div className="flex -space-x-1.5">
                {attendees.slice(0, 3).map((a, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white text-[8px] font-bold text-gray-600 flex items-center justify-center"
                    title={a}
                  >
                    {a.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                ))}
              </div>
              <span className="text-[11px] text-gray-500 ml-1">
                {attendees.length > 3 ? `+${attendees.length - 3} more` : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// FileCard Component - with expandable summary using Disclosure
export function FileCard({ element }: ComponentRenderProps) {
  const { name, fileType, description, summary } = element.props as {
    name: string;
    fileType: string;
    description?: string;
    summary?: string;
  };

  const typeIcons: Record<string, { Icon: ComponentType<{ className?: string }>; bg: string; text: string }> = {
    pdf: { Icon: DocumentIcon, bg: 'bg-red-100', text: 'text-red-600' },
    docx: { Icon: DocumentTextIcon, bg: 'bg-blue-100', text: 'text-blue-600' },
    xlsx: { Icon: TableCellsIcon, bg: 'bg-emerald-100', text: 'text-emerald-600' },
    pptx: { Icon: PresentationChartBarIcon, bg: 'bg-orange-100', text: 'text-orange-600' },
  };

  const ti = typeIcons[fileType] || { Icon: FolderIcon, bg: 'bg-gray-100', text: 'text-gray-600' };

  if (!summary) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 group">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg ${ti.bg} ${ti.text} flex items-center justify-center flex-shrink-0`}>
            <ti.Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
              {name}
            </h4>
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Disclosure as="div" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {({ open }) => (
        <>
          <DisclosureButton className="w-full p-4 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-lg ${ti.bg} ${ti.text} flex items-center justify-center flex-shrink-0`}>
                  <ti.Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{name}</h4>
                  {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
                </div>
              </div>
              <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
            </div>
          </DisclosureButton>

          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <DisclosurePanel className="px-4 pb-4">
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[13px] text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">
                  {summary}
                </p>
              </div>
            </DisclosurePanel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}

// MemoryCard Component - with category-specific styling
export function MemoryCard({ element }: ComponentRenderProps) {
  const { category, content, contact, confidence } = element.props as {
    category: string;
    content: string;
    contact?: string;
    confidence?: number;
  };

  const categoryStyles: Record<string, { bg: string; text: string; border: string; Icon: ComponentType<{ className?: string }> }> = {
    preference: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', Icon: LightBulbIcon },
    relationship: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', Icon: UserGroupIcon },
    technical_need: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', Icon: WrenchScrewdriverIcon },
    objection: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', Icon: ExclamationTriangleIcon },
    decision_process: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', Icon: FlagIcon },
  };

  const categoryLabels: Record<string, string> = {
    preference: 'Preference',
    relationship: 'Relationship',
    technical_need: 'Technical Need',
    objection: 'Objection',
    decision_process: 'Decision Process',
  };

  const cs = categoryStyles[category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', Icon: DocumentTextIcon };

  return (
    <div className={`${cs.bg} rounded-xl border ${cs.border} p-4 shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg bg-white/60 ${cs.text} flex items-center justify-center flex-shrink-0`}>
          <cs.Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wide ${cs.text}`}>
              {categoryLabels[category] || category}
            </span>
            {contact && (
              <span className="text-[11px] text-gray-500">• {contact}</span>
            )}
          </div>
          <p className="text-[13px] text-gray-700 leading-relaxed">{content}</p>
          {confidence !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-white/50 rounded-full overflow-hidden max-w-[100px]">
                <div
                  className={`h-full ${cs.text.replace('text-', 'bg-')} rounded-full`}
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500">{Math.round(confidence * 100)}% confident</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ActionButton Component - with better hover states
export function ActionButton({ element, onAction }: ComponentRenderProps) {
  const { loadingActions } = useActions();
  const { label, action, variant = 'primary', disabled, size = 'md' } = element.props as {
    label: string;
    action: Action;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
  };

  const isLoading = action?.name ? loadingActions.has(action.name) : false;

  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-sm hover:shadow-md',
    outline: 'bg-white text-purple-700 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };

  return (
    <button
      onClick={() => onAction?.(action)}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200
        ${variantClasses[variant]} ${sizeClasses[size]}
        ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
      `}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        label
      )}
    </button>
  );
}

// Stack Component
export function Stack({ element, children }: ComponentRenderProps) {
  const { direction = 'vertical', gap = 'md', align = 'stretch' } = element.props as {
    direction?: 'vertical' | 'horizontal';
    gap?: 'none' | 'sm' | 'md' | 'lg';
    align?: 'start' | 'center' | 'end' | 'stretch';
  };

  const gapClasses = { none: 'gap-0', sm: 'gap-2', md: 'gap-3', lg: 'gap-4' };
  const alignClasses = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch' };

  return (
    <div className={`flex ${direction === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'} ${gapClasses[gap]} ${alignClasses[align]}`}>
      {children}
    </div>
  );
}

// Grid Component — uses auto-fit with minmax so columns adapt to actual
// container width rather than viewport breakpoints (which don't work well
// inside a chat message column).
export function Grid({ element, children }: ComponentRenderProps) {
  const { columns = 2, gap = 'md' } = element.props as {
    columns?: number;
    gap?: 'none' | 'sm' | 'md' | 'lg';
  };

  const gapClasses = { none: 'gap-0', sm: 'gap-2', md: 'gap-3', lg: 'gap-4' };

  // Minimum column width that triggers wrapping. Larger min = fewer columns at
  // narrow widths. We scale the minimum based on the requested column count so
  // that asking for more columns produces narrower minimums.
  const minWidths: Record<number, string> = {
    1: '100%',
    2: '260px',
    3: '220px',
    4: '180px',
  };

  const minW = minWidths[columns] || minWidths[2];

  // For single column just use a simple stack
  if (columns === 1) {
    return (
      <div className={`grid grid-cols-1 ${gapClasses[gap]}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`grid ${gapClasses[gap]}`}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minW}, 1fr))` }}
    >
      {children}
    </div>
  );
}

// Text Component
export function Text({ element }: ComponentRenderProps) {
  const { content, variant = 'body', color = 'default' } = element.props as {
    content: string;
    variant?: 'body' | 'caption' | 'heading' | 'subheading' | 'label';
    color?: 'default' | 'muted' | 'success' | 'warning' | 'error';
  };

  const variantClasses = {
    body: 'text-[13px]',
    caption: 'text-xs',
    heading: 'text-base font-bold',
    subheading: 'text-sm font-semibold',
    label: 'text-xs font-medium uppercase tracking-wide',
  };

  const colorClasses = {
    default: 'text-gray-900',
    muted: 'text-gray-500',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
  };

  return <p className={`${variantClasses[variant]} ${colorClasses[color]}`}>{content}</p>;
}

// Divider Component
export function Divider({ element }: ComponentRenderProps) {
  const { label } = element.props as { label?: string };

  if (label) {
    return (
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        </div>
      </div>
    );
  }

  return <hr className="my-4 border-gray-200" />;
}

// Badge Component
export function Badge({ element }: ComponentRenderProps) {
  const { label, variant = 'default' } = element.props as {
    label: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${variantClasses[variant]}`}>
      {label}
    </span>
  );
}

// Export registry
export const componentRegistry = {
  InfoCard,
  DataTable,
  MetricCard,
  ContactCard,
  OpportunityCard,
  EmailPreview,
  TaskItem,
  MeetingCard,
  FileCard,
  MemoryCard,
  ActionButton,
  Stack,
  Grid,
  Text,
  Divider,
  Badge,
};

export type ComponentRegistry = typeof componentRegistry;
