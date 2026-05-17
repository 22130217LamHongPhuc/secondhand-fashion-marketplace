import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sellerOrderKeys } from './sellerQueryKeys';

/**
 * Lắng nghe server events (SSE) để invalidate order cache
 * khi có đơn hàng mới hoặc thay đổi trạng thái từ bên ngoài.
 *
 * Gắn hook này ở SellerLayout
 * để nó luôn active khi seller đang dùng app.
 */
export const useSellerOrderEvents = (sellerId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sellerId) return;

    const eventSource = new EventSource(
      `/api/seller/orders/events?sellerId=${sellerId}`
    );

    // Khi nhận event "new-order" hoặc "order-updated"
    eventSource.addEventListener('new-order', () => {
      queryClient.invalidateQueries({ queryKey: sellerOrderKeys.all });
    });

    eventSource.addEventListener('order-updated', () => {
      queryClient.invalidateQueries({ queryKey: sellerOrderKeys.all });
    });

    eventSource.onerror = (error) => {
      console.warn('[SSE] Connection lost or error, EventSource might reconnect automatically:', error);
    };

    return () => eventSource.close();
  }, [sellerId, queryClient]);
};
