import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import Dashboard from "@/pages/Dashboard";
import Launch from "@/pages/Launch";
import Market from "@/pages/Market";
import Discover from "@/pages/Discover";
import Creator from "@/pages/Creator";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/launch" component={Launch} />
      <Route path="/market/:symbol" component={Market} />
      <Route path="/discover" component={Discover} />
      <Route path="/creator" component={Creator} />
      <Route path="/markets" component={Discover} />
      <Route path="/docs">
        {() => (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-3xl font-bold mb-4">Documentation</h1>
            <p className="text-muted-foreground mb-6">Coming soon...</p>
            <a
              href="https://docs.slab.markets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              External docs →
            </a>
          </div>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "5rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <TopBar />
              <main className="flex-1 overflow-auto">
                <div className="container mx-auto max-w-[1440px] px-6 py-6">
                  <Router />
                </div>
              </main>
              <footer className="h-8 bg-card/80 backdrop-blur-sm border-t border-border flex items-center justify-center text-xs text-muted-foreground px-4">
                <p>
                  Trading perpetuals involves risk. DYOR. Not financial advice. Alpha software.
                </p>
              </footer>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
