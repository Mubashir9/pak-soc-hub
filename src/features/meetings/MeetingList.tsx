import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Meeting } from '@/types';
import { MeetingCard } from './MeetingCard';
import { MeetingForm } from './MeetingForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ListFilter } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MeetingListProps {
    eventId?: string;
}

export function MeetingList({ eventId }: MeetingListProps) {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

    useEffect(() => {
        const fetchMeetings = async () => {
            let query = supabase.from('meetings').select('*');

            if (eventId) {
                query = query.eq('event_id', eventId);
            }

            const { data, error } = await query.order('date', { ascending: false });

            if (error) {
                console.error("Error fetching meetings:", error);
            } else {
                setMeetings(data || []);
            }
            setLoading(false);
        };

        fetchMeetings();
    }, [eventId]);

    const filteredMeetings = useMemo(() => {
        let result = [...meetings];

        if (search) {
            result = result.filter(m =>
                m.title.toLowerCase().includes(search.toLowerCase()) ||
                m.location.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (filter === "upcoming") {
            result = result.filter(m => new Date(m.date) > new Date());
        } else if (filter === "past") {
            result = result.filter(m => new Date(m.date) <= new Date());
        }

        // Sort by date (descending for past, ascending for upcoming)
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return result;
    }, [meetings, search, filter]);

    if (loading) {
        return <div className="p-8 text-center">Loading meetings...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search meetings..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <ListFilter className="h-4 w-4" />
                                {filter === "all" ? "All Meetings" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setFilter("all")}>All Meetings</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter("upcoming")}>Upcoming</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter("past")}>Past</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <MeetingForm onMeetingCreated={(newMeeting) => setMeetings([newMeeting, ...meetings])} />
                </div>
            </div>

            {filteredMeetings.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
                    No meetings found matching your criteria.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMeetings.map(meeting => (
                        <MeetingCard key={meeting.id} meeting={meeting} />
                    ))}
                </div>
            )}
        </div>
    );
}
