import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message = "Đã có lỗi xảy ra. Vui lòng thử lại sau.", onRetry, variant = "inline" }) => {
  const containerClasses = variant === "fullpage" 
    ? "flex flex-col items-center justify-center min-h-[400px] p-6 text-center"
    : "flex flex-col items-center justify-center p-12 text-center border rounded-2xl border-neutral-200 bg-neutral-50";

  return (
    <div className={containerClasses}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-red-light mb-4">
        <AlertCircle className="text-accent-red" size={24} />
      </div>
      <h3 className="text-lg font-bold text-neutral-800 mb-2">Đã có lỗi xảy ra</h3>
      <p className="text-sm text-neutral-500 mb-6 max-w-md">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 rounded-xl bg-white border border-neutral-200 px-6 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 active:scale-[0.98]"
        >
          <RefreshCw size={16} />
          Thử lại
        </button>
      )}
    </div>
  );
};

export default ErrorState;
