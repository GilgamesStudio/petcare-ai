import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "ai.petcare.app",
  appName: "PetCare AI",
  webDir: "out",
  server: {
    url: "https://petcare-qs5teyrbn-gilgamesstudio-4193s-projects.vercel.app",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    Camera: {
      permissions: ["camera"],
    },
  },
}

export default config
