import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <div>
              <div className="text-sm font-medium">Authentication</div>
              <div className="text-xs text-muted-foreground mt-0.5">Manage your login providers and password</div>
            </div>
            <Badge variant="secondary">Managed by Clerk</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            To update your email, password, or connected accounts, use the Auth pane in the workspace toolbar.
          </p>
          {/* To update login providers, app branding, or OAuth settings use the Auth pane in the workspace toolbar. */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Receipt Emails</div>
                <div className="text-xs text-muted-foreground mt-0.5">Receipts are sent to okolodumebi@gmail.com</div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Ledger — A founder's financial command center.</p>
          <p>Track income and expenses, monitor your P&L, and get AI-powered financial advice.</p>
        </CardContent>
      </Card>
    </div>
  );
}
