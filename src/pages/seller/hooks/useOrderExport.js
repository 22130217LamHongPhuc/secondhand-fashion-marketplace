import { useState, useCallback } from 'react';
import { useSseSubscription } from '@/hooks';
import api from '@/config/axios';
import { useAuth } from '@/hooks';

export const useOrderExport = () => {
  const { user } = useAuth();
  const sellerId = user?.userId || user?.id;

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(null);
  const [completeData, setCompleteData] = useState(null);
  const [error, setError] = useState(null);

  // Lắng nghe sự kiện SSE cho kênh 'order-export'
  useSseSubscription('order-export', sellerId, {
    'export-progress': (data) => {
      if (isExporting) {
        setProgress(data);
      }
    },
    'export-complete': (data) => {
      if (isExporting) {
        setCompleteData(data);
        setIsExporting(false);
        setProgress(null);
      }
    },
    'export-error': (data) => {
      if (isExporting) {
        setError(data?.message || 'Có lỗi xảy ra trong quá trình export');
        setIsExporting(false);
        setProgress(null);
      }
    }
  });

  const startExport = useCallback(async () => {
    try {
      setIsExporting(true);
      setError(null);
      setCompleteData(null);
      setProgress({ percent: 0, processed: 0, total: 0, etaSeconds: 0 });

      await api.post('/api/seller/orders/export');
    } catch (err) {
      console.error('[useOrderExport] Error starting export:', err);
      setError(err?.response?.data?.message || 'Không thể bắt đầu export');
      setIsExporting(false);
    }
  }, []);

  const resetExport = useCallback(() => {
    setIsExporting(false);
    setProgress(null);
    setCompleteData(null);
    setError(null);
  }, []);

  return {
    isExporting,
    progress,
    completeData,
    error,
    startExport,
    resetExport
  };
};
