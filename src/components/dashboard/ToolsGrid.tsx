import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Star, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserTools, updateUserTools } from "@/lib/api/tools";
import { toolRoute } from "@/config/routes";

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  isFavorite: boolean;
  path: string;
}

export function ToolsGrid() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: tools = [] } = useQuery<Tool[]>({
    queryKey: ["userTools"],
    queryFn: getUserTools,
    initialData: [
      {
        id: "1",
        name: "White Noise",
        description: "Ambient sound generator",
        category: "Focus",
        icon: "",
        isFavorite: true,
        path: toolRoute('whiteNoise')
      },
      {
        id: "2",
        name: "Pomodoro Timer",
        description: "25/5 work-break timer",
        category: "Focus",
        icon: "",
        isFavorite: true,
        path: toolRoute('pomodoro')
      },
      {
        id: "3",
        name: "Sleep Sounds",
        description: "Calming sleep music",
        category: "Sleep",
        icon: "",
        isFavorite: true,
        path: toolRoute('sleepSounds')
      },
      {
        id: "4",
        name: "Meditation Timer",
        description: "Guided meditation",
        category: "Mental",
        icon: "",
        isFavorite: false,
        path: toolRoute('meditation')
      },
      {
        id: "5",
        name: "Breathwork",
        description: "Breathing exercises",
        category: "Mental",
        icon: "",
        isFavorite: false,
        path: toolRoute('breathwork')
      },
    ],
  });

  const toggleFavorite = useMutation({
    mutationFn: (toolId: string) => {
      const tool = tools.find((t) => t.id === toolId);
      if (!tool) return Promise.reject("Tool not found");
      return updateUserTools({
        ...tool,
        isFavorite: !tool.isFavorite,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTools"] });
    },
  });

  const handleToolClick = (tool: Tool, e: React.MouseEvent) => {
    // If clicking the favorite button, don't navigate
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    
    navigate(tool.path);
  };

  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteTools = filteredTools.filter((tool) => tool.isFavorite);
  const otherTools = filteredTools.filter((tool) => !tool.isFavorite);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Quick Tools</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Customize Layout</DropdownMenuItem>
              <DropdownMenuItem>Manage Tools</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {favoriteTools.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Favorites</h4>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {favoriteTools.map((tool) => (
                    <Card 
                      key={tool.id} 
                      className="cursor-pointer hover:bg-accent"
                      onClick={(e) => handleToolClick(tool, e)}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{tool.icon}</span>
                          <div>
                            <p className="font-medium">{tool.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite.mutate(tool.id)}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              tool.isFavorite ? "fill-yellow-400 text-yellow-400" : ""
                            }`}
                          />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {otherTools.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">All Tools</h4>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {otherTools.map((tool) => (
                    <Card 
                      key={tool.id} 
                      className="cursor-pointer hover:bg-accent"
                      onClick={(e) => handleToolClick(tool, e)}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{tool.icon}</span>
                          <div>
                            <p className="font-medium">{tool.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite.mutate(tool.id)}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              tool.isFavorite ? "fill-yellow-400 text-yellow-400" : ""
                            }`}
                          />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
