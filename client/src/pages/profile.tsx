import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ToolCard } from "@/components/ui/tool-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { User, History, Star, Download } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: toolInteractions, isLoading } = useQuery({
    queryKey: ["/api/user/tools"],
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Information Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                ) : (
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold">{user.username}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-muted-foreground">{user.professionalCategory}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tool Interactions Section */}
        <div className="md:col-span-3">
          <Tabs defaultValue="history" className="w-full">
            <TabsList>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Recently Viewed
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="downloads" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Downloads
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[300px]" />
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="history">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {toolInteractions?.views.map((view) => (
                      <ToolCard
                        key={view.id}
                        tool={view.tool}
                        isFavorite={toolInteractions.favorites.some(
                          (f) => f.tool.id === view.tool.id
                        )}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="favorites">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {toolInteractions?.favorites.map((favorite) => (
                      <ToolCard key={favorite.id} tool={favorite.tool} isFavorite={true} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="downloads">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {toolInteractions?.downloads.map((download) => (
                      <ToolCard
                        key={download.id}
                        tool={download.tool}
                        isFavorite={toolInteractions.favorites.some(
                          (f) => f.tool.id === download.tool.id
                        )}
                      />
                    ))}
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}