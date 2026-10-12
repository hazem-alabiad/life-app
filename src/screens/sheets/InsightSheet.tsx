import { BookOpen, Sparkles } from 'lucide-react';
import { Sheet } from '../../components/Sheet';
import { SectionLabel } from '../../components/Card';
import { useStore } from '../../state/store';
import { dayOfYear } from '../../lib/date';
import { INSIGHTS } from '../../data/insights';

export function InsightSheet({ onClose }: { onClose: () => void }) {
  const { now } = useStore();
  const insight = INSIGHTS[dayOfYear(new Date(now)) % INSIGHTS.length]!;

  return (
    <Sheet open onClose={onClose} title="Daily insight" subtitle="One a day, rotated — never a feed">
      <div className="flex items-center gap-2">
        <Sparkles size={15} className="text-ink-3" />
        <SectionLabel>{insight.module}</SectionLabel>
      </div>

      <h3 className="mt-3 text-[1.1875rem] font-medium leading-7 text-ink">{insight.title}</h3>
      <p className="mt-3 text-[0.875rem] leading-6 text-ink-2">{insight.body}</p>

      <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3.5">
        <BookOpen size={15} className="mt-0.5 flex-shrink-0 text-ink-3" />
        <p className="text-[0.75rem] leading-5 text-ink-3">
          Drawn from {insight.source.toLowerCase()}. Curated by hand rather than generated, so it
          stays the same when you come back to it today.
        </p>
      </div>

      <p className="mt-4 text-[0.75rem] leading-5 text-ink-3">
        General guidance, not medical advice. If something here is worth acting on and you are
        unsure, ask someone who knows your history.
      </p>
    </Sheet>
  );
}
