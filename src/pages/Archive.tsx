
import { Archive as ArchiveIcon } from "lucide-react";

export default function Archive() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="p-4 bg-muted rounded-full">
                <ArchiveIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Society Archive</h1>
            <p className="text-muted-foreground max-w-sm">
                A centralized dump for all previous society files, documents, and media.
                Searchable archive coming soon.
            </p>
        </div>
    );
}
