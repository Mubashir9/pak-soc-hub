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
import type { InventoryItem, InventoryStatus } from "@/lib/mockData";
import { Plus } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "Item name must be at least 2 characters."),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
    status: z.enum(["needed", "acquired", "available"] as [string, ...string[]]),
});

interface CreateInventoryItemDialogProps {
    eventId: string;
    itemToEdit?: InventoryItem;
    trigger?: React.ReactNode;
    onItemCreated?: (item: InventoryItem) => void;
    onItemUpdated?: (item: InventoryItem) => void;
}

export function CreateInventoryItemDialog({
    eventId,
    itemToEdit,
    trigger,
    onItemCreated,
    onItemUpdated
}: CreateInventoryItemDialogProps) {
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            quantity: 1,
            status: "needed",
        },
    });

    useEffect(() => {
        if (itemToEdit) {
            form.reset({
                name: itemToEdit.name,
                quantity: itemToEdit.quantity,
                status: itemToEdit.status,
            });
        } else {
            form.reset({
                name: "",
                quantity: 1,
                status: "needed",
            });
        }
    }, [itemToEdit, form, open]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        const newItem: InventoryItem = {
            id: itemToEdit ? itemToEdit.id : Math.random().toString(36).substr(2, 9),
            event_id: eventId,
            name: values.name,
            quantity: values.quantity,
            status: values.status as InventoryStatus,
        };

        if (itemToEdit) {
            onItemUpdated?.(newItem);
        } else {
            onItemCreated?.(newItem);
        }

        setOpen(false);
        form.reset();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{itemToEdit ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
                    <DialogDescription>
                        {itemToEdit ? "Update the details of this item." : "Add a new item to the event inventory."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Item Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Tables" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" {...field} />
                                        </FormControl>
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
                                                <SelectItem value="needed">Needed</SelectItem>
                                                <SelectItem value="acquired">Acquired</SelectItem>
                                                <SelectItem value="available">Available</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">{itemToEdit ? "Update Item" : "Add Item"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
