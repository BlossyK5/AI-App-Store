import { Link } from "wouter";
import { Button } from "./button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { User } from "lucide-react";

export function Navbar() {
  const { user, logoutMutation } = useAuth();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/">
          <span className="mr-6 flex items-center space-x-2 cursor-pointer">
            <span className="font-bold">AI Tools App Store</span>
          </span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  {user.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    Profile
                  </DropdownMenuItem>
                </Link>
                {user.isDeveloper && (
                  <Link href="/developer">
                    <DropdownMenuItem className="cursor-pointer">
                      Developer Dashboard
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button>Login / Register</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}