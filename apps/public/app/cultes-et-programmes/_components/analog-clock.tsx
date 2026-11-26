// Horloge analogique réglée sur l'heure de début du rendez-vous ("19h30").
// Les aiguilles partent de midi et rejoignent l'heure quand `ready` passe à
// vrai ; la trotteuse tourne en continu.
export function AnalogClock({
  time,
  ready,
  className,
  accent = "#F2C94D",
}: {
  time: string;
  ready: boolean;
  className?: string;
  accent?: string;
}) {
  const [h, m] = time.split("h").map(Number);
  const hourAngle = ((h % 12) + m / 60) * 30;
  const minuteAngle = m * 6;
  const hand = (angle: number): React.CSSProperties => ({
    transform: `rotate(${ready ? angle : 0}deg)`,
    transformOrigin: "50px 50px",
    transition: "transform 1.6s cubic-bezier(0.22, 1, 0.36, 1)",
  });

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <circle cx="50" cy="50" r="47" fill="rgba(19,16,12,0.85)" stroke={accent} strokeWidth="2" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1="50"
          y1={i % 3 === 0 ? 8 : 10}
          x2="50"
          y2="15"
          stroke={i % 3 === 0 ? accent : "rgba(250,249,246,0.5)"}
          strokeWidth={i % 3 === 0 ? 3 : 1.5}
          strokeLinecap="round"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      <line x1="50" y1="50" x2="50" y2="28" stroke="#FAF9F6" strokeWidth="4.5" strokeLinecap="round" style={hand(hourAngle)} />
      <line x1="50" y1="50" x2="50" y2="18" stroke="#FAF9F6" strokeWidth="3" strokeLinecap="round" style={hand(minuteAngle)} />
      <line
        x1="50"
        y1="58"
        x2="50"
        y2="14"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
        className="motion-safe:[animation:spin-slow_60s_linear_infinite]"
        style={{ transformOrigin: "50px 50px", transformBox: "view-box" }}
      />
      <circle cx="50" cy="50" r="3.5" fill={accent} />
    </svg>
  );
}
