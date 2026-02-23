import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar, NAV_ITEMS } from './Sidebar';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '../../context/AuthContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AppLayout() {
    const { user, signOut } = useAuth();

    // Fallback initials if name is missing
    const getInitials = () => {
        if (!user || (!user.user_metadata?.full_name && !user.email)) return 'U';
        if (user.user_metadata?.full_name) {
            const names = user.user_metadata.full_name.split(' ');
            if (names.length >= 2) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
            return names[0][0].toUpperCase();
        }
        return user.email![0].toUpperCase();
    };

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0">
                <Sidebar />
            </div>

            {/* Mobile Header & Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4 md:px-6 justify-between">
                    <div className="flex items-center md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="mr-4">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64 p-0">
                                <div className="py-4">
                                    <h2 className="mb-2 px-6 text-lg font-semibold tracking-tight text-primary">PakSoc</h2>
                                    <nav className="space-y-1 px-2">
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
                                    </nav>
                                </div>
                            </SheetContent>
                        </Sheet>
                        <h1 className="text-lg font-bold text-primary">PakSoc</h1>
                    </div>

                    {/* Right side (User Profile, etc) */}
                    <div className="flex items-center gap-4 ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1 h-10 rounded-full border border-gray-200">
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">{getInitials()}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium mr-1 hidden sm:inline-block">
                                        {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || 'User'}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut()} className="text-red-600 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 bg-secondary/20">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
