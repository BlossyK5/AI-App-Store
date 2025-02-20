import { type Tool } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Link } from "wouter";
import { Star } from "lucide-react";
import { Button } from "./button";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ToolCardProps {
  tool: Tool;
  isFavorite?: boolean;
}

export function ToolCard({ tool, isFavorite = false }: ToolCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/tools/${tool.id}/favorite`, {
        action: isFavorite ? "remove" : "add",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/tools"] });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    // Record view when clicking the card
    if (user) {
      apiRequest("POST", `/api/tools/${tool.id}/view`);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      favoriteMutation.mutate();
    }
  };

  return (
    <Link href={`/tool/${tool.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full" onClick={handleClick}>
        <CardHeader className="p-0">
          <div className="w-full h-48 relative overflow-hidden rounded-t-lg">
            <img
              src={tool.thumbnailUrl}
              alt={tool.name}
              className="w-full h-full object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2 right-2 hover:bg-background/80 transition-colors ${
                isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-gray-500 hover:text-gray-600"
              }`}
              onClick={handleFavorite}
              disabled={!user}
            >
              <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-xl">{tool.name}</CardTitle>
            <Badge variant={tool.pricing === "free" ? "secondary" : "default"}>
              {tool.pricing}
            </Badge>
          </div>
          <p className="text-muted-foreground line-clamp-2 mb-4">
            {tool.description}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-primary/5">
              {tool.professionalCategory}
            </Badge>
            <Badge variant="outline" className="bg-secondary/5">
              {tool.functionalCategory}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}