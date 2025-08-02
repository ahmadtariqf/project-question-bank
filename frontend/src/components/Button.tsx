export default function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="
        px-4 py-2  font-semibold
        bg-[var(--accent)] text-[var(--accent-contrast)]
        border border-[var(--accent)]
        hover:bg-[var(--accent-contrast)] hover:text-[var(--accent)]
        focus:outline-none focus:ring-2 focus:ring-[var(--accent)]
        transition-colors duration-200  cursor-pointer
      "
      {...props}
    >
      {children}
    </button>
  );
}