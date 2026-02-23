import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import type { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
    tasks: Task[];
    onTaskUpdated?: (task: Task) => void;
    onTaskDeleted?: (taskId: string) => void;
    eventMap?: Record<string, string>; // eventId -> eventName
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-100' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50/50' },
    { id: 'completed', title: 'Completed', color: 'bg-green-50/50' },
];

export function KanbanBoard({ tasks: initialTasks, onTaskUpdated, onTaskDeleted, eventMap }: KanbanBoardProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);


    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Logic for reordering/moving
        const newStatus = destination.droppableId as TaskStatus;

        // Update local state optimistic
        const updatedTasks = tasks.map(t =>
            t.id === draggableId ? { ...t, status: newStatus } : t
        );

        setTasks(updatedTasks);

        // Callback to parent/API
        if (source.droppableId !== destination.droppableId) {
            const movedTask = updatedTasks.find(t => t.id === draggableId);
            if (movedTask) {
                onTaskUpdated?.(movedTask);
            }
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col md:flex-row gap-4 h-full min-h-[500px] overflow-x-auto pb-4">
                {COLUMNS.map((col) => {
                    const colTasks = tasks.filter((t) => t.status === col.id);

                    return (
                        <div key={col.id} className={cn("flex-1 min-w-[280px] rounded-lg p-2 md:p-4", col.color)}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                                    {col.title}
                                </h3>
                                <span className="text-xs font-medium bg-background px-2 py-1 rounded-full border shadow-sm">
                                    {colTasks.length}
                                </span>
                            </div>

                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={cn(
                                            "min-h-[200px] transition-colors rounded-md",
                                            snapshot.isDraggingOver ? "bg-black/5" : ""
                                        )}
                                    >
                                        {colTasks.map((task, index) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                index={index}
                                                onTaskUpdated={onTaskUpdated}
                                                onTaskDeleted={onTaskDeleted}
                                                eventName={eventMap?.[task.event_id]}
                                            />

                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}
