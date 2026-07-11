export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div>
        <h1 className="text-2xl sm:text-heading-md font-bold text-ink leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-caption text-ash mt-1 sm:mt-0.5">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3">{children}</div>
      )}
    </div>
  );
}
