import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { Event, Task, Meeting } from '@/types';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Clock, Video } from 'lucide-react';
import { DashboardTaskList } from '@/features/tasks/components/DashboardTaskList';

export default function Dashboard() {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [upcomingMeeting, setUpcomingMeeting] = useState<Meeting | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            const [eventsRes, tasksRes, meetingsRes] = await Promise.all([
                supabase.from('events').select('*').order('date_start', { ascending: true }),
                supabase.from('tasks').select('*'),
                supabase.from('meetings').select('*').gte('date', new Date().toISOString()).order('date', { ascending: true }).limit(1)
            ]);

            if (eventsRes.data) setEvents(eventsRes.data);
            if (tasksRes.data) setTasks(tasksRes.data);
            if (meetingsRes.data && meetingsRes.data.length > 0) setUpcomingMeeting(meetingsRes.data[0]);
            setLoading(false);
        };
        loadDashboardData();
    }, []);



    const totalBudget = events.reduce((sum, e) => sum + e.budget_total, 0);
    const totalSpent = events.reduce((sum, e) => sum + e.budget_spent, 0);
    const budgetPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    if (loading) {
        return <div className="p-6">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, Admin</p>
            </div>

            {upcomingMeeting && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Next Upcoming Meeting
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold">{upcomingMeeting.title}</h3>
                                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-muted-foreground">
                                    <div className="flex items-center gap-1 mt-2">
                                        <Calendar className="h-4 w-4" />
                                        {format(new Date(upcomingMeeting.date), 'PPPP')}
                                    </div>
                                    <div className="flex items-center gap-1 mt-2">
                                        <Clock className="h-4 w-4" />
                                        {format(new Date(upcomingMeeting.date), 'p')}
                                    </div>
                                    <div className="flex items-center gap-1 mt-2">
                                        <MapPin className="h-4 w-4" />
                                        {upcomingMeeting.location}
                                    </div>
                                    <div className="flex items-center gap-1 mt-2">
                                        <Users className="h-4 w-4" />
                                        {upcomingMeeting.attendees?.length || 0} Attendees
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0 md:self-end">
                                {upcomingMeeting.meeting_link && (
                                    <Button asChild>
                                        <a href={upcomingMeeting.meeting_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                            <Video className="h-4 w-4" />
                                            Join Meeting
                                        </a>
                                    </Button>
                                )}
                                <Button variant="outline" onClick={() => navigate(`/meetings/${upcomingMeeting.id}`)}>
                                    View Details
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Events / Activity */}
                <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Upcoming Events</CardTitle>
                        <div className="text-sm text-muted-foreground">
                            Budget: ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()} ({budgetPercentage}%)
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {events.slice(0, 3).map(event => (
                                <div
                                    key={event.id}
                                    className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0 hover:bg-muted/50 p-2 rounded-md cursor-pointer transition-colors"
                                    onClick={() => navigate(`/events/${event.id}`)}
                                >
                                    <div className="space-y-1">
                                        <p className="text-lg font-semibold leading-tight">{event.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {event.location}
                                        </p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            [{event.status}]
                                            {event.status !== 'completed' && event.status !== 'cancelled' && event.budget_spent > 0 && ` • $${event.budget_spent.toLocaleString()} spent`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                                            {format(new Date(event.date_start), 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks Due Soon */}
                <DashboardTaskList
                    tasks={tasks}
                    events={events}
                />
            </div>
        </div>
    );
}


