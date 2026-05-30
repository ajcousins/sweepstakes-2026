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

/** Flag only (default, &lt; sm). Team code at sm. Full name at md+. */
const LABEL_CODE_CLASS = 'hidden whitespace-nowrap text-sm sm:inline md:hidden';
const LABEL_NAME_BASE_CLASS = 'hidden whitespace-nowrap text-sm md:inline';

/** Renders a team flag image from FIFA's flags endpoint. */
export function TeamFlag({
  teamCode,
  showName = false,
  size = 'sm',
  nameClassName,
}: Props) {
  const { width } = FLAG_SIZES[size];
  const { name, code, flagUrl } = getTeamDisplay(teamCode);

  const stacked = size === 'lg' || size === 'xl';

  return (
    <span
      className={
        stacked
          ? 'inline-flex shrink-0 flex-col items-center gap-2'
          : 'inline-flex shrink-0 items-center gap-1.5'
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
        <>
          <span className={LABEL_CODE_CLASS}>{code}</span>
          <span
            className={
              nameClassName
                ? `hidden whitespace-nowrap md:inline ${nameClassName}`
                : LABEL_NAME_BASE_CLASS
            }
          >
            {name}
          </span>
        </>
      )}
    </span>
  );
}
