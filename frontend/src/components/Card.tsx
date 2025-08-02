export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--card-bg)] shadow-[var(--card-shadow)] -lg p-6 border border-[var(--border)] transition-colors duration-300">
      {children}
    </div>
  );
}