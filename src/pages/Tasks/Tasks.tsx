import { useEffect, useState } from 'react';
import { mockApi, type Task, type Event, MOCK_TEAM } from '@/lib/mockData';
import { KanbanBoard } from '@/features/tasks/KanbanBoard';
import { TaskFilters, type TaskFiltersState } from '@/features/tasks/TaskFilters';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState<TaskFiltersState>({
        assignee: "all",
        priority: "all",
        eventId: "all",
    });

    useEffect(() => {
        Promise.all([
            // In a real app, we'd have an API to get all tasks
            // For mock, we'll fetch tasks for each event or just assume we have a global getter
            // Let's iterate all events to get all tasks for now, or just use MOCK_TASKS directly if exported
            // Since mockApi.getTasksByEvent is all we have, let's fetch events first then tasks
            mockApi.getEvents()
        ]).then(async ([eventsData]) => {
            setEvents(eventsData);

            // Fetch all tasks for all events
            const allTasksPromises = eventsData.map(e => mockApi.getTasksByEvent(e.id));
            const tasksArrays = await Promise.all(allTasksPromises);
            const allTasks = tasksArrays.flat();

            setTasks(allTasks);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
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

        setFilteredTasks(result);
    }, [tasks, filters]);

    const handleTaskCreated = (newTask: Task) => {
        setTasks(prev => [...prev, newTask]);
    };

    const handleTaskUpdated = (updatedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
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
                    teamMembers={MOCK_TEAM}
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
