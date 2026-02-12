import { MeetingList } from '@/features/meetings/MeetingList';

export default function Meetings() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Meetings</h1>
                    <p className="text-muted-foreground">Schedule and track society meetings, agendas, and minutes.</p>
                </div>
            </div>

            <MeetingList />
        </div>
    );
}
