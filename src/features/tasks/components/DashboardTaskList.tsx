import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { type Task, type Event, type TaskStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, ListTodo, PlayCircle, CheckCircle2, User, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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

interface DashboardTaskListProps {
    tasks: Task[];
    events: Event[];
    onTaskDeleted?: (taskId: string) => void;
}

export function DashboardTaskList({ tasks, events, onTaskDeleted }: DashboardTaskListProps) {
    const [statusFilter, setStatusFilter] = useState<TaskStatus>('todo');

    // Create a map of eventId -> eventName for quick lookup
    const eventMap = useMemo(() => {
        return events.reduce((acc, event) => {
            acc[event.id] = event.name;
            return acc;
        }, {} as Record<string, string>);
    }, [events]);

    const dashboardEventIds = useMemo(() => events.map(e => e.id), [events]);

    // Filter tasks by dashboard events AND status
    const filteredTasks = useMemo(() => {
        return tasks
            .filter(t => dashboardEventIds.includes(t.event_id))
            .filter(t => t.status === statusFilter)
            .sort((a, b) => {
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            });
    }, [tasks, dashboardEventIds, statusFilter]);

    const totalActive = filteredTasks.length;

    return (
        <Card className="col-span-3">
            <CardHeader className="flex flex-col space-y-4">
                <div className="flex flex-row items-center justify-between">
                    <CardTitle>Tasks</CardTitle>
                    <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full border">
                        {totalActive} {statusFilter.replace('_', ' ')}
                    </div>
                </div>
                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="todo" className="text-xs flex items-center gap-1.5">
                            <ListTodo className="h-3.5 w-3.5" />
                            To Do
                        </TabsTrigger>
                        <TabsTrigger value="in_progress" className="text-xs flex items-center gap-1.5">
                            <PlayCircle className="h-3.5 w-3.5" />
                            In Progress
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="text-xs flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Done
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent>
                {totalActive === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <CheckSquare className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">No tasks found</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {statusFilter === 'todo'
                                    ? "There are no pending tasks for current events."
                                    : statusFilter === 'in_progress'
                                        ? "No tasks are currently being worked on."
                                        : "No tasks have been completed yet."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredTasks.map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                eventName={eventMap[task.event_id]}
                                onTaskDeleted={onTaskDeleted}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function TaskItem({
    task,
    eventName,
    onTaskDeleted
}: {
    task: Task;
    eventName: string;
    onTaskDeleted?: (taskId: string) => void;
}) {
    return (
        <div className="group flex flex-col gap-1 p-3 border rounded-lg hover:bg-muted/50 transition-all border-l-4"
            style={{ borderLeftColor: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#fb923c' : '#cbd5e1' }}>
            <div className="flex items-start justify-between">
                <div className="grid gap-1">
                    <p className="text-sm font-semibold leading-none">
                        {task.title}
                    </p>
                    {eventName && (
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                            {eventName}
                        </p>
                    )}
                </div>
                <div className="flex flex-col items-end justify-between gap-2">
                    <div className="flex items-center gap-1">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the task "{task.title}". This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={async () => {
                                            const { error } = await supabase
                                                .from('tasks')
                                                .delete()
                                                .eq('id', task.id);

                                            if (error) {
                                                console.error("Error deleting task:", error);
                                            } else {
                                                onTaskDeleted?.(task.id);
                                            }
                                        }}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        {task.due_date && (
                            <div className="text-[10px] items-center font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase self-end">
                                {format(new Date(task.due_date), 'MMM d')}
                            </div>
                        )}
                    </div>
                    {task.assigned_to && task.assigned_to !== 'Unassigned' && (
                        <div className="flex items-center text-[10px] text-muted-foreground ml-4 max-w-[80px]">
                            <User className="mr-1 h-2.5 w-2.5 shrink-0" />
                            <span className="truncate" title={task.assigned_to}>{task.assigned_to}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
