// Shared application types matching Supabase schema

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
    assigned_to?: string;
    due_date?: string;
    created_at: string;
}

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
    attendees: string[];
    meeting_link?: string;
    event_id?: string;
    created_at: string;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    email: string;
    phone?: string;
    avatar?: string;
    joined_at: string;
}

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
