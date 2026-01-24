'use client';

import type { ComponentRenderProps } from '@json-render/react';
import { useActions } from '@json-render/react';
import type { Action } from '@json-render/core';

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

// InfoCard Component
export function InfoCard({ element }: ComponentRenderProps) {
  const { title, content, variant = 'default' } = element.props as {
    title: string;
    content: string;
    variant?: 'default' | 'success' | 'warning' | 'error';
  };

  const borderColors = {
    default: 'border-l-purple-700',
    success: 'border-l-green-500',
    warning: 'border-l-amber-500',
    error: 'border-l-red-500',
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 border-l-4 ${borderColors[variant]} p-4 shadow-sm`}>
      <h4 className="text-sm font-semibold text-gray-900 mb-1.5">{title}</h4>
      <p className="text-gray-600 text-[13px] leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

// DataTable Component
export function DataTable({ element }: ComponentRenderProps) {
  const { columns, rows, emptyMessage = 'No data available' } = element.props as {
    columns: Array<{ key: string; label: string }>;
    rows: Array<Record<string, unknown>>;
    emptyMessage?: string;
  };

  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2.5 text-[13px] text-gray-700 whitespace-nowrap">
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

// MetricCard Component
export function MetricCard({ element }: ComponentRenderProps) {
  const { label, value, format, trend } = element.props as {
    label: string;
    value: string | number;
    format?: 'currency' | 'number' | 'percent';
    trend?: 'up' | 'down' | 'neutral';
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  };

  const trendIcons = {
    up: '\u2191',
    down: '\u2193',
    neutral: '\u2192',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-sm">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold text-gray-900">
          {formatValue(value, format)}
        </span>
        {trend && (
          <span className={`text-xs font-medium ${trendColors[trend]}`}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
    </div>
  );
}

// ContactCard Component
export function ContactCard({ element }: ComponentRenderProps) {
  const { name, title, email, phone, isPrimary } = element.props as {
    name: string;
    title?: string;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
            <span className="truncate">{name}</span>
            {isPrimary && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 uppercase tracking-wide flex-shrink-0">
                Primary
              </span>
            )}
          </h4>
          {title && <p className="text-xs text-gray-500 mt-0.5 truncate">{title}</p>}
        </div>
      </div>
      <div className="mt-2.5 space-y-1">
        {email && (
          <p className="text-xs text-gray-600 truncate">
            <span className="text-gray-400 mr-1.5">Email:</span>
            <a href={`mailto:${email}`} className="text-purple-700 hover:underline">{email}</a>
          </p>
        )}
        {phone && (
          <p className="text-xs text-gray-600">
            <span className="text-gray-400 mr-1.5">Phone:</span>
            <a href={`tel:${phone}`} className="text-purple-700 hover:underline">{phone}</a>
          </p>
        )}
      </div>
    </div>
  );
}

// OpportunityCard Component
export function OpportunityCard({ element }: ComponentRenderProps) {
  const { name, amount, stage, closeDate, probability } = element.props as {
    name: string;
    amount: number;
    stage: string;
    closeDate: string;
    probability?: number;
  };

  const stageColors: Record<string, string> = {
    discovery: 'bg-blue-100 text-blue-800',
    qualification: 'bg-cyan-100 text-cyan-800',
    proposal: 'bg-yellow-100 text-yellow-800',
    negotiation: 'bg-orange-100 text-orange-800',
    closed_won: 'bg-green-100 text-green-800',
    closed_lost: 'bg-red-100 text-red-800',
  };

  const formattedDate = new Date(closeDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-sm">
      <div className="flex items-start justify-between mb-2.5 gap-2">
        <h4 className="text-sm font-semibold text-gray-900 truncate">{name}</h4>
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize flex-shrink-0 ${stageColors[stage] || 'bg-gray-100 text-gray-800'}`}>
          {stage.replace('_', ' ')}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-gray-400 mb-0.5">Amount</p>
          <p className="font-semibold text-gray-900">{formatValue(amount, 'currency')}</p>
        </div>
        <div>
          <p className="text-gray-400 mb-0.5">Close Date</p>
          <p className="font-semibold text-gray-900">{formattedDate}</p>
        </div>
        {probability !== undefined && (
          <div>
            <p className="text-gray-400 mb-0.5">Probability</p>
            <p className="font-semibold text-gray-900">{probability}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

// EmailPreview Component
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-sm">
      <div className="flex items-start justify-between mb-1.5 gap-2">
        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">{subject}</h4>
        {direction && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
            direction === 'inbound' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
          }`}>
            {direction === 'inbound' ? 'Received' : 'Sent'}
          </span>
        )}
      </div>
      <div className="text-xs text-gray-500 mb-2.5 space-y-0.5">
        {from && <p className="truncate">From: {from}</p>}
        {to && <p className="truncate">To: {to}</p>}
        {formattedDate && <p>{formattedDate}</p>}
      </div>
      <div className="text-[13px] text-gray-700 whitespace-pre-wrap border-t border-gray-100 pt-2.5 leading-relaxed">
        {body.length > 300 ? `${body.slice(0, 300)}...` : body}
      </div>
    </div>
  );
}

// TaskItem Component
export function TaskItem({ element, onAction }: ComponentRenderProps) {
  const { id, title, description, status, dueDate } = element.props as {
    id: number;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'done';
    dueDate?: string;
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
  };

  const statusLabels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
  };

  const formattedDate = dueDate ? new Date(dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) : '';

  const handleComplete = () => {
    if (status !== 'done' && onAction) {
      onAction({ name: 'complete_task', params: { taskId: id } } as Action);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-sm">
      <div className="flex items-start gap-2.5">
        <button
          onClick={handleComplete}
          disabled={status === 'done'}
          className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            status === 'done'
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-purple-500'
          }`}
        >
          {status === 'done' && (
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-medium ${status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {title}
            </h4>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${statusColors[status]}`}>
              {statusLabels[status]}
            </span>
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
          {formattedDate && (
            <p className="text-[11px] text-gray-400 mt-1.5">Due: {formattedDate}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// MeetingCard Component
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

  const typeColors: Record<string, string> = {
    discovery: 'bg-blue-100 text-blue-700',
    technical: 'bg-purple-100 text-purple-700',
    executive: 'bg-amber-100 text-amber-700',
    negotiation: 'bg-orange-100 text-orange-700',
    closing: 'bg-green-100 text-green-700',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-sm">
      <div className="flex items-start justify-between mb-1.5 gap-2">
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        {meetingType && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize flex-shrink-0 ${typeColors[meetingType] || 'bg-gray-100 text-gray-700'}`}>
            {meetingType}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-600">
        {formattedDate}
        {time && ` at ${time}`}
      </p>
      {attendees && attendees.length > 0 && (
        <p className="text-xs text-gray-500 mt-1.5 truncate">
          With: {attendees.join(', ')}
        </p>
      )}
    </div>
  );
}

// FileCard Component
export function FileCard({ element }: ComponentRenderProps) {
  const { name, fileType, description, summary } = element.props as {
    name: string;
    fileType: string;
    description?: string;
    summary?: string;
  };

  const typeIcons: Record<string, string> = {
    pdf: '\ud83d\udcc4',
    docx: '\ud83d\uddd2\ufe0f',
    xlsx: '\ud83d\udcca',
    pptx: '\ud83d\udcfd\ufe0f',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-sm">
      <div className="flex items-start gap-2.5">
        <span className="text-xl">{typeIcons[fileType] || '\ud83d\udcc1'}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{name}</h4>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
          {summary && (
            <p className="text-xs text-gray-600 mt-1.5 line-clamp-3 leading-relaxed">{summary}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// MemoryCard Component
export function MemoryCard({ element }: ComponentRenderProps) {
  const { category, content, contact, confidence } = element.props as {
    category: string;
    content: string;
    contact?: string;
    confidence?: number;
  };

  const categoryColors: Record<string, string> = {
    preference: 'bg-blue-100 text-blue-700',
    relationship: 'bg-purple-100 text-purple-700',
    technical_need: 'bg-cyan-100 text-cyan-700',
    objection: 'bg-red-100 text-red-700',
    decision_process: 'bg-amber-100 text-amber-700',
  };

  const categoryLabels: Record<string, string> = {
    preference: 'Preference',
    relationship: 'Relationship',
    technical_need: 'Technical Need',
    objection: 'Objection',
    decision_process: 'Decision Process',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-sm">
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${categoryColors[category] || 'bg-gray-100 text-gray-700'}`}>
          {categoryLabels[category] || category}
        </span>
        {contact && (
          <span className="text-[11px] text-gray-500">About: {contact}</span>
        )}
      </div>
      <p className="text-[13px] text-gray-700 leading-relaxed">{content}</p>
      {confidence !== undefined && (
        <p className="text-[11px] text-gray-400 mt-1.5">Confidence: {Math.round(confidence * 100)}%</p>
      )}
    </div>
  );
}

// ActionButton Component
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
    primary: 'bg-purple-700 text-white hover:bg-purple-800 border-transparent',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
    outline: 'bg-white text-purple-700 hover:bg-purple-50 border-purple-300',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-sm',
  };

  return (
    <button
      onClick={() => onAction?.(action)}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium rounded-md border transition-colors
        ${variantClasses[variant]} ${sizeClasses[size]}
        ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
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

// FormField Component
export function FormField({ element }: ComponentRenderProps) {
  const { label, fieldType, path, placeholder, options, required } = element.props as {
    label: string;
    fieldType: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select' | 'number';
    path: string;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
  };

  const inputClasses = 'w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent';

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {fieldType === 'textarea' ? (
        <textarea
          data-path={path}
          placeholder={placeholder}
          className={`${inputClasses} min-h-[80px] resize-y`}
        />
      ) : fieldType === 'select' ? (
        <select data-path={path} className={inputClasses}>
          <option value="">{placeholder || 'Select...'}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={fieldType}
          data-path={path}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}
    </div>
  );
}

// Form Component
export function Form({ element, children, onAction }: ComponentRenderProps) {
  const { title, submitAction, submitLabel = 'Submit' } = element.props as {
    title?: string;
    submitAction?: Action;
    submitLabel?: string;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitAction && onAction) {
      onAction(submitAction);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-sm space-y-3">
      {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
      {children}
      {submitAction && (
        <button
          type="submit"
          className="w-full px-3 py-1.5 bg-purple-700 text-white text-sm font-medium rounded-md hover:bg-purple-800 transition-colors"
        >
          {submitLabel}
        </button>
      )}
    </form>
  );
}

// Stack Component
export function Stack({ element, children }: ComponentRenderProps) {
  const { direction = 'vertical', gap = 'md', align = 'stretch' } = element.props as {
    direction?: 'vertical' | 'horizontal';
    gap?: 'none' | 'sm' | 'md' | 'lg';
    align?: 'start' | 'center' | 'end' | 'stretch';
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  return (
    <div className={`flex ${direction === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'} ${gapClasses[gap]} ${alignClasses[align]}`}>
      {children}
    </div>
  );
}

// Grid Component
export function Grid({ element, children }: ComponentRenderProps) {
  const { columns = 2, gap = 'md' } = element.props as {
    columns?: number;
    gap?: 'none' | 'sm' | 'md' | 'lg';
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const colClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colClasses[columns] || colClasses[2]} ${gapClasses[gap]}`}>
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
    heading: 'text-base font-semibold',
    subheading: 'text-sm font-medium',
    label: 'text-xs font-medium',
  };

  const colorClasses = {
    default: 'text-gray-900',
    muted: 'text-gray-500',
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
  };

  return (
    <p className={`${variantClasses[variant]} ${colorClasses[color]}`}>
      {content}
    </p>
  );
}

// Divider Component
export function Divider({ element }: ComponentRenderProps) {
  const { label } = element.props as { label?: string };

  if (label) {
    return (
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-gray-50 text-gray-500">{label}</span>
        </div>
      </div>
    );
  }

  return <hr className="my-3 border-gray-200" />;
}

// Badge Component
export function Badge({ element }: ComponentRenderProps) {
  const { label, variant = 'default' } = element.props as {
    label: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${variantClasses[variant]}`}>
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
  FormField,
  Form,
  Stack,
  Grid,
  Text,
  Divider,
  Badge,
};

export type ComponentRegistry = typeof componentRegistry;
