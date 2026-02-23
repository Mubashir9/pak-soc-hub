import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { BudgetItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface BudgetSummary {
    allocated?: number;
    spent?: number;
    event_name?: string;
    [key: string]: unknown;
}

export default function Budget() {
    const [summary, setSummary] = useState<BudgetSummary[]>([]);
    const [budgetItems, setBudgetItems] = useState<(BudgetItem & { event_name?: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [summaryRes, itemsRes] = await Promise.all([
                supabase.from('event_budget_summary').select('*'),
                supabase.from('budget_items').select('*, events(name)')
            ]);

            if (summaryRes.data) setSummary(summaryRes.data);
            if (itemsRes.data) {
                // Flatten the event name from the joined query
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const flattenedItems = itemsRes.data.map((item: any) => ({
                    ...item,
                    event_name: item.events?.name
                }));
                setBudgetItems(flattenedItems);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    // Aggregates from summary view
    const totalAllocated = summary.reduce((sum, e) => sum + (e.allocated || 0), 0);
    const totalSpent = summary.reduce((sum, e) => sum + (e.spent || 0), 0);
    const remaining = totalAllocated - totalSpent;

    // Charts Data
    const eventSpendingData = summary.map(e => ({
        name: e.event_name,
        Allocated: e.allocated,
        Spent: e.spent
    }));

    const categorySpending: Record<string, number> = {};
    budgetItems.forEach((item) => {
        const cat = item.category || 'Uncategorized';
        categorySpending[cat] = (categorySpending[cat] || 0) + item.actual_cost;
    });

    const categoryData = Object.entries(categorySpending).map(([name, value]) => ({ name, value }));
    const COLORS = ['#0F9D58', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) return <div className="p-8">Loading budget dashboard...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Budget Overview</h1>
                <p className="text-muted-foreground mt-1">Financial health across society events</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
                        <span className="text-2xl font-bold">${totalAllocated.toLocaleString()}</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">Across {summary.length} events</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <span className="text-2xl font-bold text-blue-600">${totalSpent.toLocaleString()}</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            {totalAllocated > 0 ? `${((totalSpent / totalAllocated) * 100).toFixed(1)}% of budget used` : 'N/A'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                        <span className={`text-2xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
                            ${remaining.toLocaleString()}
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">Available funds</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Budget vs Spent per Event</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={eventSpendingData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `$${value}`} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Allocated" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Spent" fill="#0F9D58" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Spending by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {budgetItems.slice(0, 10).map((item, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{item.description}</TableCell>
                                    <TableCell>{item.event_name}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell className="text-right">${item.actual_cost.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
