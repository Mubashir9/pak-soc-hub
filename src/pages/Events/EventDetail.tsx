import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Event, Task, InventoryItem, BudgetItem, TeamMember } from '@/types';
import { KanbanBoard } from '@/features/tasks/KanbanBoard';
import { InventoryList } from '@/features/inventory/InventoryList';
import { BudgetTracker } from '@/features/budget/BudgetTracker';
import { MeetingList } from '@/features/meetings/MeetingList';
import { Button } from '@/components/ui/button';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';
import { ContentBoard } from '@/features/content/ContentBoard';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CalendarDays, MapPin, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Separator } from '@/components/ui/separator';
import { TaskFilters, type TaskFiltersState } from '@/features/tasks/TaskFilters';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [budget, setBudget] = useState<BudgetItem[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    const [filters, setFilters] = useState<TaskFiltersState>({
        assignee: "all",
        priority: "all",
        eventId: "all", // Hidden in this view
    });

    useEffect(() => {
        if (id) {
            const fetchEventDetails = async () => {
                const [eventRes, tasksRes, inventoryRes, budgetRes, teamRes] = await Promise.all([
                    supabase.from('events').select('*').eq('id', id).single(),
                    supabase.from('tasks').select('*').eq('event_id', id),
                    supabase.from('inventory').select('*').eq('event_id', id),
                    supabase.from('budget_items').select('*').eq('event_id', id),
                    supabase.from('team_members').select('*')
                ]);

                if (eventRes.data) setEvent(eventRes.data);
                if (tasksRes.data) setTasks(tasksRes.data);
                if (inventoryRes.data) setInventory(inventoryRes.data);
                if (budgetRes.data) setBudget(budgetRes.data);
                if (teamRes.data) setTeamMembers(teamRes.data);

                setLoading(false);
            };
            fetchEventDetails();
        }
    }, [id]);

    const filteredTasks = useMemo(() => {
        let result = tasks;

        if (filters.assignee !== "all") {
            result = result.filter(t => t.assigned_to === filters.assignee);
        }

        if (filters.priority !== "all") {
            result = result.filter(t => t.priority === filters.priority);
        }

        return result;
    }, [tasks, filters]);

    const handleTaskCreated = (newTask: Task) => {
        setTasks((prev) => [...prev, newTask]);
    };

    const handleTaskUpdated = async (updatedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

        const { error } = await supabase
            .from('tasks')
            .update({ status: updatedTask.status })
            .eq('id', updatedTask.id);

        if (error) {
            console.error("Error updating task status:", error);
        }
    };

    const handleTaskDeleted = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    const handleEventUpdated = (updatedEvent: Event) => {
        setEvent(updatedEvent);
    };

    const handleEventDeleted = async () => {
        if (!event) return;
        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', event.id);

            if (error) throw error;
            toast.success("Event deleted successfully");
            navigate('/events');
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete event");
        }
    };

    const handleInventoryItemCreated = (newItem: InventoryItem) => {
        setInventory((prev) => [...prev, newItem]);
    };

    const handleInventoryItemUpdated = (updatedItem: InventoryItem) => {
        setInventory((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
    };

    const handleBudgetItemCreated = (newItem: BudgetItem) => {
        setBudget((prev) => [...prev, newItem]);
    };

    const handleBudgetItemUpdated = (updatedItem: BudgetItem) => {
        setBudget((prev) => prev.map((b) => (b.id === updatedItem.id ? updatedItem : b)));
    };

    if (loading) {
        return <div className="p-6">Loading event details...</div>;
    }

    if (!event) {
        return <div className="p-6">Event not found.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    <Link to="/events">Back to Events</Link>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold tracking-tight text-primary">{event.name}</h1>
                            <StatusBadge status={event.status} />
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <CalendarDays className="h-4 w-4" />
                                {format(new Date(event.date_start), "PPP")}
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <CreateEventDialog
                            eventToEdit={event}
                            onEventUpdated={handleEventUpdated}
                            trigger={<Button variant="outline">Edit Event</Button>}
                        />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the event
                                        "{event.name}" and remove all related tasks, budget items, and content ideas from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleEventDeleted} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="budget">Budget</TabsTrigger>
                    <TabsTrigger value="meetings">Meetings</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-medium">Description</h2>
                        <p className="text-muted-foreground">{event.description || "No description provided."}</p>

                        <h2 className="text-lg font-medium pt-4">Key Stats</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded-lg">
                                <div className="text-sm text-muted-foreground">Budget Used</div>
                                <div className="text-2xl font-bold">${event.budget_spent} / ${event.budget_total}</div>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="text-sm text-muted-foreground">Tasks Progress</div>
                                <div className="text-2xl font-bold">
                                    {tasks.filter(t => t.status === 'completed').length} / {tasks.length}
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="tasks" className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">Task Board</h2>
                        <CreateTaskDialog eventId={event.id} onTaskCreated={handleTaskCreated} />
                    </div>
                    <div className="mb-4">
                        <TaskFilters
                            filters={filters}
                            setFilters={setFilters}
                            teamMembers={teamMembers}
                            showEventFilter={false}
                        />
                    </div>
                    <KanbanBoard tasks={filteredTasks} onTaskUpdated={handleTaskUpdated} onTaskDeleted={handleTaskDeleted} />
                </TabsContent>

                <TabsContent value="content" className="mt-6">
                    {event && <ContentBoard eventId={event.id} />}
                </TabsContent>

                <TabsContent value="inventory" className="mt-6">
                    <InventoryList
                        items={inventory}
                        eventId={event.id}
                        onItemCreated={handleInventoryItemCreated}
                        onItemUpdated={handleInventoryItemUpdated}
                    />
                </TabsContent>

                <TabsContent value="budget" className="mt-6">
                    {event && (
                        <BudgetTracker
                            items={budget}
                            totalBudget={event.budget_total}
                            eventId={event.id}
                            onItemCreated={handleBudgetItemCreated}
                            onItemUpdated={handleBudgetItemUpdated}
                        />
                    )}
                </TabsContent>

                <TabsContent value="meetings" className="mt-6">
                    {event && <MeetingList eventId={event.id} />}
                </TabsContent>
            </Tabs>
        </div>
    );
}
