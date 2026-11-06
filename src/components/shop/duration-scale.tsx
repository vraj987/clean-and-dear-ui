import { cn } from "@/lib/utils";

export function DurationScale({
  months,
  selectedMonth,
  accentColor,
  textColor,
  className,
}: {
  months: number[];
  selectedMonth: number;
  accentColor: string;
  textColor: string;
  className?: string;
}) {
  const firstMonth = months[0] ?? 1;
  const lastMonth = months[months.length - 1] ?? 24;
  const monthRange = lastMonth - firstMonth;

  return (
    <div className={cn("relative mx-2 mt-2 h-4 select-none text-[9px] font-medium tabular-nums sm:text-[11px]", className)}>
      {months.map((month) => (
        <span
          key={month}
          className={cn("absolute top-0 -translate-x-1/2 whitespace-nowrap", month === selectedMonth && "font-bold")}
          style={{
            left: `${monthRange <= 0 ? 50 : ((month - firstMonth) / monthRange) * 100}%`,
            color: month === selectedMonth ? accentColor : textColor,
          }}
        >
          {month}
        </span>
      ))}
    </div>
  );
}
