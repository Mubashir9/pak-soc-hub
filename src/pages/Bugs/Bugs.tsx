import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { BugIssue } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bug, CheckCircle2, CircleDashed, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { CreateBugIssueDialog } from './components/CreateBugIssueDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function Bugs() {
    const [bugs, setBugs] = useState<BugIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const fetchBugs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('bugs_and_issues')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching bugs:", error);
        } else {
            setBugs(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchBugs();
    }, []);

    const filteredBugs = bugs.filter(bug => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'active') return ['open', 'in_progress'].includes(bug.status);
        if (statusFilter === 'resolved') return ['resolved', 'closed'].includes(bug.status);
        return bug.status === statusFilter;
    });

    const handleBugCreated = (newBug: BugIssue) => {
        setBugs([newBug, ...bugs]);
    };

    const handleBugUpdated = (updatedBug: BugIssue) => {
        setBugs(bugs.map(b => b.id === updatedBug.id ? updatedBug : b));
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'low': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <CircleDashed className="h-4 w-4 text-blue-500" />;
            case 'in_progress': return <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />;
            case 'resolved': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'closed': return <CheckCircle2 className="h-4 w-4 text-slate-500" />;
            default: return <CircleDashed className="h-4 w-4" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Bug className="h-8 w-8 text-primary" /> Bugs & Issues
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Report and track application issues.
                    </p>
                </div>
                <CreateBugIssueDialog onBugCreated={handleBugCreated} />
            </div>

            <Card className="flex-1 flex flex-col min-h-0 border-t-4 border-t-primary">
                <CardHeader className="pb-4 items-start md:flex-row md:items-center justify-between border-b space-y-4 md:space-y-0">
                    <div>
                        <CardTitle className="text-xl">Issue Tracker</CardTitle>
                        <CardDescription>All reported bugs and feature requests</CardDescription>
                    </div>
                    <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
                        <TabsList className="grid w-full grid-cols-3 md:w-auto md:flex">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="active">Active</TabsTrigger>
                            <TabsTrigger value="resolved">Resolved</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="p-0 overflow-auto custom-scrollbar flex-1 relative">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredBugs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Bug className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">No issues found</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                {statusFilter === 'all'
                                    ? "There are no reported bugs at the moment. Everything looks good!"
                                    : `No bugs match the '${statusFilter}' filter.`}
                            </p>
                            {statusFilter !== 'all' && (
                                <Button variant="outline" className="mt-4" onClick={() => setStatusFilter('all')}>
                                    Clear Filter
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredBugs.map((bug) => (
                                <div key={bug.id} className="p-4 md:p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(bug.status)}
                                            <h4 className="font-medium text-base truncate">{bug.title}</h4>
                                            <Badge variant="outline" className={cn("ml-2 whitespace-nowrap hidden sm:inline-flex", getPriorityColor(bug.priority))}>
                                                {bug.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                            {bug.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                            <span>Reported by: <strong className="font-medium text-foreground">{bug.reported_by}</strong></span>
                                            <span>•</span>
                                            <span>{format(new Date(bug.created_at), 'MMM d, yyyy - h:mm a')}</span>
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0 w-full md:w-auto justify-between md:justify-center">
                                        <Badge variant="outline" className={cn("whitespace-nowrap sm:hidden", getPriorityColor(bug.priority))}>
                                            {bug.priority}
                                        </Badge>
                                        <CreateBugIssueDialog
                                            bugToEdit={bug}
                                            onBugUpdated={handleBugUpdated}
                                            trigger={
                                                <Button variant="outline" size="sm">
                                                    Update
                                                </Button>
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
