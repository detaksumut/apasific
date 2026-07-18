"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteSubmissionById } from "@/app/actions/deleteSubmission";
import { useRouter } from "next/navigation";

export default function DeleteSubmissionButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this submission?")) return;
        
        setIsDeleting(true);
        const res = await deleteSubmissionById(id);
        if (res.success) {
            router.refresh();
        } else {
            alert("Failed to delete: " + res.error);
            setIsDeleting(false);
        }
    };

    return (
        <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all text-sm font-medium border border-red-500/20 hover:border-red-500 disabled:opacity-50"
            title="Delete Submission"
        >
            {isDeleting ? "Deleting..." : <Trash2 className="w-4 h-4" />}
        </button>
    );
}
