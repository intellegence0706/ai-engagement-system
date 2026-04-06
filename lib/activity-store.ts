import { ActivityEvent } from './types';
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), '.activity-store.json');

// In-memory store with file persistence
class ActivityStore {
  private events: ActivityEvent[] = [];
  private listeners: Set<(event: ActivityEvent) => void> = new Set();

  constructor() {
    this.loadFromFile();
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
        this.events = JSON.parse(data);
        console.log(`Loaded ${this.events.length} activities from storage`);
      }
    } catch (error) {
      console.error('Failed to load activities from file:', error);
      this.events = [];
    }
  }

  private saveToFile() {
    try {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(this.events, null, 2));
    } catch (error) {
      console.error('Failed to save activities to file:', error);
    }
  }

  addEvent(event: ActivityEvent) {
    this.events.unshift(event);
    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(0, 100);
    }
    this.saveToFile();
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

  // Clear all activities (for testing)
  clear() {
    this.events = [];
    this.saveToFile();
  }
}

export const activityStore = new ActivityStore();
