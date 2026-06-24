import toast from 'react-hot-toast';
import React from 'react';

function createToastContent(message, colorClass, toastId) {
  return React.createElement(
    'div',
    { className: 'flex items-center justify-between w-full gap-3' },
    React.createElement('span', null, message),
    React.createElement(
      'button',
      {
        onClick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          toast.dismiss(toastId);
        },
        className: `shrink-0 flex items-center justify-center h-5 w-5 rounded-full hover:bg-black/5 ${colorClass} font-black cursor-pointer transition-colors text-base leading-none`,
        'aria-label': 'Đóng',
      },
      '×'
    )
  );
}

/**
 * ═══════════════════════════════════════════════════════════════
 *  Toast Service — Wrapper dùng chung cho toàn ứng dụng
 * ═══════════════════════════════════════════════════════════════
 *
 * Bọc thư viện `react-hot-toast` với cấu hình global và các phương thức
 * tiện ích. Khi cần đổi thư viện toast khác, chỉ cần sửa file này.
 *
 * Cách dùng:
 *   import { toastService } from '@/services/toastService';
 *
 *   toastService.success('Thao tác thành công!');
 *   toastService.error('Đã xảy ra lỗi.');
 *   toastService.warning('Cảnh báo: vượt quá giới hạn.');
 *   toastService.info('Không có thay đổi nào.');
 *
 *   // Override config cho lần gọi cụ thể:
 *   toastService.success('Done!', { duration: 5000 });
 *
 *   // Thay đổi config global:
 *   toastService.configure({ duration: 5000, position: 'bottom-right' });
 */

// ─── Global Config ───────────────────────────────────────────
const globalConfig = {
  duration: 3000,
  position: 'top-right',
};

// ─── Styling phù hợp design system (Inter font, brand colors) ──
const baseStyle = {
  fontFamily: "Arial, sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  borderRadius: '12px',
  padding: '12px 16px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
};

const typeStyles = {
  success: {
    style: {
      ...baseStyle,
      background: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
    },
    icon: null,
  },
  error: {
    style: {
      ...baseStyle,
      background: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca',
    },
    icon: null,
  },
  // react-hot-toast không có toast.warning() / toast.info() native,
  // nên ta dùng toast() + style riêng.
  warning: {
    style: {
      ...baseStyle,
      background: '#fffbeb',
      color: '#92400e',
      border: '1px solid #fde68a',
    },
    icon: null,
  },
  info: {
    style: {
      ...baseStyle,
      background: '#eff6ff',
      color: '#1e40af',
      border: '1px solid #bfdbfe',
    },
    icon: null,
  },
};

// ─── Service Object ──────────────────────────────────────────

export const toastService = {
  /**
   * Thay đổi cấu hình global.
   * @param {Object} newConfig - Các thuộc tính cần ghi đè (duration, position)
   */
  configure(newConfig) {
    Object.assign(globalConfig, newConfig);
  },

  /**
   * Hiển thị toast thành công.
   * @param {string} message - Nội dung thông báo
   * @param {Object} [options] - Override config (duration, position, style, ...)
   */
  success(message, options = {}) {
    return toast.success(
      (t) => createToastContent(message, 'text-[#166534]', t.id),
      {
        duration: globalConfig.duration,
        position: globalConfig.position,
        ...typeStyles.success,
        ...options,
      }
    );
  },

  /**
   * Hiển thị toast lỗi.
   * @param {string} message - Nội dung thông báo
   * @param {Object} [options] - Override config
   */
  error(message, options = {}) {
    return toast.error(
      (t) => createToastContent(message, 'text-[#991b1b]', t.id),
      {
        duration: globalConfig.duration,
        position: globalConfig.position,
        ...typeStyles.error,
        ...options,
      }
    );
  },

  /**
   * Hiển thị toast cảnh báo (warning).
   * @param {string} message - Nội dung thông báo
   * @param {Object} [options] - Override config
   */
  warning(message, options = {}) {
    return toast(
      (t) => createToastContent(message, 'text-[#92400e]', t.id),
      {
        duration: globalConfig.duration,
        position: globalConfig.position,
        ...typeStyles.warning,
        ...options,
      }
    );
  },

  /**
   * Hiển thị toast thông tin (info).
   * @param {string} message - Nội dung thông báo
   * @param {Object} [options] - Override config
   */
  info(message, options = {}) {
    return toast(
      (t) => createToastContent(message, 'text-[#1e40af]', t.id),
      {
        duration: globalConfig.duration,
        position: globalConfig.position,
        ...typeStyles.info,
        ...options,
      }
    );
  },

  /**
   * Đóng tất cả toast đang hiển thị.
   */
  dismissAll() {
    toast.dismiss();
  },

  /**
   * Đóng một toast cụ thể theo ID.
   * @param {string} toastId - ID của toast cần đóng
   */
  dismiss(toastId) {
    toast.dismiss(toastId);
  },
};

/**
 * Cấu hình cho component <Toaster />.
 * Import và spread vào <Toaster /> trong layout:
 *
 *   import { toasterProps } from '@/services/toastService';
 *   <Toaster {...toasterProps} />
 */
export const toasterProps = {
  position: globalConfig.position,
  toastOptions: {
    style: baseStyle,
    duration: globalConfig.duration,
  },
};

export default toastService;
