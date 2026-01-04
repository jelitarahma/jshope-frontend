
import api from '../api';

export interface MidtransClientKey {
  client_key: string;
  is_production: boolean;
}

export interface TransactionStatus {
  order_id: string;
  transaction_status: string;
  payment_type?: string;
  gross_amount?: string;
  fraud_status?: string;
}

export const midtransService = {
  async getClientKey(): Promise<MidtransClientKey> {
    const response = await api.get('/midtrans/client-key');
    return response.data;
  },

  async checkTransactionStatus(orderNumber: string): Promise<TransactionStatus> {
    const response = await api.get(`/midtrans/status/${orderNumber}`);
    return response.data;
  },

  async cancelTransaction(orderNumber: string): Promise<void> {
    await api.post(`/midtrans/cancel/${orderNumber}`);
  },


  loadSnapScript(clientKey: string, isProduction: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && (window as unknown as { snap?: unknown }).snap) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = isProduction
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', clientKey);
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Midtrans Snap script'));
      document.body.appendChild(script);
    });
  },


  openSnapPopup(
    snapToken: string,
    onSuccess: (result: unknown) => void,
    onPending: (result: unknown) => void,
    onError: (result: unknown) => void,
    onClose: () => void
  ): void {
    const snap = (window as unknown as { snap?: { pay: (token: string, callbacks: unknown) => void } }).snap;
    if (snap) {
      snap.pay(snapToken, {
        onSuccess,
        onPending,
        onError,
        onClose,
      });
    }
  },
};
