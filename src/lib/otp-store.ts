type OTPData = { otp: string; expires: number };

class OTPStore {
  private static instance: OTPStore;
  private store: Map<string, OTPData>;

  private constructor() {
    this.store = new Map();
    // Start cleanup interval
    this.startCleanup();
  }

  static getInstance(): OTPStore {
    if (!globalThis.otpStoreInstance) {
      globalThis.otpStoreInstance = new OTPStore();
    }
    return globalThis.otpStoreInstance;
  }

  set(email: string, data: OTPData) {
    const normalizedEmail = email.toLowerCase();
    this.store.set(normalizedEmail, data);
    console.log(`[OTPStore] Set OTP for ${normalizedEmail}. Store size: ${this.store.size}`);
  }

  get(email: string): OTPData | undefined {
    const normalizedEmail = email.toLowerCase();
    const data = this.store.get(normalizedEmail);
    console.log(`[OTPStore] Get OTP for ${normalizedEmail}:`, data ? 'Found' : 'Not found');
    return data;
  }

  delete(email: string) {
    const normalizedEmail = email.toLowerCase();
    const deleted = this.store.delete(normalizedEmail);
    console.log(`[OTPStore] Delete OTP for ${normalizedEmail}: ${deleted ? 'Success' : 'Not found'}`);
  }

  // Clean up expired OTPs
  private startCleanup() {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      for (const [email, data] of this.store.entries()) {
        if (now > data.expires) {
          this.store.delete(email);
          cleaned++;
        }
      }
      if (cleaned > 0) {
        console.log(`[OTPStore] Cleaned ${cleaned} expired OTP(s). Remaining: ${this.store.size}`);
      }
    }, 2 * 60 * 1000); // Run every 2 minutes
  }
}

export const otpStore = OTPStore.getInstance();

// Type declaration for globalThis
declare global {
  var otpStoreInstance: OTPStore | undefined;
}
