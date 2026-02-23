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
import type { BugIssue, TeamMember } from '@/types';

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Issue title must be at least 2 characters.",
    }),
    status: z.enum(["open", "in_progress", "resolved", "closed"]),
    reported_by: z.string().min(1, { message: "Reporter is required." }),
    description: z.string().min(10, { message: "Please provide a detailed description." }),
    priority: z.enum(["low", "medium", "high", "critical"]),
});

interface CreateBugIssueDialogProps {
    bugToEdit?: BugIssue;
    trigger?: React.ReactNode;
    onBugCreated?: (bug: BugIssue) => void;
    onBugUpdated?: (bug: BugIssue) => void;
}

export function CreateBugIssueDialog({
    bugToEdit,
    trigger,
    onBugCreated,
    onBugUpdated
}: CreateBugIssueDialogProps) {
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
            title: bugToEdit?.title || "",
            status: bugToEdit?.status || "open",
            reported_by: bugToEdit?.reported_by || "",
            description: bugToEdit?.description || "",
            priority: bugToEdit?.priority || "medium",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setOpen(false); // Close early for better UX

        const bugData = {
            title: values.title,
            status: values.status,
            reported_by: values.reported_by,
            priority: values.priority,
            description: values.description,
        };

        if (bugToEdit) {
            const { data, error } = await supabase
                .from('bugs_and_issues')
                .update(bugData)
                .eq('id', bugToEdit.id)
                .select()
                .single();

            if (error) {
                console.error("Error updating issue:", error);
                return;
            }
            if (onBugUpdated) onBugUpdated(data as BugIssue);
        } else {
            const { data, error } = await supabase
                .from('bugs_and_issues')
                .insert(bugData)
                .select()
                .single();

            if (error) {
                console.error("Error reporting issue:", error);
                return;
            }
            if (onBugCreated) onBugCreated(data as BugIssue);
        }

        form.reset();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Report Issue
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{bugToEdit ? "Edit Issue" : "Report a Bug or Issue"}</DialogTitle>
                    <DialogDescription>
                        {bugToEdit ? "Update issue details." : "Describe the bug you encountered to help the developers trace it."}
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
                                        <Input placeholder="Cannot login with email..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reported_by"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Reported By</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? teamMembers.find(member => member.name === field.value)?.name || field.value
                                                        : "Select reporter"}
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
                                                        {teamMembers.map((member) => (
                                                            <CommandItem
                                                                value={member.name}
                                                                key={member.id}
                                                                onSelect={() => {
                                                                    form.setValue("reported_by", member.name);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        member.name === field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {member.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
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
                                                <SelectItem value="open">Open</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="resolved">Resolved</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                                <SelectItem value="critical">Critical</SelectItem>
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
                                            placeholder="Steps to reproduce..."
                                            className="resize-none min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">{bugToEdit ? "Save Changes" : "Report Issue"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
