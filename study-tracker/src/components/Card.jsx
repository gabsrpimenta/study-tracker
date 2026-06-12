export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`p-5 pb-2 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`font-semibold text-lg ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-5 pt-2 ${className}`}>{children}</div>;
}

export function Progress({ value = 0, className = '' }) {
  return (
    <div className={`h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${className}`}>
      {children}
    </span>
  );
}
