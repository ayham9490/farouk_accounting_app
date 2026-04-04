import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Daily from "./pages/Daily";
import Balances from "./pages/Balances";
import Statement from "./pages/Statement";
import SettingsPage from "./pages/Settings";
import AccountingDashboardLayout from "./components/AccountingDashboardLayout";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/daily"}>
        {() => (
          <AccountingDashboardLayout>
            <Daily />
          </AccountingDashboardLayout>
        )}
      </Route>
      <Route path={"/balances"}>
        {() => (
          <AccountingDashboardLayout>
            <Balances />
          </AccountingDashboardLayout>
        )}
      </Route>
      <Route path={"/statement"}>
        {() => (
          <AccountingDashboardLayout>
            <Statement />
          </AccountingDashboardLayout>
        )}
      </Route>
      <Route path={"/settings"}>
        {() => (
          <AccountingDashboardLayout>
            <SettingsPage />
          </AccountingDashboardLayout>
        )}
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
