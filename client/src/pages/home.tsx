import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Tool } from "@shared/schema";
import { SearchBar } from "@/components/ui/search-bar";
import { ToolCard } from "@/components/ui/tool-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const thoughtLeadershipArticles = [
  {
    title: "The Future of AI in Business Operations",
    description: "Learn how AI is transforming business operations across industries",
    link: "https://example.com/ai-business-ops",
  },
  {
    title: "Implementing AI Tools: A Practical Guide",
    description: "Step-by-step guide to incorporating AI tools in your workflow",
    link: "https://example.com/ai-implementation",
  },
  {
    title: "AI Ethics and Best Practices",
    description: "Understanding the ethical considerations of AI adoption",
    link: "https://example.com/ai-ethics",
  },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [professionalCategory, setProfessionalCategory] = useState("all");
  const [functionalCategory, setFunctionalCategory] = useState("all");
  const [pricing, setPricing] = useState("all");

  const { data: tools, isLoading } = useQuery<Tool[]>({
    queryKey: ["/api/tools", { query, professionalCategory, functionalCategory, pricing }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (query) searchParams.append("query", query);
      if (professionalCategory !== "all") searchParams.append("professionalCategory", professionalCategory);
      if (functionalCategory !== "all") searchParams.append("functionalCategory", functionalCategory);
      if (pricing !== "all") searchParams.append("pricing", pricing);

      const response = await fetch(`/api/tools?${searchParams.toString()}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch tools");
      return response.json();
    }
  });

  const { data: featuredTools } = useQuery<Tool[]>({
    queryKey: ["/api/tools/featured"],
  });

  const { data: editorChoiceTools } = useQuery<Tool[]>({
    queryKey: ["/api/tools/editor-choice"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="py-12 px-4 text-center bg-gradient-to-b from-primary/10 to-background">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          AI Tools App Store
        </h1>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover and explore the best AI tools for your professional needs
        </p>
        <SearchBar
          query={query}
          professionalCategory={professionalCategory}
          functionalCategory={functionalCategory}
          pricing={pricing}
          onQueryChange={setQuery}
          onProfessionalCategoryChange={setProfessionalCategory}
          onFunctionalCategoryChange={setFunctionalCategory}
          onPricingChange={setPricing}
        />
      </header>

      <main className="container mx-auto px-4 py-8">
        {featuredTools && featuredTools.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Featured Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}

        {editorChoiceTools && editorChoiceTools.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Editor's Choice</h2>
            <p className="text-muted-foreground mb-6">
              Hand-picked tools that our editors recommend for their exceptional quality and innovation
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {editorChoiceTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools?.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-16 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Resources & Thought Leadership</h2>
          <p className="text-muted-foreground mb-8">
            Explore our curated collection of articles and guides on AI implementation and best practices
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {thoughtLeadershipArticles.map((article, index) => (
              <Card key={index}>
                <CardHeader>
                  <h3 className="text-lg font-semibold">{article.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{article.description}</p>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    Read More
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}