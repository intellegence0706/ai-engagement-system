'use client';

import { useState, useEffect } from 'react';
import { ActivityEvent } from '@/lib/types';

export default function Dashboard() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Fetch initial activities
    fetch('/api/activity')
      .then(res => res.json())
      .then(data => setActivities(data.events || []))
      .catch(console.error);

    // Connect to SSE stream
    const eventSource = new EventSource('/api/activity/stream');

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== 'connected') {
          setActivities(prev => [data, ...prev].slice(0, 50));
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              AI Lead Automation Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Live' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
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
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Activity Feed</h2>
      </div>
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No activity yet. Submit a lead to see automation in action.
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
    processing: 'bg-blue-100 text-blue-800',
    ai_generated: 'bg-purple-100 text-purple-800',
    sms_sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  const typeLabels = {
    lead_form: 'Lead Form',
    missed_call: 'Missed Call'
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-900">
              {typeLabels[activity.type]}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[activity.status]}`}>
              {activity.status.replace('_', ' ')}
            </span>
          </div>
          
          {activity.data.name && (
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Name:</span> {activity.data.name}
            </p>
          )}
          
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-medium">Phone:</span> {activity.data.phone}
          </p>
          
          {activity.data.message && (
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Message:</span> {activity.data.message}
            </p>
          )}
          
          {activity.data.response && (
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">AI Response:</span> {activity.data.response}
            </p>
          )}
          
          {activity.data.error && (
            <p className="text-sm text-red-600 mb-1">
              <span className="font-medium">Error:</span> {activity.data.error}
            </p>
          )}
        </div>
        
        <div className="text-xs text-gray-500 ml-4">
          {new Date(activity.timestamp).toLocaleTimeString()}
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        ID: {activity.correlationId}
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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Lead Form</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1234567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Lead'}
        </button>

        {result && (
          <div className={`p-3 rounded-md text-sm ${
            result.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {result.message}
          </div>
        )}
      </form>
    </div>
  );
}
