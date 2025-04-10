import { createClient } from '@supabase/supabase-js';
import type { Task, CreateTaskDto, UpdateTaskDto } from '@/types/task';

// Ensure environment variables are correctly typed or default values are provided
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'; // Use VITE_ prefix for Vite
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'; // Use VITE_ prefix for Vite

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn('Supabase URL or Anon Key is not set in environment variables (using VITE_ prefix). Using placeholders.');
    // Optionally throw an error in production builds
    // if (process.env.NODE_ENV === 'production') {
    //     throw new Error('Supabase environment variables are not set!');
    // }
}

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetches tasks based on their status.
 * Note: RLS policies in Supabase should enforce user ownership.
 */
const getTasks = async (status: 'pending' | 'completed') => {
    const { data, error } = await supabase
        .from('focus_tasks')
        .select('*')
        .eq('status', status) 
        // Assuming RLS handles user_id filtering
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tasks:', error);
    }
    return { data: data as Task[] | null, error };
};

/**
 * Creates a new task.
 * The user_id should be automatically handled by Supabase Auth context if RLS is set up correctly.
 */
const createTask = async (taskData: CreateTaskDto) => {
    // user_id is typically not needed here if RLS based on auth.uid() is used
    const { data, error } = await supabase
        .from('focus_tasks')
        .insert([{
            ...taskData,
            // Ensure status is set, default priority handled in component or here if desired
            status: taskData.status || 'pending', 
        }])
        .select()
        .single(); // Assuming you want the created task back

    if (error) {
        console.error('Error creating task:', error);
    }
    return { data: data as Task | null, error };
};

/**
 * Updates an existing task.
 * RLS should prevent users from updating tasks they don't own.
 */
const updateTask = async (taskId: string, updates: UpdateTaskDto) => {
    const { data, error } = await supabase
        .from('focus_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single(); // Return the updated task

    if (error) {
        console.error('Error updating task:', error);
    }
    return { data: data as Task | null, error };
};

/**
 * Deletes a task by its ID.
 * RLS should prevent users from deleting tasks they don't own.
 */
const deleteTask = async (taskId: string) => {
    const { error } = await supabase
        .from('focus_tasks')
        .delete()
        .eq('id', taskId);

    if (error) {
        console.error('Error deleting task:', error);
    }
    // Delete doesn't usually return data, just potential error
    return { error }; 
};

export const taskService = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
}; 