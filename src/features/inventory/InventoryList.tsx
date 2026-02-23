import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Plus } from "lucide-react";
import type { InventoryItem } from "@/types";
import { supabase } from "@/lib/supabase";

import { CreateInventoryItemDialog } from "@/components/inventory/CreateInventoryItemDialog";

interface InventoryListProps {
    items: InventoryItem[];
    eventId: string;
    onItemCreated?: (item: InventoryItem) => void;
    onItemUpdated?: (item: InventoryItem) => void;
}

export function InventoryList({ items, eventId, onItemCreated, onItemUpdated }: InventoryListProps) {
    const handleDelete = async (item: InventoryItem) => {
        const { error } = await supabase
            .from('inventory')
            .delete()
            .eq('id', item.id);

        if (error) {
            console.error("Error deleting inventory item:", error);
        } else {
            // Ideally trigger a refresh or call a prop
            window.location.reload(); // Simple refresh for now to sync with Supabase
        }
    };

    const getStatusColor = (status: InventoryItem['status']) => {
        switch (status) {
            case 'needed': return 'destructive';
            case 'acquired': return 'default';
            case 'available': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Inventory Items</h3>
                <CreateInventoryItemDialog
                    eventId={eventId}
                    onItemCreated={onItemCreated}
                    trigger={
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    }
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No inventory items listed.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(item.status)} className="capitalize">
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <CreateInventoryItemDialog
                                                eventId={eventId}
                                                itemToEdit={item}
                                                onItemUpdated={onItemUpdated}
                                                trigger={
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                        <Edit2 className="h-4 w-4" />
                                                        <span className="sr-only">Edit {item.name}</span>
                                                    </Button>
                                                }
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDelete(item)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete {item.name}</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
