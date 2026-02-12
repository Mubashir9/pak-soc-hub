import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Event } from '@/lib/mockData';

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Event name must be at least 2 characters.",
    }),
    event_type: z.enum(["O-Week", "Basant", "SRC Festival", "Coke Studio", "General"]),
    date_start: z.date(),
    location: z.string().min(2, {
        message: "Location must be at least 2 characters.",
    }),
    budget_total: z.coerce.number().min(1, {
        message: "Budget must be at least 1.",
    }),
    description: z.string().optional(),
    status: z.enum(["planning", "active", "completed", "cancelled"]).optional(),
});

interface CreateEventDialogProps {
    eventToEdit?: Event;
    trigger?: React.ReactNode;
    onEventCreated?: (event: Event) => void;
    onEventUpdated?: (event: Event) => void;
}

export function CreateEventDialog({
    eventToEdit,
    trigger,
    onEventCreated,
    onEventUpdated
}: CreateEventDialogProps) {
    const [open, setOpen] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: eventToEdit?.name || "",
            event_type: eventToEdit?.event_type || "General",
            location: eventToEdit?.location || "",
            budget_total: eventToEdit?.budget_total || 0,
            description: eventToEdit?.description || "",
            date_start: eventToEdit ? new Date(eventToEdit.date_start) : undefined,
            status: eventToEdit?.status || "planning",
        },
    });

    const calculateStatus = (date: Date): "planning" | "active" | "completed" => {
        const now = new Date();
        const eventDate = new Date(date);

        // Reset times to compare dates only
        now.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);

        if (eventDate > now) return "planning";
        if (eventDate.getTime() === now.getTime()) return "active";
        return "completed";
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (eventToEdit) {
            const updatedEvent: Event = {
                ...eventToEdit,
                name: values.name,
                event_type: values.event_type as Event['event_type'],
                date_start: values.date_start.toISOString(),
                date_end: values.date_start.toISOString(),
                location: values.location,
                description: values.description || "",
                budget_total: values.budget_total,
                status: values.status as Event['status'], // Manual override
            };
            if (onEventUpdated) {
                onEventUpdated(updatedEvent);
            }
        } else {
            // Auto-calculate status for new events
            const autoStatus = calculateStatus(values.date_start);

            const newEvent: Event = {
                id: Math.random().toString(36).substr(2, 9),
                name: values.name,
                event_type: values.event_type as Event['event_type'],
                status: autoStatus,
                date_start: values.date_start.toISOString(),
                date_end: values.date_start.toISOString(),
                location: values.location,
                budget_total: values.budget_total,
                budget_spent: 0,
                created_at: new Date().toISOString(),
                description: values.description || "",
            };
            if (onEventCreated) {
                onEventCreated(newEvent);
            }
        }

        setOpen(false);
        form.reset();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" /> Create Event
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{eventToEdit ? "Edit Event" : "Create New Event"}</DialogTitle>
                    <DialogDescription>
                        {eventToEdit
                            ? "Make changes to the event details here. Click save when you're done."
                            : "Enter detailed information for the new event here. Click save when you're done."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Annual Gala" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="event_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="General">General</SelectItem>
                                                <SelectItem value="O-Week">O-Week</SelectItem>
                                                <SelectItem value="Basant">Basant</SelectItem>
                                                <SelectItem value="SRC Festival">SRC Festival</SelectItem>
                                                <SelectItem value="Coke Studio">Coke Studio</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {eventToEdit && (
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="planning">Planning</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <FormField
                                control={form.control}
                                name="date_start"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Main Hall" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="budget_total"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Budget ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            {...field}
                                            value={field.value ? String(field.value) : ""}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Brief description of the event..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">{eventToEdit ? "Save Changes" : "Create Event"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
