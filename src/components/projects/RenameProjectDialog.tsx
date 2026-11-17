import { useEffect, useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RenameProjectDialogProps = {
  project: { _id: Id<"projects">; name: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RenameProjectDialog({ project, open, onOpenChange }: RenameProjectDialogProps) {
  const rename = useMutation(api.projects.update);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seed the input with the current name each time the dialog opens.
  useEffect(() => {
    if (open && project) {
      setName(project.name);
      setError(null);
    }
  }, [open, project]);

  const trimmed = name.trim();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!project || !trimmed || isSaving) return;
    if (trimmed === project.name) {
      onOpenChange(false);
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await rename({ projectId: project._id, name: trimmed });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename folder");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename folder</DialogTitle>
            <DialogDescription>
              Give {project ? `"${project.name}"` : "this folder"} a new name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {error && (
              <p className="border-2 border-[#dc2626] bg-[#fef2f2] px-3 py-2 text-sm font-bold text-[#dc2626]">
                {error}
              </p>
            )}
            <Input
              placeholder="Folder name"
              aria-label="Folder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => e.target.select()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!trimmed || isSaving}>
              {isSaving ? "Saving..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
