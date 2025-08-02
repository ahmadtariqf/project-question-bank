export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="
        w-full px-3 py-2 -none
        bg-[var(--input-bg)] border border-[var(--input-border)]
        focus:border-[var(--input-focus)] focus:ring-2 focus:ring-[var(--input-focus)]
        transition-colors duration-200 
      "
      {...props}
    />
  );
}