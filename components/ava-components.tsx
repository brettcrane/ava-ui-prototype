'use client';

import React, { useState } from 'react';
import type { ComponentType } from 'react';
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

// ── Helpers ──────────────────────────────────────────────────────────

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

// ── Prop types ───────────────────────────────────────────────────────

// Typed action payloads for type-safe action handling
export type UpdateTaskStatusPayload = {
  name: 'update_task_status';
  params: { taskId: number; status: 'todo' | 'in_progress' | 'done' };
};
export type CreateTaskPayload = {
  name: 'create_task';
  params: { title: string; description?: string; dueDate?: string };
};
// Generic action for extensibility (e.g., ActionButton with custom actions)
export type GenericActionPayload = {
  name: string;
  params: Record<string, unknown>;
};
export type ActionPayload = UpdateTaskStatusPayload | CreateTaskPayload | GenericActionPayload;

export interface InfoCardProps {
  title: string;
  content: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export interface DataTableProps {
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, unknown>>;
  emptyMessage?: string;
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  format?: 'currency' | 'number' | 'percent';
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
}

export interface ContactCardProps {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  isPrimary?: boolean;
}

export interface OpportunityCardProps {
  name: string;
  amount: number;
  stage: string;
  closeDate: string;
  probability?: number;
}

export interface EmailPreviewProps {
  subject: string;
  from?: string;
  to?: string;
  body: string;
  date?: string;
  direction?: 'inbound' | 'outbound';
}

export interface TaskItemProps {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
  onAction?: (action: ActionPayload) => Promise<boolean> | void;
}

export interface TaskListProps {
  tasks: Array<{
    id: number;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'done';
    dueDate?: string;
  }>;
  onAction?: (action: ActionPayload) => Promise<boolean> | void;
}

export interface MeetingCardProps {
  title: string;
  date: string;
  time?: string;
  attendees?: string[];
  meetingType?: string;
}

export interface FileCardProps {
  name: string;
  fileType: string;
  description?: string;
  summary?: string;
}

export interface MemoryCardProps {
  category: string;
  content: string;
  contact?: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface ActionButtonProps {
  label: string;
  actionName: string;
  actionParams?: Record<string, unknown>;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  onAction?: (action: ActionPayload) => Promise<boolean> | void;
}

export interface TextProps {
  content: string;
  variant?: 'body' | 'caption' | 'heading' | 'subheading' | 'label';
  color?: 'default' | 'muted' | 'success' | 'warning' | 'error';
}

export interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

// ── Components ──────────────────────────────────────────────────────

export const InfoCard = React.memo(function InfoCard({ title, content, variant = 'default' }: InfoCardProps) {
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
});

export const DataTable = React.memo(function DataTable({ columns, rows, emptyMessage = 'No data available' }: DataTableProps) {
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
              <tr key={idx} className="hover:bg-purple-50/50 transition-colors duration-150 cursor-default group">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap group-hover:text-gray-900 transition-colors">
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
});

export const MetricCard = React.memo(function MetricCard({ label, value, format, trend, change }: MetricCardProps) {
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
});

export const ContactCard = React.memo(function ContactCard({ name, title, email, phone, isPrimary }: ContactCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all duration-200 group">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm">
          {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">{name}</h4>
            {isPrimary && <StarIconSolid className="w-4 h-4 text-amber-400 flex-shrink-0" />}
          </div>
          {title && <p className="text-xs text-gray-500 mt-0.5 truncate">{title}</p>}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {email && (
          <a href={`mailto:${email}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-purple-700 rounded-lg text-xs font-medium transition-colors">
            <EnvelopeIcon className="w-3.5 h-3.5" />
            Email
          </a>
        )}
        {phone && (
          <a href={`tel:${phone}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-purple-700 rounded-lg text-xs font-medium transition-colors">
            <PhoneIcon className="w-3.5 h-3.5" />
            Call
          </a>
        )}
      </div>
    </div>
  );
});

export const OpportunityCard = React.memo(function OpportunityCard({ name, amount, stage, closeDate, probability }: OpportunityCardProps) {
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

  const formattedDate = new Date(closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="h-1 bg-gray-100">
        <div className={`h-full ${sc.bg} transition-all duration-500`} style={{ width: `${progressPercent}%` }} />
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
                  <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${probability}%` }} />
                </div>
                <span className="text-xs font-bold text-gray-700">{probability}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export const EmailPreview = React.memo(function EmailPreview({ subject, from, to, body, date, direction }: EmailPreviewProps) {
  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';

  return (
    <Disclosure as="div" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {({ open }) => (
        <>
          <DisclosureButton className="w-full p-4 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${direction === 'inbound' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  <EnvelopeIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{subject}</h4>
                  <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${direction === 'inbound' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
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
                <div className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3">{body}</div>
              </div>
            </DisclosurePanel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
});

export const TaskItem = React.memo(function TaskItem({ id, title, description, status: serverStatus, dueDate, onAction }: TaskItemProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const status = localStatus ?? serverStatus;

  const statusStyles = {
    todo: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'To Do' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
    done: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Done' },
  };
  const s = statusStyles[status as keyof typeof statusStyles] || statusStyles.todo;

  const formattedDate = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  const handleToggle = async () => {
    if (!onAction) return;
    setIsAnimating(true);
    setShowError(false);
    setTimeout(() => setIsAnimating(false), 300);
    const currentStatus = localStatus ?? serverStatus; // Use effective current status
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    setLocalStatus(newStatus);
    const result = await onAction({ name: 'update_task_status', params: { taskId: id, status: newStatus } });
    if (result === false) {
      setLocalStatus(currentStatus === serverStatus ? null : currentStatus); // Rollback properly
      setShowError(true);
      setTimeout(() => setShowError(false), 3000); // Auto-dismiss after 3s
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 ${status === 'done' ? 'opacity-75' : ''} ${showError ? 'animate-shake border-red-300' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer ${
            status === 'done'
              ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-400 hover:border-emerald-400'
              : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50'
          } ${isAnimating ? 'scale-125' : ''}`}
          title={status === 'done' ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {status === 'done' && <CheckCircleIcon className="w-3 h-3" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-medium transition-all ${status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{title}</h4>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${s.bg} ${s.text}`}>{s.label}</span>
          </div>
          {description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>}
          {formattedDate && <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1"><CalendarIcon className="w-3 h-3" />Due {formattedDate}</p>}
          {showError && <p className="text-[11px] text-red-500 mt-1">Failed to update. Please try again.</p>}
        </div>
      </div>
    </div>
  );
});

function TaskListRow({
  task,
  onAction,
  isLast,
}: {
  task: { id: number; title: string; description?: string; status: string; dueDate?: string };
  onAction?: (action: ActionPayload) => Promise<boolean> | void;
  isLast: boolean;
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const status = localStatus ?? task.status;
  const isDone = status === 'done';
  const isInProgress = status === 'in_progress';

  const handleToggle = async () => {
    if (!onAction) return;
    setIsAnimating(true);
    setShowError(false);
    setTimeout(() => setIsAnimating(false), 300);
    const currentStatus = localStatus ?? task.status; // Use effective current status
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    setLocalStatus(newStatus);
    const result = await onAction({ name: 'update_task_status', params: { taskId: task.id, status: newStatus } });
    if (result === false) {
      setLocalStatus(currentStatus === task.status ? null : currentStatus); // Rollback properly
      setShowError(true);
      setTimeout(() => setShowError(false), 3000); // Auto-dismiss after 3s
    }
  };

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 transition-colors duration-100 hover:bg-gray-50 group ${!isLast ? 'border-b border-gray-100' : ''} ${isDone ? 'bg-gray-50/50' : ''} ${showError ? 'bg-red-50' : ''}`}>
      <button
        onClick={handleToggle}
        className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer ${
          isDone
            ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-400 hover:border-emerald-400'
            : isInProgress
              ? 'border-blue-400 hover:border-blue-500 hover:bg-blue-50'
              : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50 group-hover:border-gray-400'
        } ${isAnimating ? 'scale-125' : ''}`}
        title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isDone && <CheckCircleIcon className="w-2.5 h-2.5" />}
        {isInProgress && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
      </button>
      <span className={`flex-1 text-[13px] truncate transition-all ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
        {task.title}
        {showError && <span className="text-red-500 ml-2 text-[11px]">Update failed</span>}
      </span>
      {isInProgress && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 flex-shrink-0">In Progress</span>}
      {formattedDate && !isDone && (
        <span className="text-[11px] text-gray-400 flex-shrink-0 flex items-center gap-1">
          <CalendarIcon className="w-3 h-3" />
          {formattedDate}
        </span>
      )}
    </div>
  );
}

export const TaskList = React.memo(function TaskList({ tasks, onAction }: TaskListProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <CheckCircleIcon className="w-6 h-6 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">No tasks</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {tasks.map((task, idx) => (
        <TaskListRow key={task.id} task={task} onAction={onAction} isLast={idx === tasks.length - 1} />
      ))}
    </div>
  );
});

export const MeetingCard = React.memo(function MeetingCard({ title, date, time, attendees, meetingType }: MeetingCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

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
        <div className="w-16 bg-gradient-to-b from-purple-600 to-purple-700 text-white flex flex-col items-center justify-center py-3">
          <span className="text-2xl font-bold">{new Date(date).getDate()}</span>
          <span className="text-[10px] uppercase tracking-wide opacity-80">{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</span>
        </div>
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{title}</h4>
            {ts && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${ts.bg} ${ts.text}`}>
                <ts.Icon className="w-3 h-3" />
                {meetingType}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{formattedDate}{time && ` at ${time}`}</p>
          {attendees && attendees.length > 0 && (
            <div className="mt-2 flex items-center gap-1">
              <div className="flex -space-x-1.5">
                {attendees.slice(0, 3).map((a, i) => (
                  <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white text-[8px] font-bold text-gray-600 flex items-center justify-center" title={a}>
                    {a.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                ))}
              </div>
              <span className="text-[11px] text-gray-500 ml-1">{attendees.length > 3 ? `+${attendees.length - 3} more` : ''}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export const FileCard = React.memo(function FileCard({ name, fileType, description, summary }: FileCardProps) {
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
            <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">{name}</h4>
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
                <p className="text-[13px] text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{summary}</p>
              </div>
            </DisclosurePanel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
});

export const MemoryCard = React.memo(function MemoryCard({ category, content, contact, confidence }: MemoryCardProps) {
  const categoryStyles: Record<string, { accent: string; iconBg: string; iconText: string; label: string; labelText: string; Icon: ComponentType<{ className?: string }> }> = {
    preference: { accent: 'bg-blue-500', iconBg: 'bg-blue-50', iconText: 'text-blue-600', label: 'Key Pain Point', labelText: 'text-blue-700', Icon: LightBulbIcon },
    relationship: { accent: 'bg-violet-500', iconBg: 'bg-violet-50', iconText: 'text-violet-600', label: 'Relationship', labelText: 'text-violet-700', Icon: UserGroupIcon },
    technical_need: { accent: 'bg-teal-500', iconBg: 'bg-teal-50', iconText: 'text-teal-600', label: 'Technical Need', labelText: 'text-teal-700', Icon: WrenchScrewdriverIcon },
    objection: { accent: 'bg-rose-500', iconBg: 'bg-rose-50', iconText: 'text-rose-600', label: 'Objection', labelText: 'text-rose-700', Icon: ExclamationTriangleIcon },
    decision_process: { accent: 'bg-amber-500', iconBg: 'bg-amber-50', iconText: 'text-amber-600', label: 'Decision Process', labelText: 'text-amber-700', Icon: FlagIcon },
    budget_authority: { accent: 'bg-emerald-500', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', label: 'Budget Authority', labelText: 'text-emerald-700', Icon: BriefcaseIcon },
    expansion: { accent: 'bg-indigo-500', iconBg: 'bg-indigo-50', iconText: 'text-indigo-600', label: 'Expansion Opportunity', labelText: 'text-indigo-700', Icon: LightBulbIcon },
  };

  const confidenceStyles: Record<string, { dot: string; text: string; label: string }> = {
    high: { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'High' },
    medium: { dot: 'bg-amber-500', text: 'text-amber-700', label: 'Medium' },
    low: { dot: 'bg-gray-400', text: 'text-gray-500', label: 'Low' },
  };

  const cs = categoryStyles[category] || {
    accent: 'bg-gray-400', iconBg: 'bg-gray-50', iconText: 'text-gray-500',
    label: category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    labelText: 'text-gray-700', Icon: DocumentTextIcon,
  };
  const conf = confidence ? confidenceStyles[confidence] : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 group flex">
      <div className={`w-1 flex-shrink-0 ${cs.accent}`} />
      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-7 h-7 rounded-lg ${cs.iconBg} ${cs.iconText} flex items-center justify-center flex-shrink-0`}>
              <cs.Icon className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${cs.labelText}`}>{cs.label}</span>
              {contact && (
                <>
                  <span className="text-gray-300">&middot;</span>
                  <span className="text-[12px] font-medium text-gray-500 truncate">{contact}</span>
                </>
              )}
            </div>
          </div>
          {conf && (
            <span className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
              <span className={`text-[11px] font-semibold ${conf.text}`}>{conf.label}</span>
            </span>
          )}
        </div>
        <p className="text-[13px] text-gray-700 leading-relaxed pl-[38px]">{content}</p>
      </div>
    </div>
  );
});

export const ActionButton = React.memo(function ActionButton({ label, actionName, actionParams, variant = 'primary', size = 'md', disabled, isLoading, onAction }: ActionButtonProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-sm hover:shadow-md',
    outline: 'bg-white text-purple-700 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50',
  };
  const sizeClasses = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' };

  return (
    <button
      onClick={() => onAction?.({ name: actionName, params: actionParams || {} })}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : label}
    </button>
  );
});

export const TextComponent = React.memo(function TextComponent({ content, variant = 'body', color = 'default' }: TextProps) {
  const variantClasses = {
    body: 'text-[13px]', caption: 'text-xs', heading: 'text-base font-bold', subheading: 'text-sm font-semibold', label: 'text-xs font-medium uppercase tracking-wide',
  };
  const colorClasses = {
    default: 'text-gray-900', muted: 'text-gray-500', success: 'text-emerald-600', warning: 'text-amber-600', error: 'text-red-600',
  };
  return <p className={`${variantClasses[variant]} ${colorClasses[color]}`}>{content}</p>;
});

export const Badge = React.memo(function Badge({ label, variant = 'default' }: BadgeProps) {
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
});

// ── Layout helpers for rendering tool results ───────────────────────

// Component type categories for layout inference
const COMPACT_TYPES = ['MetricCard', 'ContactCard', 'Badge'];
const FULL_WIDTH_TYPES = ['OpportunityCard', 'DataTable', 'TaskList'];

// Infer the best layout for a section based on component types
function inferLayout(components: Array<Record<string, unknown>>): string {
  const types = components.map(c => String(c.type || ''));

  if (types.every(t => COMPACT_TYPES.includes(t))) return 'grid-3';
  if (types.every(t => FULL_WIDTH_TYPES.includes(t))) return 'full-width';
  return 'grid-2';
}

const layoutClasses: Record<string, string> = {
  'grid-3': 'grid gap-3',
  'grid-2': 'grid gap-3',
  'full-width': 'flex flex-col gap-3',
  'stack': 'flex flex-col gap-3',
};

const layoutStyles: Record<string, React.CSSProperties> = {
  'grid-3': { gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' },
  'grid-2': { gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' },
  'full-width': {},
  'stack': {},
};

// Action handler that forwards to the API and returns success/failure for rollback
async function handleAction(action: ActionPayload): Promise<boolean> {
  try {
    const response = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: action.name, params: action.params }),
    });
    if (!response.ok) {
      console.error(`Action failed: ${response.status} ${response.statusText}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Action request failed:', error);
    return false;
  }
}

// Render a single component from tool output data
export function renderComponent(comp: Record<string, unknown>, key: number | string) {
  const type = comp.type as string;
  switch (type) {
    case 'InfoCard': return <InfoCard key={key} title={comp.title as string} content={comp.content as string} variant={comp.variant as InfoCardProps['variant']} />;
    case 'MetricCard': return <MetricCard key={key} label={comp.label as string} value={comp.value as string | number} format={comp.format as MetricCardProps['format']} trend={comp.trend as MetricCardProps['trend']} change={comp.change as string} />;
    case 'ContactCard': return <ContactCard key={key} name={comp.name as string} title={comp.title as string} email={comp.email as string} phone={comp.phone as string} isPrimary={comp.isPrimary as boolean} />;
    case 'OpportunityCard': return <OpportunityCard key={key} name={comp.name as string} amount={comp.amount as number} stage={comp.stage as string} closeDate={comp.closeDate as string} probability={comp.probability as number} />;
    case 'EmailPreview': return <EmailPreview key={key} subject={comp.subject as string} from={comp.from as string} to={comp.to as string} body={comp.body as string} date={comp.date as string} direction={comp.direction as EmailPreviewProps['direction']} />;
    case 'TaskList': return <TaskList key={key} tasks={comp.tasks as TaskListProps['tasks']} onAction={handleAction} />;
    case 'MeetingCard': return <MeetingCard key={key} title={comp.title as string} date={comp.date as string} time={comp.time as string} attendees={comp.attendees as string[]} meetingType={comp.meetingType as string} />;
    case 'FileCard': return <FileCard key={key} name={comp.name as string} fileType={comp.fileType as string} description={comp.description as string} summary={comp.summary as string} />;
    case 'MemoryCard': return <MemoryCard key={key} category={comp.category as string} content={comp.content as string} contact={comp.contact as string} confidence={comp.confidence as MemoryCardProps['confidence']} />;
    case 'DataTable': return <DataTable key={key} columns={comp.columns as DataTableProps['columns']} rows={comp.rows as DataTableProps['rows']} emptyMessage={comp.emptyMessage as string} />;
    case 'Badge': return <Badge key={key} label={comp.label as string} variant={comp.variant as BadgeProps['variant']} />;
    case 'ActionButton': return <ActionButton key={key} label={comp.label as string} actionName={comp.actionName as string} actionParams={comp.actionParams as Record<string, unknown>} variant={comp.variant as ActionButtonProps['variant']} onAction={handleAction} />;
    case 'Text': return <TextComponent key={key} content={comp.content as string} variant={comp.variant as TextProps['variant']} color={comp.color as TextProps['color']} />;
    default:
      console.error(`Unknown component type: ${type}`);
      return (
        <div key={key} className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          Unknown component: {type}
        </div>
      );
  }
}

// Correct layout based on actual component types (enforces layout rules)
function correctLayout(layout: string, components: Array<Record<string, unknown>>): string {
  const types = components.map(c => String(c.type || ''));
  const hasFullWidthType = types.some(t => FULL_WIDTH_TYPES.includes(t));
  const allCompact = types.every(t => COMPACT_TYPES.includes(t));

  // Full-width types always force full-width layout
  if (hasFullWidthType) return 'full-width';

  // grid-3 only allowed for compact types
  if (layout === 'grid-3' && !allCompact) return 'grid-2';

  return layout;
}

export function DashboardSection({ section }: { section: { heading?: string; layout?: string; components: Array<Record<string, unknown>> } }) {
  const rawLayout = section.layout || inferLayout(section.components);
  const layout = correctLayout(rawLayout, section.components);
  return (
    <div>
      {section.heading && <p className="text-base font-bold text-gray-900 mb-2">{section.heading}</p>}
      <div className={layoutClasses[layout] || 'flex flex-col gap-3'} style={layoutStyles[layout] || {}}>
        {section.components.map((comp, i) => renderComponent(comp, i))}
      </div>
    </div>
  );
}
