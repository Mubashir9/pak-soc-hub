import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, ArrowRight, DollarSign } from "lucide-react";
import type { Event } from "@/lib/mockData";
import { StatusBadge } from "@/components/common/StatusBadge";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface EventCardProps {
    event: Event;
}

export function EventCard({ event }: EventCardProps) {
    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="secondary" className="mb-2">{event.event_type}</Badge>
                        <CardTitle className="text-xl text-primary">{event.name}</CardTitle>
                    </div>
                    <StatusBadge status={event.status} />
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4 text-sm">
                <div className="flex items-center text-muted-foreground">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {format(new Date(event.date_start), "PPP")}
                </div>
                <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                </div>
                <div className="flex items-center text-muted-foreground">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>${event.budget_spent} / ${event.budget_total}</span>
                </div>
                {event.description && (
                    <p className="line-clamp-2 text-muted-foreground mt-2">
                        {event.description}
                    </p>
                )}
            </CardContent>
            <CardFooter className="pt-2">
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                    <Link to={`/events/${event.id}`}>
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
