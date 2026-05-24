import { getTeamDisplay } from '@/lib/team-display';

type Props = {
  teamCode: string;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  nameClassName?: string;
};

const FLAG_SIZES = {
  sm: { width: 24, cdn: 24 },
  md: { width: 32, cdn: 40 },
  lg: { width: 64, cdn: 80 },
  xl: { width: 120, cdn: 160 },
} as const;

/**
 * Renders a flag via image (reliable on Linux/WSL) with emoji in alt text.
 * Unicode flag emojis in `lib/teams.ts` are correct but often missing from Arial/Geist.
 */
export function TeamFlag({
  teamCode,
  showName = false,
  size = 'sm',
  nameClassName,
}: Props) {
  const { width, cdn } = FLAG_SIZES[size];
  const { name, emoji, flagUrl } = getTeamDisplay(teamCode, cdn);

  const stacked = size === 'lg' || size === 'xl';

  return (
    <span
      className={
        stacked
          ? 'inline-flex flex-col items-center gap-2'
          : 'inline-flex items-center gap-1.5'
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flagUrl}
        alt={`${name} ${emoji}`}
        width={width}
        height={Math.round(width * 0.67)}
        className={
          stacked
            ? 'inline-block rounded-md object-cover shadow-md ring-1 ring-black/10'
            : 'inline-block rounded-sm object-cover shadow-sm'
        }
        loading="lazy"
      />
      {showName && (
        <span className={nameClassName ?? 'text-sm'}>{name}</span>
      )}
    </span>
  );
}
