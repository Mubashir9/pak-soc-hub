import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Check, ChevronsUpDown } from 'lucide-react';

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
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import type { Task, TeamMember } from '@/types';

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Task title must be at least 2 characters.",
    }),
    status: z.enum(["todo", "in_progress", "completed"]),
    assigned_to: z.array(z.string()).optional(),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]),
    category: z.enum(["general", "content", "logistics", "food", "props", "sponsors"]),
});

interface CreateTaskDialogProps {
    eventId?: string; // Optional if editing
    taskToEdit?: Task;
    trigger?: React.ReactNode;
    onTaskCreated?: (task: Task) => void;
    onTaskUpdated?: (task: Task) => void;
}

export function CreateTaskDialog({
    eventId,
    taskToEdit,
    trigger,
    onTaskCreated,
    onTaskUpdated
}: CreateTaskDialogProps) {
    const [open, setOpen] = useState(false);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        async function fetchTeam() {
            const { data } = await supabase.from('team_members').select('*').order('name');
            if (data) setTeamMembers(data);
        }
        fetchTeam();
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: taskToEdit?.title || "",
            status: taskToEdit?.status || "todo",
            assigned_to: taskToEdit?.assigned_to && taskToEdit.assigned_to !== "Unassigned"
                ? taskToEdit.assigned_to.split(', ')
                : [],
            description: taskToEdit?.description || "",
            priority: taskToEdit?.priority || "medium",
            category: taskToEdit?.category || "general",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setOpen(false); // Close early for better UX, or keep open if we want to handle errors better

        const taskData = {
            title: values.title,
            status: values.status,
            assigned_to: values.assigned_to && values.assigned_to.length > 0 ? values.assigned_to.join(', ') : "Unassigned",
            priority: values.priority,
            category: values.category,
            description: values.description,
        };

        if (taskToEdit) {
            const { data, error } = await supabase
                .from('tasks')
                .update(taskData)
                .eq('id', taskToEdit.id)
                .select()
                .single();

            if (error) {
                console.error("Error updating task:", error);
                return;
            }
            if (onTaskUpdated) onTaskUpdated(data as Task);
        } else if (eventId) {
            const { data, error } = await supabase
                .from('tasks')
                .insert({
                    ...taskData,
                    event_id: eventId,
                })
                .select()
                .single();

            if (error) {
                console.error("Error creating task:", error);
                return;
            }
            if (onTaskCreated) onTaskCreated(data as Task);
        }

        form.reset();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Task
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{taskToEdit ? "Edit Task" : "Add New Task"}</DialogTitle>
                    <DialogDescription>
                        {taskToEdit ? "Update task details." : "Create a new task for this event."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Design posters" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="assigned_to"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Assignees</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between h-auto min-h-[2.5rem] py-2",
                                                        !field.value?.length && "text-muted-foreground"
                                                    )}
                                                >
                                                    <div className="flex flex-wrap gap-1">
                                                        {field.value && field.value.length > 0 ? (
                                                            field.value.map((val) => (
                                                                <Badge variant="secondary" key={val} className="mr-1">
                                                                    {val}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            "Select team members"
                                                        )}
                                                    </div>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[375px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Search team members..." />
                                                <CommandList>
                                                    <CommandEmpty>No members found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {teamMembers.map((member) => {
                                                            const isSelected = field.value?.includes(member.name);
                                                            return (
                                                                <CommandItem
                                                                    key={member.id}
                                                                    value={member.name}
                                                                    onSelect={() => {
                                                                        const updatedValue = isSelected
                                                                            ? (field.value || []).filter((val) => val !== member.name)
                                                                            : [...(field.value || []), member.name];
                                                                        field.onChange(updatedValue);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            isSelected ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {member.name}
                                                                </CommandItem>
                                                            );
                                                        })}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                            <SelectItem value="todo">To Do</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="general">General</SelectItem>
                                                <SelectItem value="content">Content</SelectItem>
                                                <SelectItem value="logistics">Logistics</SelectItem>
                                                <SelectItem value="food">Food</SelectItem>
                                                <SelectItem value="props">Props</SelectItem>
                                                <SelectItem value="sponsors">Sponsors</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Task details..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">{taskToEdit ? "Save Changes" : "Create Task"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
