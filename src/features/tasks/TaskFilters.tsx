import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { TeamMember, Event } from "@/lib/mockData";

export interface TaskFiltersState {
    assignee: string | "all";
    priority: string | "all";
    eventId: string | "all";
}

interface TaskFiltersProps {
    filters: TaskFiltersState;
    setFilters: (filters: TaskFiltersState) => void;
    teamMembers: TeamMember[];
    events?: Event[]; // Optional, if we want to filter by event
    showEventFilter?: boolean;
}

export function TaskFilters({
    filters,
    setFilters,
    teamMembers,
    events,
    showEventFilter = false,
}: TaskFiltersProps) {
    const handleFilterChange = (key: keyof TaskFiltersState, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        setFilters({
            assignee: "all",
            priority: "all",
            eventId: "all", // Keep this 'all' even if hidden, standardizes state
        });
    };

    const hasActiveFilters = filters.assignee !== "all" || filters.priority !== "all" || (showEventFilter && filters.eventId !== "all");

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            {showEventFilter && events && (
                <Select
                    value={filters.eventId}
                    onValueChange={(val) => handleFilterChange("eventId", val)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Events" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                                {event.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <Select
                value={filters.assignee}
                onValueChange={(val) => handleFilterChange("assignee", val)}
            >
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="All Assignees" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                            {member.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filters.priority}
                onValueChange={(val) => handleFilterChange("priority", val)}
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Any Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 lg:px-3">
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            )}
        </div>
    );
}
