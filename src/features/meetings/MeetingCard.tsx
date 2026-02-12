import { format } from 'date-fns';
import { Calendar, MapPin, ExternalLink, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Meeting } from '@/lib/mockData';
import { Link } from 'react-router-dom';

interface MeetingCardProps {
    meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
    const isUpcoming = new Date(meeting.date) > new Date();

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl font-bold leading-tight">{meeting.title}</CardTitle>
                    <Badge variant={isUpcoming ? "default" : "secondary"}>
                        {isUpcoming ? "Upcoming" : "Past"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(meeting.date), "PPP p")}
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {meeting.location}
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {meeting.attendees.length} Attendees
                    </div>
                </div>

                {meeting.agenda && (
                    <div className="text-sm line-clamp-2 italic text-muted-foreground bg-secondary/50 p-2 rounded">
                        <span className="font-semibold block not-italic mb-1">Agenda:</span>
                        {meeting.agenda}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex gap-2 pt-0">
                {meeting.meeting_link && (
                    <Button variant="outline" size="sm" className="flex-1 gap-1" asChild>
                        <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                            Join
                        </a>
                    </Button>
                )}
                <Button size="sm" className="flex-1 gap-1" asChild>
                    <Link to={`/meetings/${meeting.id}`}>
                        <FileText className="h-3 w-3" />
                        Details
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
