import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, Calendar, Handshake, Archive, Bug, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NAV_ITEMS = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Events', href: '/events', icon: CalendarDays },
    { name: 'Meetings', href: '/meetings', icon: Calendar },
    { name: 'Sponsors', href: '/sponsors', icon: Handshake },
    { name: 'Budget', href: '/budget', icon: Banknote },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Archive', href: '/archive', icon: Archive },
    { name: 'Bugs & Issues', href: '/bugs', icon: Bug },
];

export function Sidebar({ className }: { className?: string }) {
    return (
        <div className={cn("pb-12 min-h-screen border-r bg-background", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="mb-2 px-4 flex items-center gap-2">
                        <img src="/pakSocMascot.png" alt="PakSoc Mascot" className="h-8 w-8 object-contain" />
                        <h2 className="text-lg font-semibold tracking-tight text-primary">
                            PakSoc
                        </h2>
                    </div>
                    <div className="space-y-1">
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                        isActive ? "bg-accent/50 text-accent-foreground" : "transparent"
                                    )
                                }
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.name}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
