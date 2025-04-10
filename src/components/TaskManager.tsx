import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import toast from 'react-hot-toast';
import { useUser } from '@/hooks/useUser';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  user_id: string;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const { authState } = useContext(AuthContext);
  const userId = authState?.user?.id;
  const { userDetails, isLoading, fetchUserDetails } = useUser();

  useEffect(() => {
    if (!userId) {
      console.warn("User ID not available in TaskManager.");
      return;
    }
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks?user_id=eq.${userId}`, {
        headers: {
          "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data as Task[]);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks.");
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error("Task title is required.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks`, {
        method: 'POST',
        headers: {
          "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          completed: false,
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to add task: ${response.status}`);
      }

      const newTask = (await response.json())[0] as Task;
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      toast.success("Task added successfully!");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task.");
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks?id=eq.${taskId}`, {
        method: 'DELETE',
        headers: {
          "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
      }

      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    }
  };

  const toggleComplete = async (taskId: number, completed: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks?id=eq.${taskId}`, {
        method: 'PATCH',
        headers: {
          "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          completed: !completed
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const updatedTask = (await response.json())[0] as Task;
      setTasks(tasks.map(task => (task.id === taskId ? updatedTask : task)));
      toast.success(`Task ${completed ? 'marked as incomplete' : 'completed'}!`);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task.");
    }
  };

  const editTask = async (taskId: number, newTitle: string, newDescription: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks?id=eq.${taskId}`, {
        method: 'PATCH',
        headers: {
          "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to edit task: ${response.status}`);
      }

      const updatedTask = (await response.json())[0] as Task;
      setTasks(tasks.map(task => (task.id === taskId ? updatedTask : task)));
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Error editing task:", error);
      toast.error("Failed to edit task.");
    }
  };

  return (
    <Card className="w-[80%] mx-auto my-8">
      <CardHeader>
        <CardTitle>Task Manager</CardTitle>
        <CardDescription>Stay organized and focused with your tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="taskTitle">Task Title</Label>
          <Input
            type="text"
            id="taskTitle"
            placeholder="Enter task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="taskDescription">Task Description</Label>
          <Input
            type="text"
            id="taskDescription"
            placeholder="Enter task description"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
        </div>
        <Button onClick={addTask}>Add Task</Button>

        <ul className="mt-4">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center justify-between py-2 border-b">
              <div>
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={(checked) => toggleComplete(task.id, task.completed)}
                />
                <Label htmlFor={`task-${task.id}`} className="ml-2">{task.title}</Label>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    {/* More horizontal icon (you can replace with your preferred icon) */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-more-horizontal"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    const newTitle = prompt("Enter new title", task.title);
                    const newDescription = prompt("Enter new description", task.description);
                    if (newTitle !== null && newDescription !== null) {
                      editTask(task.id, newTitle, newDescription);
                    }
                  }}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteTask(task.id)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TaskManager;
