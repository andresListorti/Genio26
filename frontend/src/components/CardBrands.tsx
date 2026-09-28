type Props = { className?: string };

export function VisaMark({ className = "h-4 w-auto" }: Props) {
  return (
    <svg viewBox="0 0 48 16" className={className} role="img" aria-label="Visa">
      <text
        x="24"
        y="13.5"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="16"
        fontStyle="italic"
        fontWeight="900"
        letterSpacing="-0.5"
        fill="currentColor"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardMark({ className = "h-4 w-auto" }: Props) {
  return (
    <svg viewBox="0 0 26 16" className={className} role="img" aria-label="Mastercard">
      <circle cx="8" cy="8" r="8" fill="#EB001B" />
      <circle cx="18" cy="8" r="8" fill="#F79E1B" />
      <path d="M13 1.76a8 8 0 0 1 0 12.48 8 8 0 0 1 0-12.48z" fill="#FF5F00" />
    </svg>
  );
}

export default function CardBrands({ className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <VisaMark />
      <MastercardMark />
    </span>
  );
}
