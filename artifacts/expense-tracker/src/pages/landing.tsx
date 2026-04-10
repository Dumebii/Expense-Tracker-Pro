import { Link } from "wouter";
import { TrendingUp, ArrowUpDown, Receipt, Bot, FileBarChart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">L</div>
          <span className="font-bold text-xl tracking-tight">Ledger</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 py-24 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <TrendingUp className="w-3.5 h-3.5" />
            Your financial command center
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Know exactly where<br />
            <span className="text-primary">every dollar goes</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            A serious financial tracker built for founders. Track income and expenses, see your P&L at a glance, and get AI-powered financial advice — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="px-8">Start Tracking Free</Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="px-8">Sign In</Button>
            </Link>
          </div>
        </section>

        <section className="px-6 py-16 bg-sidebar/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">Everything you need to stay on top of your finances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: ArrowUpDown,
                  title: "Money In & Out",
                  description: "Track all income sources and expenses in one unified view. Know your true cash position at any time.",
                },
                {
                  icon: TrendingUp,
                  title: "Profit & Loss",
                  description: "See your monthly and annual P&L broken down by category. Instant alert when you're in the red.",
                },
                {
                  icon: Receipt,
                  title: "Receipt Generation",
                  description: "Generate professional receipts for any expense and email them automatically.",
                },
                {
                  icon: Bot,
                  title: "AI Financial Advisor",
                  description: "Get context-aware financial advice from an AI that knows your actual numbers.",
                },
                {
                  icon: FileBarChart,
                  title: "Account Statements",
                  description: "Generate clean account statements for any time period, ready to share or archive.",
                },
                {
                  icon: Shield,
                  title: "Multi-Currency",
                  description: "Track transactions in USD, EUR, GBP, NGN, and 6 other currencies.",
                },
              ].map((feature) => (
                <div key={feature.title} className="p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to take control?</h2>
            <p className="text-muted-foreground mb-8">Join founders who track their finances seriously.</p>
            <Link href="/sign-up">
              <Button size="lg" className="px-10">Get Started</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 px-6 py-6 text-center text-sm text-muted-foreground">
        Ledger &mdash; Built for founders who mean business.
      </footer>
    </div>
  );
}
