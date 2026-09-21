import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "sa.causaseal.app",
  appName: "CAUSASEAL",
  webDir: "out",
  server: {
    // Packaged shells call Hostinger via NEXT_PUBLIC_API_BASE; no cleartext localhost in release.
    androidScheme: "https",
  },
}

export default config
