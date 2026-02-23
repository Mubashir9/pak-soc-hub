import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { TeamMember } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Mail, Phone, Award } from 'lucide-react';

export default function Team() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            const { data, error } = await supabase.from('team_members').select('*');
            if (error) {
                console.error("Error fetching team members:", error);
            } else {
                setTeamMembers(data || []);
            }
            setLoading(false);
        };
        fetchTeam();
    }, []);

    if (loading) return <div className="p-8">Loading team...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team</h1>
                    <p className="text-muted-foreground mt-1">Meet the PakSoc executive team</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member) => (
                    <Card key={member.id} className="overflow-hidden">
                        <CardHeader className="bg-slate-100/50 dark:bg-slate-800/50 pb-8 relative">

                            <div className="flex justify-center">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                                    <AvatarImage src={member.avatar} alt={member.name} />
                                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center pt-4 space-y-4">
                            <div>
                                <CardTitle className="text-xl">{member.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>

                            <div className="space-y-2 text-sm text-left px-2">
                                <div className="flex items-center gap-3 text-muted-foreground p-2 hover:bg-slate-50 rounded-md transition-colors">
                                    <Mail className="h-4 w-4 text-primary" />
                                    <a href={`mailto:${member.email}`} className="hover:underline text-foreground">
                                        {member.email}
                                    </a>
                                </div>
                                {member.phone && (
                                    <div className="flex items-center gap-3 text-muted-foreground p-2 hover:bg-slate-50 rounded-md transition-colors">
                                        <Phone className="h-4 w-4 text-primary" />
                                        <span>{member.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-muted-foreground p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors">
                                    <Award className="h-4 w-4 text-primary" />
                                    <span>{member.role}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
