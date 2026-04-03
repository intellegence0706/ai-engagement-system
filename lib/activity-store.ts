import { ActivityEvent } from './types';

// In-memory store for activity events (for demo purposes)
class ActivityStore {
  private events: ActivityEvent[] = [];
  private listeners: Set<(event: ActivityEvent) => void> = new Set();

  addEvent(event: ActivityEvent) {
    this.events.unshift(event);
    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(0, 100);
    }
    this.notifyListeners(event);
  }

  getEvents(limit: number = 50): ActivityEvent[] {
    return this.events.slice(0, limit);
  }

  subscribe(listener: (event: ActivityEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(event: ActivityEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }
}

export const activityStore = new ActivityStore();
