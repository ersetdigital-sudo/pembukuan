export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 pb-4 border-b border-hairline/30">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-ash/70 font-medium">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4">{children}</div>
      )}
    </div>
  );
}
