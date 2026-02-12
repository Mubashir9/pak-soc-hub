import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import type { BudgetItem } from "@/lib/mockData";
import { cn } from "@/lib/utils";

import { CreateBudgetItemDialog } from "@/components/budget/CreateBudgetItemDialog";

interface BudgetTrackerProps {
    items: BudgetItem[];
    totalBudget: number;
    eventId: string;
    onItemCreated?: (item: BudgetItem) => void;
    onItemUpdated?: (item: BudgetItem) => void;
}

export function BudgetTracker({ items, totalBudget, eventId, onItemCreated, onItemUpdated }: BudgetTrackerProps) {
    const totalEstimated = items.reduce((sum, item) => sum + item.estimated_cost, 0);
    const totalActual = items.reduce((sum, item) => sum + item.actual_cost, 0);
    const remainingBudget = totalBudget - totalActual;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <div className="text-sm text-muted-foreground">Total Budget</div>
                    <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <div className="text-sm text-muted-foreground">Actual Spent</div>
                    <div className={cn("text-2xl font-bold", totalActual > totalBudget ? "text-red-500" : "text-green-600")}>
                        ${totalActual.toLocaleString()}
                    </div>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <div className="text-sm text-muted-foreground">Remaining</div>
                    <div className="text-2xl font-bold">${remainingBudget.toLocaleString()}</div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Expenses</h3>
                    <CreateBudgetItemDialog
                        eventId={eventId}
                        onItemCreated={onItemCreated}
                    />
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Estimated ($)</TableHead>
                                <TableHead className="text-right">Actual ($)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No expenses recorded.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.description}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell className="text-right">{item.estimated_cost}</TableCell>
                                        <TableCell className={cn("text-right", item.actual_cost > item.estimated_cost ? "text-red-500" : "")}>
                                            {item.actual_cost}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <CreateBudgetItemDialog
                                                    eventId={eventId}
                                                    itemToEdit={item}
                                                    onItemUpdated={onItemUpdated}
                                                    trigger={
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                            <Edit2 className="h-4 w-4" />
                                                            <span className="sr-only">Edit {item.description}</span>
                                                        </Button>
                                                    }
                                                />
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete {item.description}</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={2}>Total</TableCell>
                                <TableCell className="text-right">${totalEstimated.toLocaleString()}</TableCell>
                                <TableCell className="text-right">${totalActual.toLocaleString()}</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </div>
    );
}
