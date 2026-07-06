import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  // Reverse-DNS bundle ID — must match your Apple App ID and Google Play
  // application ID. Change it BEFORE your first store upload (it is permanent
  // on Google Play once published).
  appId: 'com.forgefit.app',
  appName: 'FORGE',
  webDir: 'dist',
  backgroundColor: '#0b0d10',
  ios: {
    contentInset: 'never',
  },
  android: {
    allowMixedContent: false,
  },
}

export default config
