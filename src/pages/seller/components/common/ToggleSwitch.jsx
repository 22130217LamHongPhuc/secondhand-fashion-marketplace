const ToggleSwitch = ({ checked, onChange, label, disabled = false }) => {
  return (
    <div className="flex items-center gap-3">
      <div
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-2 focus:ring-brand-primary/20 focus:ring-offset-2 ${
          checked ? "bg-brand-primary" : "bg-neutral-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-2.5" : "translate-x-0"
          }`}
        />
      </div>
      {label && (
        <span
          className={`text-sm font-medium select-none ${disabled ? "text-neutral-400" : "text-neutral-700"}`}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default ToggleSwitch;
