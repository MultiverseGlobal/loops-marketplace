import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.loops.marketplace',
  appName: 'Loops',
  webDir: 'out',
  server: {
    url: 'https://loops-stores.vercel.app/',
    cleartext: true
  }
};

export default config;
