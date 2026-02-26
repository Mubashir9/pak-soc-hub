import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Meeting, TeamMember } from '@/types';
import { Button } from '@/components/ui/button';
import { MeetingForm } from '@/features/meetings/MeetingForm';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from 'use-debounce';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    ExternalLink,
    Users,
    FileText,
    ClipboardList,
    Save,
    Pencil,
    Trash2,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
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

export default function MeetingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [meeting, setMeeting] = useState<Meeting | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [minutes, setMinutes] = useState("");
    const [debouncedMinutes] = useDebounce(minutes, 1000);
    const [isSaving, setIsSaving] = useState(false);
    const initialMinutesLoaded = useRef(false);

    const [attendees, setAttendees] = useState<string[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        if (id) {
            const fetchMeetingDetails = async () => {
                const [meetingRes, teamRes] = await Promise.all([
                    supabase.from('meetings').select('*').eq('id', id).single(),
                    supabase.from('team_members').select('*')
                ]);

                if (meetingRes.data) {
                    setMeeting(meetingRes.data);
                    setMinutes(meetingRes.data.minutes || "");
                    setAttendees(meetingRes.data.attendees || []);
                    // Small timeout to prevent immediate save on initial load
                    setTimeout(() => {
                        initialMinutesLoaded.current = true;
                    }, 1000);
                }
                if (teamRes.data) {
                    setTeamMembers(teamRes.data);
                }
                setLoading(false);
            };
            fetchMeetingDetails();
        }
    }, [id]);

    useEffect(() => {
        const autoSaveMinutes = async () => {
            if (!meeting || !initialMinutesLoaded.current) return;
            // Only save if it actually changed from DB
            if (debouncedMinutes === meeting.minutes && (meeting.minutes !== undefined || debouncedMinutes === "")) return;

            setIsSaving(true);
            try {
                const { error } = await supabase
                    .from('meetings')
                    .update({ minutes: debouncedMinutes })
                    .eq('id', meeting.id);

                if (error) throw error;
                setMeeting({ ...meeting, minutes: debouncedMinutes });
            } catch (err) {
                console.error(err);
                toast.error("Failed to auto-save minutes");
            } finally {
                setIsSaving(false);
            }
        };

        autoSaveMinutes();
    }, [debouncedMinutes, meeting]);

    const handleSaveMinutes = async () => {
        if (!meeting) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('meetings')
                .update({ minutes })
                .eq('id', meeting.id);

            if (error) throw error;
            toast.success("Minutes saved successfully");
            setMeeting({ ...meeting, minutes });
        } catch (err) {
            console.error(err);
            toast.error("Failed to save minutes");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleAttendance = async (memberId: string) => {
        if (!meeting) return;

        const newAttendees = attendees.includes(memberId)
            ? attendees.filter(id => id !== memberId)
            : [...attendees, memberId];

        setAttendees(newAttendees); // Optimistic update

        try {
            const { error } = await supabase
                .from('meetings')
                .update({ attendees: newAttendees })
                .eq('id', meeting.id);

            if (error) throw error;
            toast.info("Attendance updated");
            setMeeting({ ...meeting, attendees: newAttendees });
        } catch (err) {
            console.error(err);
            setAttendees(attendees); // Revert on error
            toast.error("Failed to update attendance");
        }
    };

    const handleDelete = async () => {
        if (!meeting) return;
        try {
            const { error } = await supabase
                .from('meetings')
                .delete()
                .eq('id', meeting.id);

            if (error) throw error;
            toast.success("Meeting deleted successfully");
            navigate('/meetings');
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete meeting");
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading meeting details...</div>;
    if (!meeting) return <div className="p-8 text-center text-muted-foreground">Meeting not found.</div>;

    const isUpcoming = new Date(meeting.date) > new Date();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <Link to="/meetings" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Meetings
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-primary">{meeting.title}</h1>
                            <Badge variant={isUpcoming ? "default" : "secondary"}>
                                {isUpcoming ? "Upcoming" : "Past"}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(meeting.date), "PPP p")}
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {meeting.location}
                            </div>
                        </div>
                    </div>
                    {meeting.meeting_link && (
                        <Button className="gap-2" asChild>
                            <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                                Join Meeting
                            </a>
                        </Button>
                    )}

                    <div className="flex gap-2">
                        <MeetingForm
                            initialData={meeting}
                            onMeetingUpdated={(updated) => setMeeting(updated)}
                            trigger={
                                <Button variant="outline" className="gap-2">
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </Button>
                            }
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
                                        This action cannot be undone. This will permanently delete the meeting
                                        "{meeting.title}" and remove it from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>

            <Separator />

            <Tabs defaultValue="minutes" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 space-x-6">
                    <TabsTrigger
                        value="minutes"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Minutes
                    </TabsTrigger>
                    <TabsTrigger
                        value="attendance"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2"
                    >
                        <Users className="h-4 w-4 mr-2" />
                        Attendance
                    </TabsTrigger>
                    <TabsTrigger
                        value="agenda"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2"
                    >
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Agenda
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="minutes" className="mt-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-semibold">Meeting Minutes</h2>
                            {isSaving && <div className="flex items-center text-xs text-muted-foreground"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Saving...</div>}
                            {!isSaving && meeting?.minutes !== undefined && meeting.minutes === minutes && <div className="text-xs text-muted-foreground">All changes saved</div>}
                        </div>
                        <Button variant="outline" size="sm" className="gap-2" onClick={handleSaveMinutes} disabled={isSaving || meeting?.minutes === minutes}>
                            <Save className="h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                    <Textarea
                        placeholder="Start typing meeting minutes here..."
                        className="min-h-[400px] text-base leading-relaxed p-4"
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                    />
                </TabsContent>

                <TabsContent value="attendance" className="mt-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Attendance Tracking</h2>
                        <div className="text-sm text-muted-foreground">
                            {attendees.length} / {teamMembers.length} Present
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teamMembers.map(member => (
                            <div
                                key={member.id}
                                className={`flex justify-between items-center p-4 border rounded-lg transition-colors cursor-pointer ${attendees.includes(member.id) ? 'bg-primary/5 border-primary/50' : 'hover:bg-accent'
                                    }`}
                                onClick={() => toggleAttendance(member.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${attendees.includes(member.id) ? 'bg-primary' : 'bg-muted'}`} />
                                    <div>
                                        <div className="font-medium">{member.name}</div>
                                        <div className="text-xs text-muted-foreground">{member.role}</div>
                                    </div>
                                </div>
                                <div className={`text-xs font-semibold px-2 py-1 rounded ${attendees.includes(member.id)
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {attendees.includes(member.id) ? 'Present' : 'Absent'}
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="agenda" className="mt-6 space-y-4">
                    <h2 className="text-xl font-semibold">Meeting Agenda</h2>
                    <div className="p-6 border rounded-lg bg-slate-50 min-h-[200px] whitespace-pre-wrap leading-relaxed">
                        {meeting.agenda || "No agenda set for this meeting."}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
