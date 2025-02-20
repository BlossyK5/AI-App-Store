import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ToolPage from "@/pages/tool";
import AuthPage from "@/pages/auth";
import ProfilePage from "@/pages/profile";
import DeveloperDashboard from "@/pages/developer-dashboard";
import { Navbar } from "@/components/ui/navbar";
import { ProtectedRoute } from "@/lib/protected-route";
import { OnboardingTour } from "@/components/ui/onboarding-tour";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/tool/:id" component={ToolPage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/profile" component={ProfilePage} />
        <ProtectedRoute path="/developer" component={DeveloperDashboard} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <OnboardingTour />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;