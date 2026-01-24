'use client';

import { useState, useEffect } from 'react';

interface Meeting {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  attendees_json: string;
  meeting_type: string;
}

interface Opportunity {
  id: number;
  name: string;
  amount: number;
  stage: string;
  close_date: string;
  probability: number;
}

interface Task {
  id: number;
  title: string;
  status: string;
  due_date: string;
}

interface SidebarData {
  upcomingMeetings: Meeting[];
  pastMeetings: Meeting[];
  opportunity: Opportunity | null;
  tasks: Task[];
}

export function Sidebar() {
  const [data, setData] = useState<SidebarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('past');

  useEffect(() => {
    // Fetch sidebar data on mount
    fetchSidebarData();
  }, []);

  const fetchSidebarData = async () => {
    try {
      // For now, we'll use a simple approach - in production this would be an API route
      const response = await fetch('/api/sidebar');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch {
      // Fallback to empty data
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="w-80 border-l border-gray-200 bg-white p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-20 bg-gray-100 rounded" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="font-semibold text-gray-900">Agenda</h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Stay in sync with every step, from preps and recaps to next moves.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Meetings Section */}
        <div className="p-4 border-b border-gray-200">
          {/* Tabs */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                activeTab === 'upcoming'
                  ? 'text-purple-700 border-purple-700'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Upcoming Meetings
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                activeTab === 'past'
                  ? 'text-purple-700 border-purple-700'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Past Meetings
            </button>
          </div>

          {/* Meeting List */}
          <div className="space-y-3">
            {activeTab === 'upcoming' && (!data?.upcomingMeetings?.length ? (
              <p className="text-sm text-gray-500 italic">No upcoming meetings scheduled</p>
            ) : (
              data?.upcomingMeetings.map((meeting) => (
                <MeetingItem key={meeting.id} meeting={meeting} formatDate={formatDate} formatTime={formatTime} />
              ))
            ))}

            {activeTab === 'past' && (!data?.pastMeetings?.length ? (
              <p className="text-sm text-gray-500 italic">No past meetings</p>
            ) : (
              data?.pastMeetings.slice(0, 5).map((meeting) => (
                <MeetingItem key={meeting.id} meeting={meeting} formatDate={formatDate} formatTime={formatTime} />
              ))
            ))}
          </div>
        </div>

        {/* Deal Summary */}
        {data?.opportunity && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Deal Summary</h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <p className="font-medium text-gray-900">{data.opportunity.name}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-medium text-gray-900">{formatCurrency(data.opportunity.amount)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Stage</p>
                  <p className="font-medium text-gray-900 capitalize">{data.opportunity.stage.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Close Date</p>
                  <p className="font-medium text-gray-900">{formatDate(data.opportunity.close_date)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Probability</p>
                  <p className="font-medium text-gray-900">{data.opportunity.probability}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks */}
        {data?.tasks && data.tasks.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Open Tasks</h3>
            <div className="space-y-2">
              {data.tasks.filter(t => t.status !== 'done').slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-start gap-2 text-sm">
                  <div className="w-4 h-4 mt-0.5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 truncate">{task.title}</p>
                    {task.due_date && (
                      <p className="text-xs text-gray-500">Due: {formatDate(task.due_date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MeetingItem({
  meeting,
  formatDate,
  formatTime,
}: {
  meeting: Meeting;
  formatDate: (d: string) => string;
  formatTime: (d: string) => string;
}) {
  let attendees: string[] = [];
  try {
    attendees = JSON.parse(meeting.attendees_json || '[]');
  } catch {
    attendees = [];
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="font-medium text-gray-900 text-sm">{meeting.title}</p>
      <p className="text-xs text-gray-500 mt-1">
        {formatDate(meeting.start_time)} - {formatTime(meeting.start_time)}
      </p>
      {attendees.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          With: {attendees.slice(0, 2).join(', ')}
          {attendees.length > 2 && ` +${attendees.length - 2} more`}
        </p>
      )}
    </div>
  );
}
