import { Inbox } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = Inbox, 
  title = "Không có dữ liệu", 
  description = "Hiện tại chưa có dữ liệu nào được tìm thấy.", 
  actionLabel, 
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center border rounded-2xl border-neutral-200 bg-white">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 mb-4">
        <Icon className="text-neutral-400" size={32} />
      </div>
      <h3 className="text-lg font-bold text-neutral-800 mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 mb-6 max-w-md">{description}</p>
      
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
