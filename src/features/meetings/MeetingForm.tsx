import { useState, useEffect } from 'react';
import { mockApi, MOCK_TEAM, MOCK_EVENTS, type Meeting } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface MeetingFormProps {
    onMeetingCreated?: (meeting: Meeting) => void;
    onMeetingUpdated?: (meeting: Meeting) => void;
    trigger?: React.ReactNode;
    initialData?: Meeting;
}

export function MeetingForm({ onMeetingCreated, onMeetingUpdated, trigger, initialData }: MeetingFormProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        date: initialData?.date || '',
        location: initialData?.location || '',
        meeting_link: initialData?.meeting_link || '',
        agenda: initialData?.agenda || '',
        event_id: initialData?.event_id || 'none',
        attendees: initialData?.attendees || [],
    });

    // Reset form when opening if not editing, or update if initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                date: initialData.date,
                location: initialData.location,
                meeting_link: initialData.meeting_link || '',
                agenda: initialData.agenda || '',
                event_id: initialData.event_id || 'none',
                attendees: initialData.attendees,
            });
        }
    }, [initialData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.date || !formData.location) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            if (initialData) {
                const updatedMeeting = await mockApi.updateMeeting({
                    ...initialData,
                    title: formData.title,
                    date: new Date(formData.date).toISOString(),
                    location: formData.location,
                    meeting_link: formData.meeting_link,
                    agenda: formData.agenda,
                    attendees: formData.attendees,
                    event_id: formData.event_id === 'none' ? undefined : formData.event_id,
                });
                toast.success("Meeting updated successfully");
                onMeetingUpdated?.(updatedMeeting);
            } else {
                const newMeeting = await mockApi.createMeeting({
                    title: formData.title,
                    date: new Date(formData.date).toISOString(),
                    location: formData.location,
                    meeting_link: formData.meeting_link,
                    agenda: formData.agenda,
                    attendees: formData.attendees,
                    event_id: formData.event_id === 'none' ? undefined : formData.event_id,
                });
                toast.success("Meeting scheduled successfully");
                onMeetingCreated?.(newMeeting);
            }
            setOpen(false);
            if (!initialData) {
                setFormData({
                    title: '',
                    date: '',
                    location: '',
                    meeting_link: '',
                    agenda: '',
                    event_id: 'none',
                    attendees: [],
                });
            }
        } catch (error) {
            toast.error("Failed to schedule meeting");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Schedule Meeting
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{initialData ? "Edit Meeting" : "Schedule New Meeting"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Meeting Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Weekly Sync"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date & Time *</Label>
                                <Input
                                    id="date"
                                    type="datetime-local"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    placeholder="e.g. Zoom, Room 302"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="link">Meeting Link (Optional)</Label>
                            <Input
                                id="link"
                                placeholder="https://zoom.us/j/..."
                                value={formData.meeting_link}
                                onChange={e => setFormData({ ...formData, meeting_link: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="event">Associated Event</Label>
                            <Select
                                value={formData.event_id}
                                onValueChange={val => setFormData({ ...formData, event_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select event" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {MOCK_EVENTS.map(event => (
                                        <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Attendees</Label>
                            <div className="flex flex-wrap gap-2 p-2 border rounded-md max-h-32 overflow-y-auto">
                                {MOCK_TEAM.map(member => (
                                    <label key={member.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-secondary p-1 rounded transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.attendees.includes(member.id)}
                                            onChange={e => {
                                                const newAttendees = e.target.checked
                                                    ? [...formData.attendees, member.id]
                                                    : formData.attendees.filter(id => id !== member.id);
                                                setFormData({ ...formData, attendees: newAttendees });
                                            }}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        {member.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="agenda">Agenda</Label>
                            <Textarea
                                id="agenda"
                                placeholder="1. Topic one..."
                                className="min-h-[100px]"
                                value={formData.agenda}
                                onChange={e => setFormData({ ...formData, agenda: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : (initialData ? "Save Changes" : "Schedule Meeting")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
