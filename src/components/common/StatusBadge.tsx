import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";



interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const normalizedStatus = status.toLowerCase();


    let bgClass = "";

    switch (normalizedStatus) {
        case 'planning':
        case 'todo':
            bgClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200";
            break;
        case 'active':
        case 'in_progress':
            bgClass = "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200";
            break;
        case 'completed':
            bgClass = "bg-green-100 text-green-800 hover:bg-green-200 border-green-200";
            break;
        case 'cancelled':
            bgClass = "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200";
            break;
        case 'high':
            bgClass = "bg-red-100 text-red-800 hover:bg-red-200 border-red-200";
            break;
        case 'medium':
            bgClass = "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200";
            break;
        case 'low':
            bgClass = "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200";
            break;
        default:
            bgClass = "bg-gray-100 text-gray-800";
    }

    return (
        <Badge variant="outline" className={cn("capitalize font-normal", bgClass, className)}>
            {status.replace('_', ' ')}
        </Badge>
    );
}
