'use client';

import { useState, useEffect } from 'react';
import { ActivityEvent } from '@/lib/types';

export default function Dashboard() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('[Dashboard] Component mounted, fetching initial activities...');
    
    // Fetch initial activities
    fetch('/api/activity')
      .then(res => {
        console.log('[Dashboard] Activity API response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('[Dashboard] Initial activities loaded:', data.events?.length || 0, data.events);
        setActivities(data.events || []);
      })
      .catch(err => {
        console.error('[Dashboard] Failed to load activities:', err);
      });

    // Connect to SSE stream
    console.log('[Dashboard] Connecting to SSE stream...');
    const eventSource = new EventSource('/api/activity/stream');

    eventSource.onopen = () => {
      console.log('[Dashboard] SSE connection opened successfully');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      console.log('[Dashboard] SSE raw event data:', event.data);
      try {
        const data = JSON.parse(event.data);
        console.log('[Dashboard] SSE event parsed:', data);
        if (data.type !== 'connected') {
          console.log('[Dashboard] Adding activity to feed:', data);
          setActivities(prev => {
            const updated = [data, ...prev].slice(0, 50);
            console.log('[Dashboard] Updated activities count:', updated.length);
            return updated;
          });
        }
      } catch (error) {
        console.error('[Dashboard] Error parsing SSE data:', error, event.data);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[Dashboard] SSE connection error:', error);
      setIsConnected(false);
    };

    return () => {
      console.log('[Dashboard] Closing SSE connection');
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-dark-teal relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-animated"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/20 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-teal-300/10 rounded-full blur-3xl animate-float"></div>
      </div>

      <header className="relative bg-teal-900/40 backdrop-blur-md border-b border-teal-400/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  AI Lead Automation
                </h1>
                <p className="text-teal-200 text-sm">Real-time intelligent engagement</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-teal-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-teal-400/40 shadow-lg">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'} animate-pulse`} />
              <span className="text-sm font-medium text-white">
                {isConnected ? 'Live' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ActivityFeed activities={activities} />
          </div>
          <div>
            <LeadForm />
          </div>
        </div>
      </main>
    </div>
  );
}

function ActivityFeed({ activities }: { activities: ActivityEvent[] }) {
  return (
    <div className="bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-teal-200/50 overflow-hidden">
      <div className="px-6 py-5 bg-gradient-to-r from-teal-600 to-emerald-600 border-b border-teal-400/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Activity Feed</h2>
            <p className="text-teal-100 text-xs">Real-time automation events</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto bg-gradient-to-b from-white to-teal-50/30">
        {activities.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="inline-flex p-4 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl mb-4">
              <svg className="w-16 h-16 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No activity yet</p>
            <p className="text-gray-500 text-sm mt-1">Submit a lead to see automation in action</p>
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: ActivityEvent }) {
  const statusColors = {
    processing: 'bg-blue-50 text-blue-700 border-blue-300',
    ai_generated: 'bg-purple-50 text-purple-700 border-purple-300',
    sms_sent: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    failed: 'bg-red-50 text-red-700 border-red-300'
  };

  const statusIcons = {
    processing: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    ai_generated: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    sms_sent: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    failed: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  };

  const typeIcons = {
    lead_form: (
      <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    missed_call: (
      <svg className="w-5 h-5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )
  };

  const typeLabels = {
    lead_form: 'Lead Form',
    missed_call: 'Missed Call'
  };

  return (
    <div className="px-6 py-4 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-emerald-50/30 transition-all duration-200 border-l-4 border-transparent hover:border-teal-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl shadow-sm border border-teal-200/50">
              {typeIcons[activity.type]}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900">
                {typeLabels[activity.type]}
              </span>
              <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border-2 flex items-center gap-1.5 shadow-sm ${statusColors[activity.status]}`}>
                {statusIcons[activity.status]}
                {activity.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          <div className="ml-14 space-y-2">
            {activity.data.name && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-teal-800">Name:</span> {activity.data.name}
              </p>
            )}
            
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-teal-800">Phone:</span> {activity.data.phone}
            </p>
            
            {activity.data.message && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-teal-800">Message:</span> {activity.data.message}
              </p>
            )}
            
            {activity.data.response && (
              <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 p-3 rounded-xl border-2 border-purple-200 shadow-sm">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold text-purple-800 flex items-center gap-1.5 mb-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Response:
                  </span>
                  {activity.data.response}
                </p>
              </div>
            )}
            
            {activity.data.error && (
              <div className="bg-red-50 p-3 rounded-xl border-2 border-red-200 shadow-sm">
                <p className="text-sm text-red-700">
                  <span className="font-semibold flex items-center gap-1.5 mb-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Error:
                  </span>
                  {activity.data.error}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1 ml-4">
          <div className="text-xs font-semibold text-teal-700 bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 shadow-sm">
            {new Date(activity.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      <div className="mt-3 ml-14 text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
        {activity.correlationId}
      </div>
    </div>
  );
}

function LeadForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ type: 'success', message: 'Lead submitted successfully!' });
        setFormData({ name: '', phone: '', message: '' });
      } else {
        setResult({ type: 'error', message: data.error || 'Submission failed' });
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-teal-200/50 overflow-hidden sticky top-8">
      <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Lead Form</h2>
            <p className="text-emerald-100 text-xs">Try the automation</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-gradient-to-b from-white to-teal-50/30">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all bg-white shadow-sm"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567 or +15551234567"
              className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all bg-white shadow-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Any format accepted: (555) 123-4567, 555-123-4567, +15551234567</p>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Message
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all resize-none bg-white shadow-sm"
              placeholder="Tell us about your needs..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-3.5 px-6 rounded-xl hover:from-teal-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Submit Lead
              </>
            )}
          </button>

          {result && (
            <div className={`p-4 rounded-xl text-sm font-semibold flex items-start gap-3 shadow-md ${
              result.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300' 
                : 'bg-red-50 text-red-800 border-2 border-red-300'
            }`}>
              {result.type === 'success' ? (
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{result.message}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
