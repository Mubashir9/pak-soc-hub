import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockApi, type Event, type Task, MOCK_EVENTS } from '@/lib/mockData';
import { CalendarDays, CheckSquare, DollarSign, Activity } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { format } from 'date-fns';

export default function Dashboard() {
    const [events, setEvents] = useState<Event[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);


    useEffect(() => {
        const loadData = async () => {
            const [eventsData, allTasksData] = await Promise.all([
                mockApi.getEvents(),
                // Fetch tasks for all events - simplified for dashboard
                Promise.all(MOCK_EVENTS.map(e => mockApi.getTasksByEvent(e.id))).then(res => res.flat())
            ]);

            setEvents(eventsData);
            setTasks(allTasksData);
        };
        loadData();
    }, []);

    // Stats
    const activeEvents = events.filter(e => e.status === 'planning' || e.status === 'active').length;
    const totalBudget = events.reduce((sum, e) => sum + e.budget_total, 0);
    const totalSpent = events.reduce((sum, e) => sum + e.budget_spent, 0);
    const myTasks = tasks.filter(t => t.status !== 'completed').length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, Admin</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeEvents}</div>
                        <p className="text-xs text-muted-foreground">
                            +1 from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Active Tasks</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            3 due this week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {events.length} events
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Budget Spent</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${totalSpent.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {Math.round((totalSpent / totalBudget) * 100)}% of total
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Events / Activity */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {events.slice(0, 5).map(event => (
                                <div key={event.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <p className="font-medium leading-none">{event.name}</p>
                                        <p className="text-sm text-muted-foreground">{event.location}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm text-right">
                                            <p>{format(new Date(event.date_start), 'MMM d, yyyy')}</p>
                                            <p className="text-muted-foreground text-xs">{event.event_type}</p>
                                        </div>
                                        <StatusBadge status={event.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks Due Soon */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Priority Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').map(task => (
                                <div key={task.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={task.status} className="w-20 justify-center text-[10px] px-1" />
                                        <span className="text-sm font-medium truncate max-w-[150px]">{task.title}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {task.due_date ? format(new Date(task.due_date), 'MMM d') : 'No date'}
                                    </div>
                                </div>
                            ))}
                            {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length === 0 && (
                                <p className="text-sm text-muted-foreground">No high priority tasks.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


