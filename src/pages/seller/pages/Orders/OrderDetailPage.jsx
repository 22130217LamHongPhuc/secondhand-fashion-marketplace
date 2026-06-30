import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSellerOrderDetail, useStartDelivery, useCompleteOrder } from '../../hooks';
import { Loader2, ArrowLeft, MapPin, CreditCard, ShoppingBag, Truck, CheckCircle } from 'lucide-react';
import { toastService } from "@/services/toastService";

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
};

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: order, isLoading, error } = useSellerOrderDetail(id);
    const { mutateAsync: startDelivery, isPending: isDelivering } = useStartDelivery();
    const { mutateAsync: completeOrder, isPending: isCompleting } = useCompleteOrder();

    if (isLoading) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
                <p className="text-sm font-medium text-neutral-500">Đang tải chi tiết đơn hàng...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-3">
                <p className="text-red-500 font-medium">Lỗi tải thông tin đơn hàng: {error?.message || "Không tìm thấy đơn hàng"}</p>
                <button
                    onClick={() => navigate("/seller/orders")}
                    className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
                >
                    <ArrowLeft size={16} /> Quay lại danh sách
                </button>
            </div>
        );
    }

    const addressLines = order.shippingAddress
        ? [
            order.shippingAddress.addressDetail,
            order.shippingAddress.ward,
            order.shippingAddress.district,
            order.shippingAddress.province,
        ]
            .filter(Boolean)
            .join(', ')
        : '';

    return (
        <div className="font-sans pb-16">
            {/* Main Content */}
            <main className="max-w-[1200px] mx-auto pt-4">

                {/* Title Area */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate("/seller/orders")}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors shadow-xs"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">
                        Chi tiết đơn hàng {order.orderCode}
                    </h1>
                </div>

                {/* Card Container (Khớp với các trang quản lý khác) */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200 shadow-xs">

                    {/* Header Card: Trạng thái & Thời gian */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-100 pb-6 mb-8 gap-4">
                        <div>
                            <p className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1.5">MÃ ĐƠN HÀNG</p>
                            <h2 className="text-xl font-bold text-neutral-800">{order.orderCode}</h2>
                            <p className="text-sm text-neutral-500 mt-1">Ngày đặt: <span className="font-semibold text-neutral-700">{order.createdAt || order.formattedDate}</span></p>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-brand-primary/10 text-brand-primary font-bold text-sm rounded-xl">
                                {order.statusLabel}
                            </span>
                            <span className={`px-4 py-2 font-bold text-sm rounded-xl ${order.paymentStatus === 'PAID' ? 'bg-accent-green-light text-accent-green' : 'bg-neutral-100 text-neutral-600'}`}>
                                {order.paymentStatusLabel}
                            </span>
                        </div>
                    </div>

                    {/* Grid Layout: Thông tin khách hàng & Thanh toán */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 ${order.ghnOrderCode ? 'lg:grid-cols-3' : ''} gap-6 mb-8`}>
                        {/* Box: Địa chỉ giao hàng */}
                        <div className="bg-neutral-50/50 rounded-2xl p-6 border border-neutral-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                    <MapPin size={18} />
                                </div>
                                <h3 className="font-bold text-neutral-800 text-base">Địa chỉ nhận hàng</h3>
                            </div>
                            <div className="space-y-2 text-sm text-neutral-600">
                                <p className="font-bold text-neutral-800 text-sm">{order.shippingAddress?.fullName || order.customerName}</p>
                                <p>SĐT: {order.shippingAddress?.phone || order.shippingAddress?.phoneNumber || "Chưa cung cấp"}</p>
                                <p className="leading-relaxed">{addressLines || "Chưa có địa chỉ chi tiết"}</p>
                            </div>
                        </div>

                        {/* Box: Thông tin thanh toán */}
                        <div className="bg-neutral-50/50 rounded-2xl p-6 border border-neutral-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                    <CreditCard size={18} />
                                </div>
                                <h3 className="font-bold text-neutral-800 text-base">Thông tin thanh toán</h3>
                            </div>
                            <div className="space-y-3 text-sm text-neutral-600">
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">Phương thức:</span>
                                    <span className="font-semibold text-neutral-700">{order.paymentMethodLabel}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">Trạng thái:</span>
                                    <span className="font-semibold text-neutral-700">{order.paymentStatusLabel}</span>
                                </div>
                                {order.paidAt && (
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Thời gian TT:</span>
                                        <span className="font-medium text-neutral-700">{order.paidAt}</span>
                                    </div>
                                )}
                                {order.cancelReason && (
                                    <div className="mt-4 p-3 bg-accent-red-light/50 text-accent-red rounded-xl text-sm border border-accent-red/10">
                                        <span className="font-bold">Lý do hủy:</span> {order.cancelReason}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Box: Thông tin vận chuyển (nếu có GHN) */}
                        {order.ghnOrderCode && (
                            <div className="bg-neutral-50/50 rounded-2xl p-6 border border-neutral-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                        <Truck size={18} />
                                    </div>
                                    <h3 className="font-bold text-neutral-800 text-base">Thông tin vận chuyển</h3>
                                </div>
                                <div className="space-y-3 text-sm text-neutral-600">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Đơn vị:</span>
                                        <span className="font-semibold text-neutral-700">Giao Hàng Nhanh</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Mã vận đơn:</span>
                                        <span className="font-semibold text-brand-primary">{order.ghnOrderCode}</span>
                                    </div>
                                    {order.expectedDeliveryTime && (
                                        <div className="flex justify-between">
                                            <span className="text-neutral-400">Dự kiến giao:</span>
                                            <span className="font-medium text-neutral-700">{order.expectedDeliveryTime}</span>
                                        </div>
                                    )}
                                    {order.ghnTotalFee && (
                                        <div className="flex justify-between">
                                            <span className="text-neutral-400">Phí GHN:</span>
                                            <span className="font-medium text-neutral-700">{order.ghnTotalFee}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Products List Table */}
                    <div className="mb-8">
                        <h3 className="font-bold text-neutral-800 text-lg mb-4">Sản phẩm ({order.items?.length || 0})</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-100">
                                        <th className="pb-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Sản phẩm</th>
                                        <th className="pb-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-center">Đơn giá</th>
                                        <th className="pb-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-center">SL</th>
                                        <th className="pb-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items?.map((item, index) => (
                                        <tr key={index} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                                            <td className="py-4 flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden border border-neutral-100 shrink-0 bg-neutral-50 flex items-center justify-center">
                                                    {item.thumbnailUrl || item.productThumbnail ? (
                                                        <img src={item.thumbnailUrl || item.productThumbnail} alt={item.productName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ShoppingBag size={20} className="text-neutral-400" />
                                                    )}
                                                </div>
                                                <span className="font-bold text-neutral-700">{item.productName}</span>
                                            </td>
                                            <td className="py-4 text-center font-semibold text-neutral-600">{item.formattedUnitPrice || formatPrice(item.unitPrice)}</td>
                                            <td className="py-4 text-center font-semibold text-neutral-600">{item.quantity}</td>
                                            <td className="py-4 text-right font-bold text-brand-primary">{item.formattedSubtotal || formatPrice(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Order Summary (Tổng kết) & Action */}
                    <div className="flex flex-col-reverse md:flex-row justify-between items-end gap-6">
                        <div className="w-full md:w-auto">
                            {order.status === "CONFIRMED" && (
                                <button
                                    onClick={async () => {
                                        try {
                                            await startDelivery(order.id);
                                            toastService.success("Đã tạo đơn giao hàng thành công!");
                                        } catch (err) {
                                            toastService.error("Lỗi giao hàng: " + (err?.message || "Không xác định"));
                                        }
                                    }}
                                    disabled={isDelivering}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-3 font-bold text-white transition-all hover:bg-brand-dark disabled:opacity-70 w-full md:w-auto shadow-sm"
                                >
                                    {isDelivering ? <Loader2 className="animate-spin" size={20} /> : <Truck size={20} />}
                                    Giao Hàng Qua GHN
                                </button>
                            )}
                            
                            {order.status === "SHIPPING" && (
                                <button
                                    onClick={async () => {
                                        if (window.confirm("Xác nhận giả lập giao hàng thành công cho đơn này?")) {
                                            try {
                                                await completeOrder(order.id);
                                                toastService.success("Đã xác nhận giao hàng thành công!");
                                            } catch (err) {
                                                toastService.error("Lỗi xác nhận: " + (err?.message || "Không xác định"));
                                            }
                                        }
                                    }}
                                    disabled={isCompleting}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-accent-green px-6 py-3 font-bold text-white transition-all hover:bg-accent-green-dark disabled:opacity-70 w-full md:w-auto shadow-sm"
                                >
                                    {isCompleting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                                    Giả lập giao thành công
                                </button>
                            )}
                        </div>
                        <div className="w-full md:w-1/2 lg:w-1/3 space-y-4 bg-neutral-50/50 p-6 rounded-2xl border border-neutral-100">
                            <div className="flex justify-between text-neutral-500 text-sm">
                                <span>Tạm tính</span>
                                <span className="font-semibold text-neutral-700">{order.formattedSubtotal || formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-neutral-500 text-sm">
                                <span>Phí vận chuyển</span>
                                <span className="font-semibold text-neutral-700">{formatPrice(order.shippingFee)}</span>
                            </div>
                            <div className="h-px bg-neutral-150 w-full my-2"></div>
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-neutral-800 text-base">Tổng cộng</span>
                                <span className="font-bold text-2xl text-brand-primary">{order.formattedTotal || formatPrice(order.subtotal + order.shippingFee)}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default OrderDetailPage;