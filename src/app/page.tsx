import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">₹</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Expense Tracker Pro</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/sign-in" className="px-4 py-2 text-foreground hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Take Control of Your <span className="text-primary">Finances</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track every expense, analyze spending patterns, and reach your financial goals with our intuitive expense tracking platform.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/sign-up" className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
              Start Tracking Free
            </Link>
            <Link href="#features" className="px-8 py-3 border border-border text-foreground rounded-lg hover:bg-secondary transition-colors font-semibold">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-secondary/50">
        <h3 className="text-3xl font-bold text-center text-foreground mb-16">Why Choose Expense Tracker Pro?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Easy Tracking',
              description: 'Quickly add and categorize expenses in seconds',
              icon: '✓',
            },
            {
              title: 'Smart Analytics',
              description: 'Visualize spending patterns with detailed charts',
              icon: '📊',
            },
            {
              title: 'Budget Management',
              description: 'Set budgets and stay on top of spending limits',
              icon: '💰',
            },
            {
              title: 'Secure & Private',
              description: 'Your data is encrypted and belongs to you',
              icon: '🔒',
            },
            {
              title: 'Mobile Friendly',
              description: 'Track expenses on the go from any device',
              icon: '📱',
            },
            {
              title: 'Export Reports',
              description: 'Generate and download detailed expense reports',
              icon: '📄',
            },
          ].map((feature, index) => (
            <div key={index} className="p-6 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h4 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h4>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-primary text-primary-foreground rounded-lg p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to manage your expenses?</h3>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are taking control of their finances today.
          </p>
          <Link href="/sign-up" className="inline-block px-8 py-3 bg-primary-foreground text-primary rounded-lg hover:bg-secondary transition-colors font-semibold">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2024 Expense Tracker Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
