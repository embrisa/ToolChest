import { ToolPageFallback } from "@/components/ui";

export default function ToolsLoading() {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <ToolPageFallback message="Loading tools..." />
    </div>
  );
}
