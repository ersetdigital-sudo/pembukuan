export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
      <div>
        <h1 className="text-heading-md font-semibold text-ink leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-caption text-ash mt-0.5">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </div>
  );
}
