`use client`;
import { useId, useRef, useEffect } from "react";
import { X } from "lucide-react";

export const InputField = ({ icon: Icon, label, required, hint, onChange, value, ...props }) => {
  const generatedId = useId();
  const id = props.id || generatedId;
  const displayValue = typeof value === "number" ? String(value) : (value ?? "");

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {hint && <span className="text-xs text-gray-500">{hint}</span>}
        </div>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
          </div>
        )}
        <input
          {...props}
          id={id}
          name={id}
          autoComplete={props.autoComplete ?? "off"}
          value={displayValue}
          onChange={onChange}
          className={`w-full rounded-lg bg-gray-900/50 border border-gray-800 ${Icon ? 'pl-10' : 'px-4'} py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-700`}
        />
      </div>
    </div>
  );
};

export const SelectField = ({ icon: Icon, label, children, ...props }) => {
  const generatedId = useId();
  const id = props.id || generatedId;
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
          </div>
        )}
        <select
          {...props}
          id={id}
          name={id}
          className={`w-full rounded-lg bg-gray-900/50 border border-gray-800 ${Icon ? 'pl-10' : 'px-4'} py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-700 appearance-none cursor-pointer`}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const TextareaField = ({ icon: Icon, label, onChange, value, ...props }) => {
  const generatedId = useId();
  const id = props.id || generatedId;
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
            <Icon className="h-4 w-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
          </div>
        )}
        <textarea
          {...props}
          id={id}
          name={id}
          rows={props.rows || 3}
          value={value ?? ""}
          onChange={onChange}
          className={`w-full rounded-lg bg-gray-900/50 border border-gray-800 ${Icon ? 'pl-10' : 'px-4'} py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-700 resize-none`}
        />
      </div>
    </div>
  );
};

export const ArrayCard = ({ children, onRemove, title }) => (
  <div className="relative p-4 bg-gray-900/30 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
    {title && <h4 className="text-sm font-medium text-gray-300 mb-3">{title}</h4>}
    <button
      onClick={onRemove}
      className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
    >
      <X className="h-3.5 w-3.5" />
    </button>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {children}
    </div>
  </div>
);

export const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-gray-900/20 rounded-xl border border-gray-800 p-5 ${className}`}>
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
      <div className="h-6 w-6 rounded-lg bg-red-500/10 flex items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-red-500" />
      </div>
      <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
    </div>
    {children}
  </div>
);
