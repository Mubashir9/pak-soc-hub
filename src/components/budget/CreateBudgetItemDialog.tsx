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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import type { BudgetItem } from "@/lib/mockData";
import { Plus } from "lucide-react";

const formSchema = z.object({
    description: z.string().min(2, "Description must be at least 2 characters."),
    category: z.string().min(1, "Category is required."),
    estimated_cost: z.coerce.number().min(0, "Cost cannot be negative."),
    actual_cost: z.coerce.number().min(0, "Cost cannot be negative."),
});

interface CreateBudgetItemDialogProps {
    eventId: string;
    itemToEdit?: BudgetItem;
    trigger?: React.ReactNode;
    onItemCreated?: (item: BudgetItem) => void;
    onItemUpdated?: (item: BudgetItem) => void;
}

export function CreateBudgetItemDialog({
    eventId,
    itemToEdit,
    trigger,
    onItemCreated,
    onItemUpdated
}: CreateBudgetItemDialogProps) {
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            description: "",
            category: "General",
            estimated_cost: 0,
            actual_cost: 0,
        },
    });

    useEffect(() => {
        if (itemToEdit) {
            form.reset({
                description: itemToEdit.description,
                category: itemToEdit.category,
                estimated_cost: itemToEdit.estimated_cost,
                actual_cost: itemToEdit.actual_cost,
            });
        } else {
            form.reset({
                description: "",
                category: "General",
                estimated_cost: 0,
                actual_cost: 0,
            });
        }
    }, [itemToEdit, form, open]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        const newItem: BudgetItem = {
            id: itemToEdit ? itemToEdit.id : Math.random().toString(36).substr(2, 9),
            event_id: eventId,
            description: values.description,
            category: values.category,
            estimated_cost: values.estimated_cost,
            actual_cost: values.actual_cost,
        };

        if (itemToEdit) {
            onItemUpdated?.(newItem);
        } else {
            onItemCreated?.(newItem);
        }

        setOpen(false);
        form.reset();
    }

    const CATEGORIES = ["General", "Food", "Marketing", "Logistics", "Venue", "Equipment", "Sponsors"];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Expense
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{itemToEdit ? "Edit Budget Item" : "Add Budget Item"}</DialogTitle>
                    <DialogDescription>
                        {itemToEdit ? "Update expense details." : "Track a new expense for the event."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Printing Costs" {...field} />
                                    </FormControl>
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
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {CATEGORIES.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="estimated_cost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estimated ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="actual_cost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Actual ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">{itemToEdit ? "Update Expense" : "Add Expense"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
