'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CalendarIcon, CheckCircleIcon, PlusIcon, XMarkIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

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
  const [meetingTab, setMeetingTab] = useState<'upcoming' | 'past'>('upcoming');
  const [taskTab, setTaskTab] = useState<'open' | 'completed'>('open');
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSidebarData();
  }, []);

  useEffect(() => {
    if (isAddingTask && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingTask]);

  const fetchSidebarData = async () => {
    try {
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

  const toggleTaskStatus = useCallback(async (taskId: number, currentStatus: string) => {
    if (updatingTaskId) return;

    setUpdatingTaskId(taskId);
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tasks: prev.tasks.map((t) =>
              t.id === taskId ? { ...t, status: updatedTask.status } : t
            ),
          };
        });
      }
    } catch {
      // Silently fail
    } finally {
      setUpdatingTaskId(null);
    }
  }, [updatingTaskId]);

  const addTask = useCallback(async () => {
    if (!newTaskTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle.trim() }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tasks: [...prev.tasks, { ...newTask, status: 'todo' }],
          };
        });
        setNewTaskTitle('');
        setIsAddingTask(false);
        setTaskTab('open'); // Switch to open tab to show new task
      }
    } catch {
      // Silently fail
    } finally {
      setIsSubmitting(false);
    }
  }, [newTaskTitle, isSubmitting]);

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

  const openTasks = data?.tasks?.filter((t) => t.status !== 'done') || [];
  const completedTasks = data?.tasks?.filter((t) => t.status === 'done') || [];

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
          <CalendarIcon className="w-5 h-5 text-purple-700" />
          <h2 className="font-semibold text-gray-900">Meetings</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Meetings Section */}
        <div className="p-4 border-b border-gray-200">
          {/* Tabs */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setMeetingTab('upcoming')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                meetingTab === 'upcoming'
                  ? 'text-purple-700 border-purple-700'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setMeetingTab('past')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                meetingTab === 'past'
                  ? 'text-purple-700 border-purple-700'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Past
            </button>
          </div>

          {/* Meeting List */}
          <div className="space-y-3">
            {meetingTab === 'upcoming' && (!data?.upcomingMeetings?.length ? (
              <p className="text-sm text-gray-500 italic">No upcoming meetings scheduled</p>
            ) : (
              data?.upcomingMeetings.map((meeting) => (
                <MeetingItem key={meeting.id} meeting={meeting} formatDate={formatDate} formatTime={formatTime} />
              ))
            ))}

            {meetingTab === 'past' && (!data?.pastMeetings?.length ? (
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

        {/* Tasks Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-5 h-5 text-purple-700" />
              <h2 className="font-semibold text-gray-900">Todos</h2>
            </div>
            <button
              onClick={() => setIsAddingTask(true)}
              className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
              title="Add todo"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Add Task Input */}
          {isAddingTask && (
            <div className="mb-3 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTask();
                  if (e.key === 'Escape') {
                    setIsAddingTask(false);
                    setNewTaskTitle('');
                  }
                }}
                placeholder="What needs to be done?"
                disabled={isSubmitting}
                className="flex-1 text-sm px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                title="Cancel"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Tasks Tabs */}
          {data?.tasks && data.tasks.length > 0 && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-4">
                <button
                  onClick={() => setTaskTab('open')}
                  className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                    taskTab === 'open'
                      ? 'text-purple-700 border-purple-700'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Open
                  {openTasks.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                      {openTasks.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setTaskTab('completed')}
                  className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                    taskTab === 'completed'
                      ? 'text-purple-700 border-purple-700'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Completed
                  {completedTasks.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {completedTasks.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Task List */}
          {data?.tasks && data.tasks.length > 0 && (
            <div className="space-y-2">
              {taskTab === 'open' && (openTasks.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No open tasks</p>
              ) : (
                openTasks.slice(0, 5).map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    formatDate={formatDate}
                    onToggle={toggleTaskStatus}
                    isUpdating={updatingTaskId === task.id}
                  />
                ))
              ))}

              {taskTab === 'completed' && (completedTasks.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No completed tasks</p>
              ) : (
                completedTasks.slice(0, 5).map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    formatDate={formatDate}
                    onToggle={toggleTaskStatus}
                    isUpdating={updatingTaskId === task.id}
                  />
                ))
              ))}
            </div>
          )}
        </div>
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

function TaskItem({
  task,
  formatDate,
  onToggle,
  isUpdating,
}: {
  task: Task;
  formatDate: (d: string) => string;
  onToggle: (id: number, status: string) => void;
  isUpdating: boolean;
}) {
  const isCompleted = task.status === 'done';

  return (
    <div
      className={`flex items-start gap-2.5 text-sm group ${
        isUpdating ? 'opacity-50' : ''
      }`}
    >
      <button
        onClick={() => onToggle(task.id, task.status)}
        disabled={isUpdating}
        className={`flex-shrink-0 mt-0.5 transition-all ${
          isCompleted
            ? 'text-purple-600 hover:text-purple-700'
            : 'text-gray-300 hover:text-purple-500'
        } ${isUpdating ? 'cursor-wait' : 'cursor-pointer'}`}
        title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isCompleted ? (
          <CheckCircleSolidIcon className="w-5 h-5" />
        ) : (
          <CheckCircleIcon className="w-5 h-5" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`truncate transition-all ${
            isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'
          }`}
        >
          {task.title}
        </p>
        {task.due_date && (
          <p className={`text-xs ${isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
            Due: {formatDate(task.due_date)}
          </p>
        )}
      </div>
    </div>
  );
}
