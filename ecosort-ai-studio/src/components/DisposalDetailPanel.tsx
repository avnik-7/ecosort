import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  X,
} from 'lucide-react';
import { WASTE_CATEGORIES } from '../data/wasteCatalog';
import { WasteItem } from '../types/ecosort';
import { CATEGORY_STYLES, CategoryIcon } from './categoryTheme';

interface DisposalDetailPanelProps {
  item: WasteItem;
  onClose?: () => void;
  onSelectRelated?: (item: WasteItem) => void;
  relatedItems?: WasteItem[];
}

export function DisposalDetailPanel({
  item,
  onClose,
  onSelectRelated,
  relatedItems = [],
}: DisposalDetailPanelProps) {
  const category = WASTE_CATEGORIES[item.category];
  const style = CATEGORY_STYLES[item.category];

  return (
    <article className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-7 shadow-sm">
      <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#DCE3DD]">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#525D57]">
            <span className={`inline-flex items-center gap-1.5 font-semibold ${style.accentText}`}>
              <CategoryIcon category={item.category} className="w-4 h-4" />
              {category.name}
            </span>
            <span aria-hidden="true">·</span>
            <span>{category.binDesignation}</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1E2421] tracking-tight">
            {item.name}
          </h3>
          {item.aliases.length > 0 && (
            <p className="text-xs sm:text-sm text-[#525D57]">
              Also searched as: {item.aliases.slice(0, 5).join(' · ')}
            </p>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close disposal instructions"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#525D57] hover:text-[#1E2421] hover:bg-[#F8F7F3] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Why it belongs here */}
      <div className="py-5 border-b border-[#DCE3DD] space-y-2">
        <h4 className="text-sm font-semibold text-[#1E2421]">Why this stream</h4>
        <p className="text-sm sm:text-base text-[#525D57] leading-relaxed">
          {item.explanation}
        </p>
      </div>

      {/* Safety warning if applicable */}
      {item.safetyWarning && (
        <div className="mt-5 rounded-xl bg-[#FBF3EB] border border-[#EAD3BE] p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#8C3F19] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#8C3F19]">Safety Warning</p>
            <p className="text-sm text-[#5D331B] leading-relaxed">{item.safetyWarning}</p>
          </div>
        </div>
      )}

      {/* Step-by-step disposal instructions */}
      <div className="py-5 space-y-3">
        <h4 className="text-sm font-semibold text-[#1E2421]">
          Step-by-step disposal instructions
        </h4>
        <ol className="space-y-2.5">
          {item.disposalSteps.map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm text-[#1E2421] leading-relaxed">
              <span className="font-mono tabular-nums text-xs font-medium w-6 h-6 rounded-md bg-[#EBF1EC] text-[#1F4E37] flex items-center justify-center shrink-0 mt-0.5">
                0{index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Preparation & Drop-off metadata rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#DCE3DD]">
        <div className="rounded-xl bg-[#F8F7F3] p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1F4E37]">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Preparation Tip</span>
          </div>
          <p className="text-sm text-[#525D57] leading-relaxed">{item.preparationTip}</p>
        </div>

        <div className="rounded-xl bg-[#F8F7F3] p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1F4E37]">
            <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Where It Goes</span>
          </div>
          <p className="text-sm text-[#525D57] leading-relaxed">{item.dropOffChannel}</p>
        </div>
      </div>

      {item.commonMistake && (
        <div className="mt-4 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#525D57] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm text-[#525D57]">
            <span className="font-semibold text-[#1E2421]">Common mistake to avoid: </span>
            {item.commonMistake}
          </div>
        </div>
      )}

      {relatedItems.length > 0 && onSelectRelated && (
        <div className="mt-5 pt-4 border-t border-[#DCE3DD] space-y-2.5">
          <p className="text-xs font-semibold text-[#525D57]">
            Related items in {category.shortName}
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedItems.map((rel) => (
              <button
                key={rel.id}
                type="button"
                onClick={() => onSelectRelated(rel)}
                className="min-h-[40px] px-3.5 py-2 rounded-lg border border-[#DCE3DD] bg-[#FFFFFF] hover:bg-[#E6F2EA] hover:border-[#C5DEC9] text-xs font-medium text-[#1E2421] transition-colors"
              >
                {rel.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
