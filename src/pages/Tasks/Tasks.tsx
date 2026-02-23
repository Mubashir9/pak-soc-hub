import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Task, Event, TeamMember } from '@/types';
import { KanbanBoard } from '@/features/tasks/KanbanBoard';
import { TaskFilters, type TaskFiltersState } from '@/features/tasks/TaskFilters';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState<TaskFiltersState>({
        assignee: "all",
        priority: "all",
        eventId: "all",
    });

    useEffect(() => {
        const loadPageData = async () => {
            const [eventsRes, tasksRes, teamRes] = await Promise.all([
                supabase.from('events').select('*'),
                supabase.from('tasks').select('*'),
                supabase.from('team_members').select('*')
            ]);

            if (eventsRes.data) setEvents(eventsRes.data);
            if (tasksRes.data) setTasks(tasksRes.data);
            if (teamRes.data) setTeamMembers(teamRes.data);
            setLoading(false);
        };
        loadPageData();
    }, []);

    const filteredTasks = useMemo(() => {
        let result = tasks;

        if (filters.assignee !== "all") {
            result = result.filter(t => t.assigned_to === filters.assignee);
        }

        if (filters.priority !== "all") {
            result = result.filter(t => t.priority === filters.priority);
        }

        if (filters.eventId !== "all") {
            result = result.filter(t => t.event_id === filters.eventId);
        }

        return result;
    }, [tasks, filters]);

    const handleTaskCreated = (newTask: Task) => {
        setTasks(prev => [...prev, newTask]);
    };

    const handleTaskUpdated = async (updatedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

        const { error } = await supabase
            .from('tasks')
            .update({ status: updatedTask.status })
            .eq('id', updatedTask.id);

        if (error) {
            console.error("Error updating task status:", error);
            // Revert or show error
        }
    };

    // Create a map of eventId -> eventName for the board
    const eventMap = events.reduce((acc, event) => {
        acc[event.id] = event.name;
        return acc;
    }, {} as Record<string, string>);

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading tasks...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground mt-1">Manage all tasks across events</p>
                </div>
                <CreateTaskDialog
                    eventId={filters.eventId !== "all" ? filters.eventId : events[0]?.id} // Default to first event if none selected
                    onTaskCreated={handleTaskCreated}
                />
            </div>

            <div className="bg-background border rounded-xl shadow-sm p-4 mb-6">
                <TaskFilters
                    filters={filters}
                    setFilters={setFilters}
                    teamMembers={teamMembers}
                    events={events}
                    showEventFilter={true}
                />
            </div>

            <div className="flex-1 overflow-hidden">
                <KanbanBoard
                    tasks={filteredTasks}
                    onTaskUpdated={handleTaskUpdated}
                    eventMap={eventMap}
                />
            </div>
        </div>
    );
}
