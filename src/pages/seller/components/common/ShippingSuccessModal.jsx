import React from 'react';
import { Truck, X, Calendar, DollarSign, Package } from 'lucide-react';

const ShippingSuccessModal = ({ isOpen, onClose, shippingInfo }) => {
    if (!isOpen || !shippingInfo) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-brand-primary/10 px-6 py-4 flex items-center gap-3 border-b border-brand-primary/20">
                    <div className="h-10 w-10 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Truck size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-800 text-lg">Tạo đơn thành công!</h3>
                        <p className="text-sm text-brand-primary font-medium">Đã chuyển thông tin cho Giao Hàng Nhanh</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="ml-auto text-brand-primary/60 hover:text-brand-primary hover:bg-brand-primary/10 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 flex items-start gap-3">
                        <Package className="text-neutral-400 mt-0.5" size={18} />
                        <div>
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Mã vận đơn GHN</p>
                            <p className="font-bold text-brand-primary text-xl tracking-tight">{shippingInfo.ghnOrderCode || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-neutral-400">
                                <Calendar size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Dự kiến giao</span>
                            </div>
                            <p className="font-semibold text-neutral-700">{shippingInfo.expectedDeliveryTime || 'Đang cập nhật'}</p>
                        </div>
                        
                        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-neutral-400">
                                <DollarSign size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Phí GHN</span>
                            </div>
                            <p className="font-bold text-neutral-700">{shippingInfo.ghnTotalFee || '0đ'}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-2">
                    <button 
                        onClick={onClose}
                        className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition-colors shadow-md"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShippingSuccessModal;
