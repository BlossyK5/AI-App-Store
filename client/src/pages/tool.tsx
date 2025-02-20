import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { type Tool, type AIToolRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ToolPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const { data: tool, isLoading } = useQuery<Tool>({
    queryKey: [`/api/tools/${id}`],
  });

  const executeMutation = useMutation({
    mutationFn: async (data: AIToolRequest) => {
      const res = await apiRequest("POST", `/api/tools/${id}/execute`, data);
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data.result);
      toast({
        title: "Success",
        description: "AI tool executed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-96" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Tool not found</h1>
        <Link href="/">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    executeMutation.mutate({ prompt });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/">
        <Button variant="ghost" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-lg overflow-hidden">
          <img
            src={tool.previewUrl}
            alt={tool.name}
            className="w-full h-96 object-cover"
          />
        </div>

        <div>
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{tool.name}</h1>
            <Badge variant={tool.pricing === "free" ? "secondary" : "default"} className="text-lg">
              {tool.pricing}
            </Badge>
          </div>

          <div className="flex gap-2 mb-6">
            <Badge variant="outline">
              {tool.professionalCategory}
            </Badge>
            <Badge variant="outline">
              {tool.functionalCategory}
            </Badge>
          </div>

          <p className="text-muted-foreground mb-8">{tool.description}</p>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <ul className="list-disc list-inside space-y-2">
                {(tool.metadata.features as string[]).map((feature, index) => (
                  <li key={index} className="text-muted-foreground">
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Try it out</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  placeholder={`Enter your prompt (max ${tool.maxInputLength} characters)...`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={tool.maxInputLength}
                  className="min-h-[100px]"
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={executeMutation.isPending || !prompt.trim()}
                >
                  {executeMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate
                </Button>
              </form>

              {result && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Result:</h3>
                  {tool.aiCapability === "image-generation" ? (
                    <img src={result} alt="Generated" className="w-full rounded-lg" />
                  ) : (
                    <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                      {result}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}