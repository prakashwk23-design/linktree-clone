import type { ChangeEvent, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const inputClass =
  "h-11 w-full rounded-xl border border-shade/15 bg-white px-3.5 text-[15px] text-shade outline-none transition placeholder:text-shade/55 focus:border-shade/40 focus:ring-4 focus:ring-shade/[0.06] disabled:opacity-60";

export const textareaClass =
  "w-full rounded-xl border border-shade/15 bg-white px-3.5 py-2.5 text-[15px] text-shade outline-none transition placeholder:text-shade/55 focus:border-shade/40 focus:ring-4 focus:ring-shade/[0.06] resize-none";

export const selectClass =
  "h-11 w-full appearance-none rounded-xl border border-shade/15 bg-white px-3.5 pr-9 text-[15px] text-shade outline-none transition focus:border-shade/40 focus:ring-4 focus:ring-shade/[0.06]";

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  className = "",
}: {
  label?: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-shade">
          {label}
        </label>
      )}
      {children}
      {error ? <p className="text-[12px] font-medium text-[#c43333]">{error}</p> : null}
      {hint ? <div className="text-[12px] leading-relaxed text-shade/50">{hint}</div> : null}
    </div>
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${textareaClass} ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={`${selectClass} ${className}`} {...props}>
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-shade/50"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Switch({
  name,
  defaultChecked,
  checked,
  onChange,
  label,
  description,
}: {
  name: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-semibold text-shade">{label}</span>
        {description ? <span className="mt-0.5 block text-[12px] text-shade/55">{description}</span> : null}
      </span>
      <span className="relative mt-0.5 inline-flex h-6 w-11 flex-none">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-shade/15 transition peer-checked:bg-forest" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
