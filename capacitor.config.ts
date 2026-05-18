import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nchiko.finance',
  appName: 'Nchiko',
  webDir: 'out',
  server: {
    // Point to your production Vercel URL for App Store builds.
    // Falls back to localhost for local Capacitor dev (`npx cap run ios`).
    url: process.env.CAPACITOR_SERVER_URL ?? 'http://localhost:3000',
    cleartext: false,
    // Allow Clerk auth redirects inside the WebView
    allowNavigation: [
      '*.clerk.accounts.dev',
      '*.clerk.dev',
      'accounts.google.com',
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#050d1a',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#050d1a',
    },
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#050d1a',
  },
  android: {
    backgroundColor: '#050d1a',
  },
};

export default config;
