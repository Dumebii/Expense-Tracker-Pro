import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1.5 3h9M1.5 6h6M1.5 9h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-medium text-foreground">Expense Tracker Pro</span>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Expense Tracker Pro. All rights reserved.
        </p>

        <div className="flex items-center gap-5">
          <Link href="/sign-in" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link href="/sign-up" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
