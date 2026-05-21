import { useQueryClient } from '@tanstack/react-query';
import { useSseSubscription } from '@/hooks';
import { sellerOrderKeys } from './sellerQueryKeys';

/**
 * Lắng nghe server events (SSE) để invalidate order cache
 * khi có đơn hàng mới hoặc thay đổi trạng thái từ bên ngoài.
 *
 * Sử dụng SharedWorker dưới hood để tối ưu chỉ có 1 connection duy nhất
 * trên toàn bộ các tab trình duyệt.
 *
 * Gắn hook này ở SellerLayout
 * để nó luôn active khi seller đang dùng app.
 */
export const useSellerOrderEvents = (sellerId) => {
  const queryClient = useQueryClient();

  // Đăng ký kênh 'seller-orders' với userId là sellerId
  useSseSubscription('seller-orders', sellerId, {
    'new-order': () => {
      console.log('[SSE Hook] Received new-order event. Invaliding orders query cache.');
      queryClient.invalidateQueries({ queryKey: sellerOrderKeys.all });
    },
    'order-updated': () => {
      console.log('[SSE Hook] Received order-updated event. Invaliding orders query cache.');
      queryClient.invalidateQueries({ queryKey: sellerOrderKeys.all });
    }
  });
};

