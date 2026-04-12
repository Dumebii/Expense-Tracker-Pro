import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, CURRENCIES } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

export default function Settings() {
  const { user, updateProfile, signOut } = useUser();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [receiptEmail, setReceiptEmail] = useState(user?.receiptEmail || "");
  const [displayCurrency, setDisplayCurrency] = useState(user?.displayCurrency || "USD");

  const handleSaveProfile = () => {
    if (!name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    if (!email.trim() || !email.includes("@")) { toast({ title: "Valid email is required", variant: "destructive" }); return; }
    updateProfile({ name: name.trim(), email: email.trim() });
    toast({ title: "Profile updated" });
  };

  const handleSavePreferences = () => {
    const re = receiptEmail.trim();
    if (re && !re.includes("@")) { toast({ title: "Enter a valid receipt email", variant: "destructive" }); return; }
    updateProfile({ receiptEmail: re || email.trim(), displayCurrency });
    toast({ title: "Preferences saved" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription className="text-xs">Your name and login email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <Button onClick={handleSaveProfile} size="sm">Save Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
          <CardDescription className="text-xs">Receipt email and display currency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="receiptEmail">Receipt Email</Label>
            <Input
              id="receiptEmail"
              type="email"
              value={receiptEmail}
              onChange={(e) => setReceiptEmail(e.target.value)}
              placeholder={email || "receipts@example.com"}
            />
            <p className="text-xs text-muted-foreground">Where to send expense receipts. Defaults to your profile email.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">Display Currency</Label>
            <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
              <SelectTrigger id="currency" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Used for overview totals on the dashboard.</p>
          </div>
          <Button onClick={handleSavePreferences} size="sm">Save Preferences</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" size="sm" onClick={signOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
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
