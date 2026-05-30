import { getTeamDisplay } from '@/lib/team-display';

type Props = {
  teamCode: string;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  nameClassName?: string;
};

const FLAG_SIZES = {
  sm: { width: 24 },
  md: { width: 32 },
  lg: { width: 64 },
  xl: { width: 120 },
} as const;

/** Renders a team flag image from FIFA's flags endpoint. */
export function TeamFlag({
  teamCode,
  showName = false,
  size = 'sm',
  nameClassName,
}: Props) {
  const { width } = FLAG_SIZES[size];
  const { name, flagUrl } = getTeamDisplay(teamCode);

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
        alt={name}
        width={width}
        height={Math.round(width * 0.67)}
        className={
          stacked
            ? 'inline-block object-cover shadow-lg ring-1 ring-black/10'
            : 'inline-block object-cover shadow-sm'
        }
        loading="lazy"
      />
      {showName && (
        <span className={nameClassName ?? 'hidden md:block text-sm'}>{name}</span>
      )}
    </span>
  );
}
