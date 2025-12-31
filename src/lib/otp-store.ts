type OTPData = { otp: string; expires: number };

class OTPStore {
  private static instance: OTPStore;
  private store: Map<string, OTPData>;

  private constructor() {
    this.store = new Map();
  }

  static getInstance(): OTPStore {
    if (!globalThis.otpStoreInstance) {
      globalThis.otpStoreInstance = new OTPStore();
    }
    return globalThis.otpStoreInstance;
  }

  set(email: string, data: OTPData) {
    this.store.set(email, data);
  }

  get(email: string): OTPData | undefined {
    return this.store.get(email);
  }

  delete(email: string) {
    this.store.delete(email);
  }
}

export const otpStore = OTPStore.getInstance();

// Type declaration for globalThis
declare global {
  var otpStoreInstance: OTPStore | undefined;
}
