import { useState, useEffect } from "react";
import { mockApi, type Event } from "@/lib/mockData";
import { EventCard } from "@/components/events/EventCard";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Events() {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        mockApi.getEvents().then((data) => {
            setEvents(data);
            setFilteredEvents(data);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        let result = events;

        if (searchQuery) {
            result = result.filter((event) =>
                event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter && statusFilter !== "all") {
            result = result.filter((event) => event.status === statusFilter);
        }

        setFilteredEvents(result);
    }, [searchQuery, statusFilter, events]);

    const addNewEvent = (newEvent: Event) => {
        setEvents([newEvent, ...events]);
        // Also update filtered events if needed, or rely on useEffect dependncy on 'events' which is already there
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Events</h1>
                    <p className="text-muted-foreground">Manage and track all society events</p>
                </div>
                <CreateEventDialog onEventCreated={addNewEvent} />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search events..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        aria-label="Search events"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[200px] bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                    {filteredEvents.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No events found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
