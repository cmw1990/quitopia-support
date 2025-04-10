// Utility functions related to tasks

// Define TaskPriority type (or import from a central types file if available)
export type TaskPriority = 'low' | 'medium' | 'high' | null;

/**
 * Determines the visual variant for a Badge based on task priority.
 * @param priority The task's priority.
 * @returns The corresponding Badge variant.
 */
export const getPriorityBadgeVariant = (priority: TaskPriority): "secondary" | "default" | "destructive" | "outline" => {
    switch (priority) {
        case 'high': return 'destructive';
        case 'medium': return 'default'; // Using 'default' for medium as a distinct visual
        case 'low': return 'secondary';
        default: return 'outline'; // For null or undefined priority
    }
};

// Add other task-related utility functions here as needed...