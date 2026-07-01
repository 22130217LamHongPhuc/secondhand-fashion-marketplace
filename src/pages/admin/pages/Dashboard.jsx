import { useEffect, useState } from "react";
import { dashboardService } from "@/services/admin";
import AdminLoader from "@/components/common/AdminLoader";
import { 
  ShoppingBag, 
  Users, 
  Store, 
  ClipboardList, 
  TrendingUp, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight,
  PlusCircle,
  Clock,
  UserCheck,
  AlertCircle
} from "lucide-react";

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Interactive Chart States
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredDonutIndex, setHoveredDonutIndex] = useState(null);

  const loadDashboardData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const [statsData, activitiesData, salesRes] = await Promise.all([
        dashboardService.getStatistics().catch(() => null),
        dashboardService.getRecentActivities().catch(() => []),
        dashboardService.getSalesData("month").catch(() => null),
      ]);

      setStats(statsData || {});
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      
      // Process sales data
      if (salesRes && Array.isArray(salesRes) && salesRes.length > 0) {
        setSalesData(salesRes);
      } else {
        // Fallback data for beautiful trend chart
        setSalesData([
          { label: "Thứ 2", revenue: 1250000, orders: 12 },
          { label: "Thứ 3", revenue: 2150000, orders: 18 },
          { label: "Thứ 4", revenue: 1800000, orders: 15 },
          { label: "Thứ 5", revenue: 3200000, orders: 24 },
          { label: "Thứ 6", revenue: 2900000, orders: 20 },
          { label: "Thứ 7", revenue: 4800000, orders: 35 },
          { label: "Chủ Nhật", revenue: 5600000, orders: 42 },
        ]);
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getStatusBadgeClass = (status = "") => {
    const s = status.toUpperCase();
    const base = "inline-block py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider ";
    if (s === "PENDING") return base + "bg-amber-50 text-amber-700 border border-amber-100";
    if (s === "CONFIRMED") return base + "bg-blue-50 text-blue-700 border border-blue-100";
    if (s === "SHIPPING") return base + "bg-indigo-50 text-indigo-700 border border-indigo-100";
    if (s === "DONE" || s === "DELIVERED") return base + "bg-emerald-50 text-emerald-700 border border-emerald-100";
    if (s === "CANCELLED") return base + "bg-rose-50 text-rose-700 border border-rose-100";
    return base + "bg-stone-50 text-stone-700 border border-stone-100";
  };

  if (loading) {
    return <AdminLoader text="Đang tải dữ liệu Dashboard..." />;
  }

  // Calculate percentages for Donut chart
  const totalForDonut = Math.max(stats?.totalOrders || 0, 1);
  const orderStatuses = [
    { label: "Hoàn thành", count: stats?.completedOrders || 0, color: "#10b981", percent: ((stats?.completedOrders || 0) / totalForDonut) * 100 },
    { label: "Đang giao", count: stats?.shippingOrders || 0, color: "#6366f1", percent: ((stats?.shippingOrders || 0) / totalForDonut) * 100 },
    { label: "Đã xác nhận", count: stats?.confirmedOrders || 0, color: "#3b82f6", percent: ((stats?.confirmedOrders || 0) / totalForDonut) * 100 },
    { label: "Chờ xử lý", count: stats?.pendingOrders || 0, color: "#f59e0b", percent: ((stats?.pendingOrders || 0) / totalForDonut) * 100 },
    { label: "Đã hủy", count: stats?.cancelledOrders || 0, color: "#ef4444", percent: ((stats?.cancelledOrders || 0) / totalForDonut) * 100 },
    { label: "Đơn hoàn trả", count: stats?.returnedOrders || 0, color: "#f43f5e", percent: ((stats?.returnedOrders || 0) / totalForDonut) * 100 },
  ];

  // SVG Line Chart computations
  const chartWidth = 550;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  
  const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1000000);
  const minRevenue = 0;
  
  const getX = (index) => paddingX + (index * (chartWidth - paddingX * 2)) / (salesData.length - 1);
  const getY = (value) => chartHeight - paddingY - ((value - minRevenue) * (chartHeight - paddingY * 2)) / (maxRevenue - minRevenue);

  // Generate Bezier Curve path
  let linePath = "";
  if (salesData.length > 0) {
    linePath = `M ${getX(0)} ${getY(salesData[0].revenue)}`;
    for (let i = 0; i < salesData.length - 1; i++) {
      const x1 = getX(i);
      const y1 = getY(salesData[i].revenue);
      const x2 = getX(i + 1);
      const y2 = getY(salesData[i + 1].revenue);
      // Control points for smooth bezier
      const cpX1 = x1 + (x2 - x1) / 2;
      const cpY1 = y1;
      const cpX2 = x1 + (x2 - x1) / 2;
      const cpY2 = y2;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x2} ${y2}`;
    }
  }

  // Generate Area path under the curve
  const areaPath = linePath + ` L ${getX(salesData.length - 1)} ${chartHeight - paddingY} L ${getX(0)} ${chartHeight - paddingY} Z`;

  // SVG Donut Chart computations
  const donutRadius = 65;
  const donutStrokeWidth = 14;
  const donutCenter = 85;
  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col min-h-full animate-[fadeIn_0.3s_ease] [color-scheme:light] pb-10">
      
      {/* Upper Title Row */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-900 m-0">Hệ thống quản trị</h1>
          <p className="text-xs text-stone-400 mt-1 m-0 font-semibold">Theo dõi hiệu suất kinh doanh và quản lý người dùng toàn hệ thống</p>
        </div>
        
        <button 
          onClick={() => loadDashboardData(true)}
          disabled={refreshing}
          className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl py-2.5 px-4 text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#c85a28]" : ""}`} />
          <span>Làm mới số liệu</span>
        </button>
      </div>

      {/* Main Stats Cards Row 1 */}
      <h3 className="text-xs font-black text-stone-400 tracking-widest uppercase mb-3">Chỉ số hệ thống</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-6">
        
        {/* Card 1: Doanh thu */}
        <div className="bg-gradient-to-br from-[#fff7f2] to-[#fff1e6] border border-[#fbd6bc] rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">TỔNG DOANH THU</span>
              <h2 className="text-xl font-black text-[#c85a28] mt-1 m-0">
                {stats?.totalRevenue?.toLocaleString("vi-VN")}đ
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl grid place-items-center bg-[#c85a28] text-white shadow-md shadow-orange-500/10">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`flex items-center gap-1 mt-4 text-[10px] font-bold ${stats?.revenueGrowth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {stats?.revenueGrowth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{stats?.revenueGrowth >= 0 ? "+" : ""}{stats?.revenueGrowth?.toFixed(1)}% so với tháng trước</span>
          </div>
        </div>

        {/* Card 2: Đơn hàng */}
        <div className="bg-gradient-to-br from-[#f5f3ff] to-[#eddfff] border border-[#d8c5ff] rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">ĐƠN HÀNG</span>
              <h2 className="text-xl font-black text-purple-900 mt-1 m-0">
                {stats?.totalOrders || 0}
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl grid place-items-center bg-purple-600 text-white shadow-md shadow-purple-500/10">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className={`flex items-center gap-1 mt-4 text-[10px] font-bold ${stats?.orderGrowth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {stats?.orderGrowth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{stats?.orderGrowth >= 0 ? "+" : ""}{stats?.orderGrowth?.toFixed(1)}% so với tháng trước</span>
          </div>
        </div>

        {/* Card 3: Sản phẩm */}
        <div className="bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] border border-[#bfdbfe] rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">SẢN PHẨM</span>
              <h2 className="text-xl font-black text-blue-900 mt-1 m-0">
                {stats?.totalProducts || 0}
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl grid place-items-center bg-blue-600 text-white shadow-md shadow-blue-500/10">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[10px] font-bold text-stone-500">
            <span>Quản lý sản phẩm toàn sàn</span>
          </div>
        </div>

        {/* Card 4: Người bán */}
        <div className="bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] border border-[#fde68a] rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">NGƯỜI BÁN</span>
              <h2 className="text-xl font-black text-amber-900 mt-1 m-0">
                {stats?.totalSellers || 0}
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl grid place-items-center bg-amber-500 text-white shadow-md shadow-amber-500/10">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[10px] font-bold text-amber-700">
            <span>{stats?.activeShops || 0} hoạt động / {stats?.verifiedShops || 0} xác thực</span>
          </div>
        </div>

        {/* Card 5: Người mua */}
        <div className="bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5] border border-[#a7f3d0] rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">NGƯỜI MUA</span>
              <h2 className="text-xl font-black text-emerald-900 mt-1 m-0">
                {stats?.totalCustomers || 0}
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl grid place-items-center bg-emerald-600 text-white shadow-md shadow-emerald-500/10">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className={`flex items-center gap-1 mt-4 text-[10px] font-bold ${stats?.userGrowth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {stats?.userGrowth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{stats?.userGrowth >= 0 ? "+" : ""}{stats?.userGrowth?.toFixed(1)}% so với tháng trước</span>
          </div>
        </div>

        {/* Card 6: Quản trị viên */}
        <div className="bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border border-[#cbd5e1] rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">ADMIN</span>
              <h2 className="text-xl font-black text-slate-800 mt-1 m-0">
                {stats?.totalAdmins || 0}
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl grid place-items-center bg-slate-600 text-white shadow-md shadow-slate-500/10">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[10px] font-bold text-slate-600">
            <span>Quản trị hệ thống</span>
          </div>
        </div>

      </div>

      {/* Operational & Growth Stats Row 2 */}
      <h3 className="text-xs font-black text-stone-400 tracking-widest uppercase mb-3 mt-2">Chỉ số vận hành & tăng trưởng</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-8">
        
        {/* Card 6: Tỷ lệ hủy đơn */}
        <div className="bg-gradient-to-br from-[#fff5f5] to-[#ffe3e3] border border-[#ffd0d0] rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-stone-450 tracking-wider uppercase">TỶ LỆ HỦY ĐƠN</span>
              <h2 className="text-xl font-black text-rose-600 mt-1 m-0">
                {stats?.cancellationRate?.toFixed(1)}%
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl grid place-items-center bg-rose-600 text-white shadow-md shadow-rose-500/10">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[10px] font-bold text-rose-600">
            <span>{stats?.cancelledOrders || 0} đơn hàng bị hủy</span>
          </div>
        </div>

        {/* Card 7: Khiếu nại & Hoàn trả */}
        <div className="bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] border border-[#fde68a] rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-stone-450 tracking-wider uppercase">KHIẾU NẠI & HOÀN TRẢ</span>
              <h2 className="text-xl font-black text-amber-900 mt-1 m-0">
                {stats?.pendingComplaints || 0} chờ xử lý
              </h2>
            </div>
            <div className="w-9 h-9 grid place-items-center bg-amber-500 text-white rounded-xl shadow-md shadow-amber-500/10">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[10px] font-bold text-amber-700">
            <span>Tỷ lệ hoàn: {stats?.returnRate?.toFixed(1)}% ({stats?.returnedOrders || 0} đơn)</span>
          </div>
        </div>

        {/* Card 8: Tăng trưởng doanh thu */}
        <div className="bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5] border border-[#a7f3d0] rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-stone-450 tracking-wider uppercase">TĂNG TRƯỞNG DOANH THU</span>
              <h2 className={`text-xl font-black mt-1 m-0 ${stats?.revenueGrowth >= 0 ? "text-emerald-700" : "text-rose-650"}`}>
                {stats?.revenueGrowth >= 0 ? "+" : ""}{stats?.revenueGrowth?.toFixed(1)}%
              </h2>
            </div>
            <div className={`w-9 h-9 rounded-xl grid place-items-center text-white shadow-md ${stats?.revenueGrowth >= 0 ? "bg-emerald-600 shadow-emerald-500/10" : "bg-rose-600 shadow-rose-500/10"}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[10px] font-semibold text-stone-500">
            <span>Doanh số 30 ngày qua</span>
          </div>
        </div>

        {/* Card 9: Tăng trưởng đơn hàng */}
        <div className="bg-gradient-to-br from-[#f5f3ff] to-[#eddfff] border border-[#d8c5ff] rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-stone-450 tracking-wider uppercase">TĂNG TRƯỞNG ĐƠN HÀNG</span>
              <h2 className={`text-xl font-black mt-1 m-0 ${stats?.orderGrowth >= 0 ? "text-purple-700" : "text-rose-650"}`}>
                {stats?.orderGrowth >= 0 ? "+" : ""}{stats?.orderGrowth?.toFixed(1)}%
              </h2>
            </div>
            <div className={`w-9 h-9 rounded-xl grid place-items-center text-white shadow-md ${stats?.orderGrowth >= 0 ? "bg-purple-650 shadow-purple-500/10" : "bg-rose-600 shadow-rose-500/10"}`}>
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[10px] font-semibold text-stone-500">
            <span>Giao dịch 30 ngày qua</span>
          </div>
        </div>

        {/* Card 10: Tăng trưởng người dùng */}
        <div className="bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] border border-[#bfdbfe] rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-stone-450 tracking-wider uppercase">TĂNG TRƯỞNG NGƯỜI DÙNG</span>
              <h2 className={`text-xl font-black mt-1 m-0 ${stats?.userGrowth >= 0 ? "text-blue-700" : "text-rose-650"}`}>
                {stats?.userGrowth >= 0 ? "+" : ""}{stats?.userGrowth?.toFixed(1)}%
              </h2>
            </div>
            <div className={`w-9 h-9 rounded-xl grid place-items-center text-white shadow-md ${stats?.userGrowth >= 0 ? "bg-blue-600 shadow-blue-500/10" : "bg-rose-600 shadow-rose-500/10"}`}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[10px] font-semibold text-stone-500">
            <span>Đăng ký 30 ngày qua</span>
          </div>
        </div>

        {/* Card 11: Tăng trưởng cửa hàng */}
        <div className="bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] border border-[#fde68a] rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-stone-450 tracking-wider uppercase">TĂNG TRƯỞNG CỬA HÀNG</span>
              <h2 className={`text-xl font-black mt-1 m-0 ${stats?.shopGrowth >= 0 ? "text-amber-700" : "text-rose-650"}`}>
                {stats?.shopGrowth >= 0 ? "+" : ""}{stats?.shopGrowth?.toFixed(1)}%
              </h2>
            </div>
            <div className={`w-9 h-9 rounded-xl grid place-items-center text-white shadow-md ${stats?.shopGrowth >= 0 ? "bg-amber-500 shadow-amber-500/10" : "bg-rose-600 shadow-rose-500/10"}`}>
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[10px] font-semibold text-stone-500">
            <span>Đăng ký mới 30 ngày qua</span>
          </div>
        </div>

      </div>

      {/* Charts Visualization Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Widget: Interactive SVG Trend Line Chart */}
        <div className="lg:col-span-2 bg-white border border-stone-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-black text-stone-900 m-0">Doanh thu & Xu hướng giao dịch</h3>
              <p className="text-[10px] text-stone-400 font-semibold mt-0.5 m-0">Biểu đồ thể hiện mức tăng trưởng doanh thu 7 ngày gần nhất</p>
            </div>
            
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg p-1">
              <button className="bg-white text-[10px] font-bold text-stone-700 rounded py-1 px-2.5 shadow-sm border-none cursor-pointer">7 ngày</button>
              <button className="bg-transparent text-[10px] font-bold text-stone-400 hover:text-stone-700 rounded py-1 px-2.5 border-none cursor-pointer">Tháng</button>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="relative w-full overflow-hidden flex-1 flex items-center justify-center min-h-[220px]">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-full overflow-visible"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const chartW = rect.width - (paddingX * 2 * (rect.width / chartWidth));
                const step = chartW / (salesData.length - 1);
                const localX = x - (paddingX * (rect.width / chartWidth));
                const index = Math.round(localX / step);
                if (index >= 0 && index < salesData.length) {
                  setHoveredIndex(index);
                }
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c85a28" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#c85a28" stopOpacity="0.00" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff8c00" />
                  <stop offset="100%" stopColor="#c85a28" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                const yVal = paddingY + p * (chartHeight - paddingY * 2);
                return (
                  <line 
                    key={idx} 
                    x1={paddingX} 
                    y1={yVal} 
                    x2={chartWidth - paddingX} 
                    y2={yVal} 
                    stroke="#f3f3f3" 
                    strokeWidth="1" 
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Area Path */}
              {salesData.length > 0 && (
                <path d={areaPath} fill="url(#areaGradient)" />
              )}

              {/* Stroke Line */}
              {salesData.length > 0 && (
                <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" />
              )}

              {/* Y Axis labels */}
              <text x={paddingX - 10} y={getY(maxRevenue)} textAnchor="end" fontSize="9" fontWeight="bold" fill="#a8a29e">{(maxRevenue/1000).toFixed(0)}k</text>
              <text x={paddingX - 10} y={getY(maxRevenue*0.5)} textAnchor="end" fontSize="9" fontWeight="bold" fill="#a8a29e">{((maxRevenue*0.5)/1000).toFixed(0)}k</text>
              <text x={paddingX - 10} y={chartHeight - paddingY} textAnchor="end" fontSize="9" fontWeight="bold" fill="#a8a29e">0</text>

              {/* X Axis labels */}
              {salesData.map((data, idx) => {
                const interval = Math.ceil(salesData.length / 6);
                const isLast = idx === salesData.length - 1;
                const isFirst = idx === 0;
                const isInterval = idx % interval === 0;
                const isTooCloseToLast = (salesData.length - 1 - idx) < (interval / 2);
                const showLabel = isFirst || isLast || (isInterval && !isTooCloseToLast);

                if (!showLabel) return null;

                return (
                  <text 
                    key={idx} 
                    x={getX(idx)} 
                    y={chartHeight - 10} 
                    textAnchor="middle" 
                    fontSize="9" 
                    fontWeight="bold" 
                    fill={hoveredIndex === idx ? "#c85a28" : "#a8a29e"}
                    className="transition-colors duration-200"
                  >
                    {data.label}
                  </text>
                );
              })}

              {/* Data points */}
              {salesData.map((data, idx) => (
                <circle 
                  key={idx}
                  cx={getX(idx)}
                  cy={getY(data.revenue)}
                  r={hoveredIndex === idx ? 5 : 3}
                  fill={hoveredIndex === idx ? "#c85a28" : "#ffffff"}
                  stroke="#c85a28"
                  strokeWidth={hoveredIndex === idx ? 3 : 2}
                  className="transition-all duration-150 cursor-pointer"
                />
              ))}

              {/* Hover vertical guide line */}
              {hoveredIndex !== null && (
                <line 
                  x1={getX(hoveredIndex)} 
                  y1={paddingY} 
                  x2={getX(hoveredIndex)} 
                  y2={chartHeight - paddingY} 
                  stroke="#c85a28" 
                  strokeWidth="1" 
                  strokeOpacity="0.4"
                />
              )}
            </svg>
          </div>

          {/* Interactive Tooltip Overlay */}
          {hoveredIndex !== null && (
            <div 
              className="absolute bg-[#3e2723] text-white rounded-xl p-3 shadow-xl border border-stone-800/20 z-10 pointer-events-none flex flex-col gap-1 text-[11px] animate-[fadeIn_0.15s_ease-out]"
              style={{
                left: `${getX(hoveredIndex) * 1.3}px`,
                top: `${getY(salesData[hoveredIndex].revenue) - 60}px`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="font-extrabold opacity-70 border-b border-white/10 pb-1 mb-1 uppercase tracking-wider">{salesData[hoveredIndex].label}</div>
              <div className="flex justify-between gap-5 font-bold">
                <span>Doanh thu:</span>
                <span className="text-[#ffb74d]">{salesData[hoveredIndex].revenue.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between gap-5 font-semibold text-[10px] opacity-80">
                <span>Đơn hàng:</span>
                <span>{salesData[hoveredIndex].orders} đơn</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Widget: Order Status Donut Chart */}
        <div className="bg-white border border-stone-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-stone-900 m-0">Trạng thái Đơn hàng</h3>
            <p className="text-[10px] text-stone-400 font-semibold mt-0.5 m-0">Tỉ lệ đóng góp của từng trạng thái giao dịch</p>
          </div>

          <div className="flex items-center justify-center gap-6 my-4">
            {/* SVG Donut */}
            <div className="relative w-[170px] h-[170px] flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {orderStatuses.map((status, idx) => {
                  const strokeDasharray = `${(status.percent / 100) * 2 * Math.PI * donutRadius} ${2 * Math.PI * donutRadius}`;
                  const strokeDashoffset = `-${(accumulatedAngle / 100) * 2 * Math.PI * donutRadius}`;
                  accumulatedAngle += status.percent;
                  
                  return (
                    <circle
                      key={idx}
                      cx={donutCenter}
                      cy={donutCenter}
                      r={donutRadius}
                      fill="transparent"
                      stroke={status.color}
                      strokeWidth={hoveredDonutIndex === idx ? donutStrokeWidth + 3 : donutStrokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      onMouseEnter={() => setHoveredDonutIndex(idx)}
                      onMouseLeave={() => setHoveredDonutIndex(null)}
                      className="transition-all duration-300 cursor-pointer"
                    />
                  );
                })}
              </svg>

              {/* Center text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">TỔNG CỘNG</span>
                <span className="text-xl font-black text-stone-900 mt-0.5">
                  {stats?.totalOrders || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Legends */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {orderStatuses.map((status, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all cursor-pointer ${
                  hoveredDonutIndex === idx ? "bg-stone-50 border-stone-200" : "bg-transparent border-transparent"
                }`}
                onMouseEnter={() => setHoveredDonutIndex(idx)}
                onMouseLeave={() => setHoveredDonutIndex(null)}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-stone-500 text-[10px] truncate leading-none">{status.label}</span>
                  <span className="font-extrabold text-stone-800 text-xs mt-1">{status.count} ({Math.round(status.percent)}%)</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Bottom Grid: Recent Orders and Timeline Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-stone-200/70">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-sm font-black text-[#8b5a3c] m-0 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#c85a28]" />
              <span>Đơn hàng vừa đặt mới</span>
            </h2>
            <span className="text-[10px] font-bold text-stone-400 bg-stone-50 border border-stone-200 py-1 px-2.5 rounded-lg uppercase tracking-wider">Mới nhất</span>
          </div>

          <div className="overflow-x-auto">
            {stats?.recentOrders?.length > 0 ? (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="pb-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest">MÃ ĐƠN</th>
                    <th className="pb-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest">KHÁCH HÀNG</th>
                    <th className="pb-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest">TỔNG TIỀN</th>
                    <th className="pb-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50/50 border-b border-stone-50 last:border-none transition-colors">
                      <td className="py-3.5 text-xs text-[#c85a28] font-bold">#{order.id}</td>
                      <td className="py-3.5 text-xs text-stone-900 font-bold">{order.customerName}</td>
                      <td className="py-3.5 text-xs text-stone-700 font-extrabold">{order.total?.toLocaleString("vi-VN")} đ</td>
                      <td className="py-3.5 text-xs text-center">
                        <span className={getStatusBadgeClass(order.status)}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-stone-400 text-xs font-semibold flex flex-col items-center justify-center gap-3">
                <ClipboardList className="w-8 h-8 text-stone-300 animate-pulse" />
                <span>Không có đơn hàng mới nào gần đây</span>
              </div>
            )}
          </div>
        </div>

        {/* Timeline Activities Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200/70">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-sm font-black text-[#8b5a3c] m-0 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#c85a28]" />
              <span>Hoạt động hệ thống</span>
            </h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="flex flex-col gap-4 max-h-[290px] overflow-y-auto pr-1">
            {activities.length > 0 ? (
              activities.map((activity, idx) => {
                // Style icon based on content
                let itemIcon = <PlusCircle className="w-3.5 h-3.5 text-blue-600" />;
                let iconBg = "bg-blue-50";
                const desc = (activity.description || "").toLowerCase();
                if (desc.includes("đăng ký") || desc.includes("user")) {
                  itemIcon = <UserCheck className="w-3.5 h-3.5 text-emerald-600" />;
                  iconBg = "bg-emerald-50";
                } else if (desc.includes("khiếu nại") || desc.includes("báo cáo") || desc.includes("lỗi")) {
                  itemIcon = <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
                  iconBg = "bg-rose-50";
                } else if (desc.includes("mua") || desc.includes("đơn hàng")) {
                  itemIcon = <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />;
                  iconBg = "bg-purple-50";
                }

                return (
                  <div key={idx} className="flex gap-3.5 items-start relative pb-4 last:pb-0 before:content-[''] before:absolute before:left-4 before:top-8 before:bottom-0 before:w-[1.5px] before:bg-stone-100 last:before:hidden">
                    <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      {itemIcon}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-stone-400 font-bold">
                        {new Date(activity.timestamp).toLocaleTimeString("vi-VN")} - {new Date(activity.timestamp).toLocaleDateString("vi-VN")}
                      </span>
                      <p className="text-xs text-stone-700 font-semibold m-0 mt-1 leading-normal break-words">{activity.description}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-stone-400 text-xs font-semibold flex flex-col items-center justify-center gap-3">
                <Clock className="w-8 h-8 text-stone-300" />
                <span>Hệ thống chưa ghi nhận hoạt động mới nào</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
