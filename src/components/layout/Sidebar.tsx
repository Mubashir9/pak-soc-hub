import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, CheckSquare, Users, Calendar, Handshake, Archive, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const NAV_ITEMS = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Events', href: '/events', icon: CalendarDays },
    { name: 'Meetings', href: '/meetings', icon: Calendar },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Sponsors', href: '/sponsors', icon: Handshake },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Archive', href: '/archive', icon: Archive },
];

export function Sidebar({ className }: { className?: string }) {
    return (
        <div className={cn("pb-12 min-h-screen border-r bg-background", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-primary">
                        PakSoc
                    </h2>
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
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Settings
                    </h2>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            General
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
