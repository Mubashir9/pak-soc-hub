
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { ContentIdea } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    description: z.string().optional(),
    platform: z.enum(["instagram", "tiktok", "facebook", "general"]),
    status: z.enum(["idea", "planned", "in_production", "posted"]),
    scheduled_date: z.date().optional(),
});

interface ContentFormProps {
    eventId: string;
    contentToEdit?: ContentIdea;
    trigger?: React.ReactNode;
    onContentCreated?: (content: ContentIdea) => void;
    onContentUpdated?: (content: ContentIdea) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ContentForm({
    eventId,
    contentToEdit,
    trigger,
    onContentCreated,
    onContentUpdated,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}: ContentFormProps) {
    const [isInternalOpen, setIsInternalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const open = controlledOpen ?? isInternalOpen;
    const setOpen = setControlledOpen ?? setIsInternalOpen;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            platform: "instagram",
            status: "idea",
        },
    });

    useEffect(() => {
        if (contentToEdit) {
            form.reset({
                title: contentToEdit.title,
                description: contentToEdit.description || "",
                platform: contentToEdit.platform,
                status: contentToEdit.status,
                scheduled_date: contentToEdit.scheduled_date ? new Date(contentToEdit.scheduled_date) : undefined,
            });
        } else {
            form.reset({
                title: "",
                description: "",
                platform: "instagram",
                status: "idea",
            });
        }
    }, [contentToEdit, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const contentData = {
                event_id: eventId,
                title: values.title,
                description: values.description,
                platform: values.platform,
                status: values.status,
                scheduled_date: values.scheduled_date?.toISOString(),
            };

            if (contentToEdit) {
                const { data, error } = await supabase
                    .from('content_ideas')
                    .update(contentData)
                    .eq('id', contentToEdit.id)
                    .select()
                    .single();

                if (error) throw error;
                toast.success("Content updated successfully");
                if (onContentUpdated) onContentUpdated(data as ContentIdea);
            } else {
                const { data, error } = await supabase
                    .from('content_ideas')
                    .insert(contentData)
                    .select()
                    .single();

                if (error) throw error;
                toast.success("Content created successfully");
                if (onContentCreated) onContentCreated(data as ContentIdea);
            }
            setOpen(false);
            form.reset();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save content");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{contentToEdit ? "Edit Content" : "New Content Idea"}</DialogTitle>
                    <DialogDescription>
                        {contentToEdit ? "Update content details." : "Add a new content idea to the pipeline."}
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
                                        <Input placeholder="e.g., O-Week Teaser Reel" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="platform"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Platform</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select platform" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="instagram">Instagram</SelectItem>
                                                <SelectItem value="tiktok">TikTok</SelectItem>
                                                <SelectItem value="facebook">Facebook</SelectItem>
                                                <SelectItem value="general">General</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                                <SelectItem value="idea">Idea</SelectItem>
                                                <SelectItem value="planned">Planned</SelectItem>
                                                <SelectItem value="in_production">In Production</SelectItem>
                                                <SelectItem value="posted">Posted</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="scheduled_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Scheduled Date</FormLabel>
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
                                                    date < new Date(new Date().setHours(0, 0, 0, 0))
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
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
                                            placeholder="Brief description of the content idea..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {contentToEdit ? "Update Content" : "Create Content"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
