
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Plus, GripVertical, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { supabase } from "@/lib/supabase";
import type { ContentIdea } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentForm } from "./ContentForm";
import { toast } from "sonner";

interface ContentBoardProps {
    eventId: string;
}

const COLUMNS = [
    { id: "idea", title: "Idea", color: "bg-yellow-500/10 text-yellow-500" },
    { id: "planned", title: "Planned", color: "bg-blue-500/10 text-blue-500" },
    { id: "in_production", title: "In Production", color: "bg-purple-500/10 text-purple-500" },
    { id: "posted", title: "Posted", color: "bg-green-500/10 text-green-500" },
];

export function ContentBoard({ eventId }: ContentBoardProps) {
    const [content, setContent] = useState<ContentIdea[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    const loadContent = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('content_ideas')
                .select('*')
                .eq('event_id', eventId);

            if (error) throw error;
            setContent(data || []);
        } catch (error) {
            console.error("Failed to load content", error);
            toast.error("Failed to load content");
        } finally {
            setLoading(false);
        }
    };

    const handleContentCreated = (newContent: ContentIdea) => {
        setContent([...content, newContent]);
    };

    const handleContentUpdated = (updatedContent: ContentIdea) => {
        setContent(content.map(c => c.id === updatedContent.id ? updatedContent : c));
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId as ContentIdea['status'];
        const itemToUpdate = content.find(c => c.id === draggableId);

        if (itemToUpdate) {
            // Optimistic update
            const updatedItem = { ...itemToUpdate, status: newStatus };
            setContent(content.map(c => c.id === draggableId ? updatedItem : c));

            try {
                const { error } = await supabase
                    .from('content_ideas')
                    .update({ status: newStatus })
                    .eq('id', draggableId);

                if (error) throw error;
                toast.success(`Moved to ${COLUMNS.find(c => c.id === newStatus)?.title}`);
            } catch (error) {
                console.error("Failed to update status", error);
                toast.error("Failed to update status");
                // Revert
                loadContent();
            }
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'instagram': return "📸"; // Replace with Lucide icon if preferred
            case 'tiktok': return "🎵";
            case 'facebook': return "👍";
            default: return "📝";
        }
    };

    if (loading) {
        return <div>Loading content board...</div>;
    }

    return (
        <div className="h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Content Pipeline</h2>
                <ContentForm
                    eventId={eventId}
                    onContentCreated={handleContentCreated}
                    trigger={
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Idea
                        </Button>
                    }
                />
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-300px)] min-h-[500px]">
                    {COLUMNS.map(column => (
                        <div key={column.id} className="flex flex-col h-full bg-muted/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium">{column.title}</h3>
                                <Badge variant="secondary" className="ml-2">
                                    {content.filter(c => c.status === column.id).length}
                                </Badge>
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="flex-1 space-y-3"
                                    >
                                        {content
                                            .filter(c => c.status === column.id)
                                            .map((item, index) => (
                                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <Card className="cursor-grab hover:shadow-md transition-shadow">
                                                                <CardHeader className="p-3 pb-0 space-y-0">
                                                                    <div className="flex justify-between items-start">
                                                                        <Badge variant="outline" className="mb-2">
                                                                            {getPlatformIcon(item.platform)} {item.platform}
                                                                        </Badge>
                                                                        <ContentForm
                                                                            eventId={eventId}
                                                                            contentToEdit={item}
                                                                            onContentUpdated={handleContentUpdated}
                                                                            trigger={
                                                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                                    <span className="sr-only">Edit</span>
                                                                                    <GripVertical className="h-3 w-3" />
                                                                                </Button>
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <CardTitle className="text-sm font-medium leading-tight">
                                                                        {item.title}
                                                                    </CardTitle>
                                                                </CardHeader>
                                                                <CardContent className="p-3 pt-2">
                                                                    {item.scheduled_date && (
                                                                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                                                                            <CalendarIcon className="mr-1 h-3 w-3" />
                                                                            {format(new Date(item.scheduled_date), "MMM d")}
                                                                        </div>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}
