
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/mockData';

import { Calendar, User, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';

interface TaskCardProps {
    task: Task;
    index: number;
    onTaskUpdated?: (task: Task) => void;
    eventName?: string;
}

export function TaskCard({ task, index, onTaskUpdated, eventName }: TaskCardProps) {
    const isHighPriority = task.priority === 'high';

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn("mb-3", snapshot.isDragging && "opacity-75")}
                    style={provided.draggableProps.style}
                >
                    <Card className={cn(
                        "cursor-grab active:cursor-grabbing hover:shadow-sm border-l-4",
                        isHighPriority ? "border-l-red-500" :
                            task.priority === 'medium' ? "border-l-orange-400" : "border-l-slate-300"
                    )}>
                        <CardHeader className="p-3 pb-0 space-y-0">
                            <div className="flex gap-2">
                                {eventName && (
                                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5 mb-1 max-w-[100px] truncate">
                                        {eventName}
                                    </Badge>
                                )}
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 mb-1">
                                    {task.category}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-start gap-2">
                                <CardTitle className="text-sm font-medium leading-tight">
                                    {task.title}
                                </CardTitle>
                                <CreateTaskDialog
                                    taskToEdit={task}
                                    onTaskUpdated={onTaskUpdated}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                                            aria-label="Edit task"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                    }
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-2 text-xs text-muted-foreground">
                            <div className="flex items-center justify-between mt-2">
                                {task.due_date && (
                                    <div className={cn("flex items-center", new Date(task.due_date) < new Date() ? "text-red-500" : "")}>
                                        <Calendar className="mr-1 h-3 w-3" />
                                        {format(new Date(task.due_date), "MMM d")}
                                    </div>
                                )}
                                <div className="flex items-center ml-auto">
                                    <User className="mr-1 h-3 w-3" />
                                    <span>Unassigned</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </Draggable>
    );
}
