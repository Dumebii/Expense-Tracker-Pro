import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Receipts from "@/pages/receipts";
import MoneyIn from "@/pages/money-in";
import MoneyOut from "@/pages/money-out";
import ProfitLoss from "@/pages/profit-loss";
import Advisor from "@/pages/advisor";
import Statement from "@/pages/statement";
import Settings from "@/pages/settings";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/landing" component={Landing} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/money-in" component={MoneyIn} />
            <Route path="/money-out" component={MoneyOut} />
            <Route path="/receipts" component={Receipts} />
            <Route path="/profit-loss" component={ProfitLoss} />
            <Route path="/advisor" component={Advisor} />
            <Route path="/statement" component={Statement} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
