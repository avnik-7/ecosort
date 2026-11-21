import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileWarning,
  HelpCircle,
  Trash2,
  Truck,
  Wrench,
} from 'lucide-react';
import {
  CivicReportHistoryEntry,
  CivicReportStatus,
  CivicReportType,
} from '../types/ecosort';

export const STATUS_VISUALS: Record<
  CivicReportStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    textClass: string;
    surfaceClass: string;
    borderClass: string;
  }
> = {
  Submitted: {
    icon: Clock,
    textClass: 'text-[#395543]',
    surfaceClass: 'bg-[#EBF1EC]',
    borderClass: 'border-[#CFDAD1]',
  },
  'Under Review': {
    icon: Eye,
    textClass: 'text-[#6A4C1E]',
    surfaceClass: 'bg-[#F9F3E8]',
    borderClass: 'border-[#E6D6BC]',
  },
  'In Progress': {
    icon: Wrench,
    textClass: 'text-[#8C3F19]',
    surfaceClass: 'bg-[#FBF3EB]',
    borderClass: 'border-[#EAD3BE]',
  },
  Resolved: {
    icon: CheckCircle2,
    textClass: 'text-[#1F4E37]',
    surfaceClass: 'bg-[#E6F2EA]',
    borderClass: 'border-[#C5DEC9]',
  },
};

export const REPORT_TYPE_ICONS: Record<
  CivicReportType,
  React.ComponentType<{ className?: string }>
> = {
  overflowing_bin: Trash2,
  illegal_dumping: FileWarning,
  missed_collection: Truck,
  hazardous_waste: AlertTriangle,
  other: HelpCircle,
};

export function ReportStatusLabel({ status }: { status: CivicReportStatus }) {
  const style = STATUS_VISUALS[status];
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap ${style.surfaceClass} ${style.borderClass} ${style.textClass}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}

export function formatReportDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ReportStatusHistoryTimeline({
  history,
}: {
  history: CivicReportHistoryEntry[];
}) {
  return (
    <ol className="space-y-3">
      {history.map((entry, idx) => {
        const style = STATUS_VISUALS[entry.status];
        const Icon = style.icon;
        return (
          <li
            key={entry.id}
            className="flex items-start gap-3 text-sm"
          >
            <span
              className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${style.surfaceClass} ${style.borderClass} ${style.textClass}`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <div className="flex-1 min-w-0 space-y-0.5 pb-3 border-b border-[#DCE3DD] last:border-b-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-[#1E2421]">
                  {entry.status}
                  <span className="font-normal text-xs text-[#525D57] ml-2">
                    by {entry.actor}
                  </span>
                </span>
                <span className="font-mono tabular-nums text-xs text-[#525D57]">
                  #{idx + 1} · {formatReportDate(entry.timestamp)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#525D57] leading-relaxed">
                {entry.note}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
