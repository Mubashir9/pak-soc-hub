
import { Handshake } from "lucide-react";

export default function Sponsors() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="p-4 bg-muted rounded-full">
                <Handshake className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Sponsors & Leads</h1>
            <p className="text-muted-foreground max-w-sm">
                This section will track potential sponsors, leads, and partnership agreements.
                Feature coming soon.
            </p>
        </div>
    );
}
