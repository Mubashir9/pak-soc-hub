import { addDays, subDays } from 'date-fns';

// Types matching Supabase Schema
export type EventStatus = 'planning' | 'active' | 'completed' | 'cancelled';
export type EventType = 'O-Week' | 'Basant' | 'SRC Festival' | 'Coke Studio' | 'General';

export interface Event {
    id: string;
    name: string;
    event_type: EventType;
    date_start: string;
    date_end?: string;
    location: string;
    status: EventStatus;
    budget_total: number;
    budget_spent: number;
    description?: string;
    created_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'general' | 'content' | 'logistics' | 'food' | 'props' | 'sponsors';

export interface Task {
    id: string;
    event_id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    category: TaskCategory;
    assigned_to?: string; // User ID
    due_date?: string;
    created_at: string;
}

// Types for Inventory and Budget
export type InventoryStatus = 'needed' | 'acquired' | 'available';

export interface InventoryItem {
    id: string;
    event_id: string;
    name: string;
    quantity: number;
    status: InventoryStatus;
}

export interface BudgetItem {
    id: string;
    event_id: string;
    description: string;
    estimated_cost: number;
    actual_cost: number;
    category: string;
}

export interface Meeting {
    id: string;
    title: string;
    date: string;
    location: string;
    agenda?: string;
    minutes?: string;
    attendees: string[]; // TeamMember IDs
    meeting_link?: string;
    event_id?: string;
    created_at: string;
}



// Mock Data Store
export interface TeamMember {
    id: string;
    name: string;
    role: string;
    email: string;
    phone?: string;
    avatar?: string;
    joined_at: string;
}

export const MOCK_TEAM: TeamMember[] = [
    {
        id: 'u1',
        name: 'Ali Khan',
        role: 'President',
        email: 'ali.khan@paksoc.edu.au',
        phone: '0412 345 678',
        joined_at: '2025-02-01T00:00:00Z',
    },
    {
        id: 'u2',
        name: 'Sarah Ahmed',
        role: 'Secretary',
        email: 'sarah.ahmed@paksoc.edu.au',
        joined_at: '2025-02-02T00:00:00Z',
    },
    {
        id: 'u3',
        name: 'Bilal Raza',
        role: 'Treasurer',
        email: 'bilal.raza@paksoc.edu.au',
        joined_at: '2025-02-03T00:00:00Z',
    },
    {
        id: 'u4',
        name: 'Ayesha Malik',
        role: 'Events Director',
        email: 'ayesha.malik@paksoc.edu.au',
        joined_at: '2025-02-04T00:00:00Z',
    },
    {
        id: 'u5',
        name: 'Zainab Bibi',
        role: 'Marketing Head',
        email: 'zainab.bibi@paksoc.edu.au',
        joined_at: '2025-02-05T00:00:00Z',
    }
];

export const MOCK_EVENTS: Event[] = [
    {
        id: '1',
        name: 'O-Week Stall 2026',
        event_type: 'O-Week',
        date_start: addDays(new Date(), 14).toISOString(),
        location: 'Central Courtyard',
        status: 'planning',
        budget_total: 500,
        budget_spent: 120,
        description: 'Main stall for orientation week to recruit new members.',
        created_at: subDays(new Date(), 2).toISOString(),
    },
    {
        id: '2',
        name: 'Basant Festival',
        event_type: 'Basant',
        date_start: addDays(new Date(), 45).toISOString(),
        location: 'Lakeside Lawn',
        status: 'planning',
        budget_total: 2000,
        budget_spent: 0,
        description: 'Kite flying festival with food and music.',
        created_at: subDays(new Date(), 5).toISOString(),
    },
    {
        id: '3',
        name: 'Welcome BBQ',
        event_type: 'General',
        date_start: subDays(new Date(), 5).toISOString(),
        location: 'BBQ Area 2',
        status: 'completed',
        budget_total: 300,
        budget_spent: 285,
        description: 'Welcome back BBQ for existing members.',
        created_at: subDays(new Date(), 20).toISOString(),
    }
];

export const MOCK_TASKS: Task[] = [
    {
        id: 't1',
        event_id: '1',
        title: 'Design Flyer',
        status: 'in_progress',
        priority: 'high',
        category: 'content',
        due_date: addDays(new Date(), 2).toISOString(),
        created_at: subDays(new Date(), 1).toISOString(),
    },
    {
        id: 't2',
        event_id: '1',
        title: 'Book Stall Location',
        status: 'completed',
        priority: 'high',
        category: 'logistics',
        created_at: subDays(new Date(), 3).toISOString(),
    },
    {
        id: 't3',
        event_id: '1',
        title: 'Buy Chocolates',
        status: 'todo',
        priority: 'low',
        category: 'food',
        due_date: addDays(new Date(), 10).toISOString(),
        created_at: subDays(new Date(), 1).toISOString(),
    }
];

export const MOCK_INVENTORY: InventoryItem[] = [
    { id: 'i1', event_id: '1', name: 'Folding Tables', quantity: 2, status: 'needed' },
    { id: 'i2', event_id: '1', name: 'PakSoc Banner', quantity: 1, status: 'available' },
    { id: 'i3', event_id: '1', name: 'Flyers (Printed)', quantity: 200, status: 'needed' },
    { id: 'i4', event_id: '2', name: 'Kites', quantity: 50, status: 'acquired' },
    { id: 'i5', event_id: '2', name: 'String Rolls', quantity: 50, status: 'acquired' },
];

export const MOCK_BUDGET: BudgetItem[] = [
    { id: 'b1', event_id: '1', description: 'Flyer Printing', estimated_cost: 50, actual_cost: 45, category: 'Marketing' },
    { id: 'b2', event_id: '1', description: 'Chocolates', estimated_cost: 30, actual_cost: 0, category: 'Food' },
    { id: 'b3', event_id: '1', description: 'Stall Decoration', estimated_cost: 40, actual_cost: 75, category: 'Logistics' },
    { id: 'b4', event_id: '3', description: 'Meat & Buns', estimated_cost: 200, actual_cost: 210, category: 'Food' },
    { id: 'b5', event_id: '3', description: 'Drinks', estimated_cost: 50, actual_cost: 45, category: 'Food' },
];

export const MOCK_MEETINGS: Meeting[] = [
    {
        id: 'm1',
        title: 'Initial Planning Meeting',
        date: addDays(new Date(), 2).toISOString(),
        location: 'Zoom',
        meeting_link: 'https://zoom.us/j/123456789',
        agenda: '1. Venue booking\n2. Budget approval\n3. Volunteer recruitment',
        attendees: ['u1', 'u2', 'u4'],
        event_id: '1',
        created_at: subDays(new Date(), 1).toISOString(),
    },
    {
        id: 'm2',
        title: 'Basant Logistics Review',
        date: addDays(new Date(), 10).toISOString(),
        location: 'Student Union Room 201',
        agenda: '1. Kite vendor contact\n2. Food stall layout',
        attendees: ['u1', 'u3', 'u4'],
        event_id: '2',
        created_at: subDays(new Date(), 2).toISOString(),
    }
];

export interface ContentIdea {
    id: string;
    title: string;
    description?: string;
    platform: 'instagram' | 'tiktok' | 'facebook' | 'general';
    status: 'idea' | 'planned' | 'in_production' | 'posted';
    scheduled_date?: string;
    event_id: string;
    created_at: string;
}

export const MOCK_CONTENT: ContentIdea[] = [
    {
        id: 'c1',
        title: 'O-Week Teaser Reel',
        description: 'Fast cuts of last year\'s event with trending audio.',
        platform: 'instagram',
        status: 'in_production',
        scheduled_date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        event_id: '1',
        created_at: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    },
    {
        id: 'c2',
        title: 'Meet the Execs Post',
        description: 'Carousel introducing the new team.',
        platform: 'instagram',
        status: 'planned',
        scheduled_date: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString(),
        event_id: '1',
        created_at: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    },
    {
        id: 'c3',
        title: 'Basant Kite Flying Tutorials',
        description: 'Series of short TikToks showing how to prep kites.',
        platform: 'tiktok',
        status: 'idea',
        event_id: '2',
        created_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    }
];

// Simple "API" to simulate async calls
export const mockApi = {
    getEvents: async (): Promise<Event[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...MOCK_EVENTS]), 500);
        });
    },
    getEventById: async (id: string): Promise<Event | undefined> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_EVENTS.find(e => e.id === id)), 300);
        });
    },
    getTasksByEvent: async (eventId: string): Promise<Task[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_TASKS.filter(t => t.event_id === eventId)), 400);
        });
    },
    getInventoryByEvent: async (eventId: string): Promise<InventoryItem[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_INVENTORY.filter(i => i.event_id === eventId)), 300);
        });
    },
    getBudgetByEvent: async (eventId: string): Promise<BudgetItem[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_BUDGET.filter(b => b.event_id === eventId)), 300);
        });
    },
    getMeetings: async (): Promise<Meeting[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...MOCK_MEETINGS]), 400);
        });
    },
    getMeetingById: async (id: string): Promise<Meeting | undefined> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_MEETINGS.find(m => m.id === id)), 300);
        });
    },
    getMeetingsByEvent: async (eventId: string): Promise<Meeting[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_MEETINGS.filter(m => m.event_id === eventId)), 300);
        });
    },
    createMeeting: async (meeting: Omit<Meeting, 'id' | 'created_at'>): Promise<Meeting> => {
        return new Promise((resolve) => {
            const newMeeting: Meeting = {
                ...meeting,
                id: Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString()
            };
            MOCK_MEETINGS.push(newMeeting);
            setTimeout(() => resolve(newMeeting), 500);
        });
    },
    updateMeeting: async (meeting: Meeting): Promise<Meeting> => {
        return new Promise((resolve) => {
            const index = MOCK_MEETINGS.findIndex(m => m.id === meeting.id);
            if (index !== -1) {
                MOCK_MEETINGS[index] = meeting;
            }
            setTimeout(() => resolve(meeting), 300);
        });
    },
    deleteMeeting: async (id: string): Promise<void> => {
        return new Promise((resolve) => {
            const index = MOCK_MEETINGS.findIndex(m => m.id === id);
            if (index !== -1) {
                MOCK_MEETINGS.splice(index, 1);
            }
            setTimeout(() => resolve(), 300);
        });
    },
    getContentByEvent: async (eventId: string): Promise<ContentIdea[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_CONTENT.filter(c => c.event_id === eventId)), 300);
        });
    },
    createContent: async (content: Omit<ContentIdea, 'id' | 'created_at'>): Promise<ContentIdea> => {
        return new Promise((resolve) => {
            const newContent: ContentIdea = {
                ...content,
                id: Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString()
            };
            MOCK_CONTENT.push(newContent);
            setTimeout(() => resolve(newContent), 400);
        });
    },
    updateContent: async (content: ContentIdea): Promise<ContentIdea> => {
        return new Promise((resolve) => {
            const index = MOCK_CONTENT.findIndex(c => c.id === content.id);
            if (index !== -1) {
                MOCK_CONTENT[index] = content;
            }
            setTimeout(() => resolve(content), 300);
        });
    }
};
