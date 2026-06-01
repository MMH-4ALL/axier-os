import { useState } from 'react';

interface Props {
  onClose: () => void;
}

export default function Calculator({ onClose }: Props) {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [newNum, setNewNum] = useState(true);

  const input = (v: string) => {
    if ('0123456789.'.includes(v)) {
      if (newNum) { setDisplay(v === '.' ? '0.' : v); setNewNum(false); }
      else setDisplay(d => (d === '0' && v !== '.' ? v : d + v).replace(/^\./, '0.'));
    }
  };

  const operate = (nextOp: string) => {
    const cur = parseFloat(display);
    if (prev === null) { setPrev(String(cur)); }
    else if (op && !newNum) {
      const result = op === '+' ? parseFloat(prev) + cur
        : op === '-' ? parseFloat(prev) - cur
        : op === '×' ? parseFloat(prev) * cur
        : parseFloat(prev) / cur;
      setDisplay(String(Math.round(result * 1e10) / 1e10));
      setPrev(String(result));
    }
    setOp(nextOp);
    setNewNum(true);
  };

  const equals = () => {
    if (op && prev !== null) {
      const cur = parseFloat(display);
      const result = op === '+' ? parseFloat(prev) + cur
        : op === '-' ? parseFloat(prev) - cur
        : op === '×' ? parseFloat(prev) * cur
        : parseFloat(prev) / cur;
      setDisplay(String(Math.round(result * 1e10) / 1e10));
      setPrev(null);
      setOp(null);
      setNewNum(true);
    }
  };

  const clear = () => { setDisplay('0'); setPrev(null); setOp(null); setNewNum(true); };
  const negate = () => setDisplay(d => String(-parseFloat(d)));
  const percent = () => setDisplay(d => String(parseFloat(d) / 100));

  const BTN = (label: string, onClick: () => void, cls = '') => (
    <button
      className={`rounded-xl text-xl font-light flex items-center justify-center select-none transition-all active:scale-95 ${cls}`}
      style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}
      onClick={onClick}
      onMouseDown={e => e.preventDefault()}
    >
      {label}
    </button>
  );

  const OPS = (label: string, onClick: () => void) => (
    <button
      className="rounded-xl text-xl font-light flex items-center justify-center select-none transition-all active:scale-95"
      style={{ background: 'rgba(122,162,247,0.25)', color: '#7aa2f7' }}
      onClick={onClick}
      onMouseDown={e => e.preventDefault()}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 rounded-2xl overflow-hidden flex flex-col"
        style={{
          width: '280px',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(8, 8, 18, 0.82)',
          backdropFilter: 'blur(48px)',
          WebkitBackdropFilter: 'blur(48px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.72)',
          animation: 'calc-enter 0.2s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Display */}
        <div className="px-4 pt-5 pb-3 text-right">
          <div
            className="text-3xl font-light tracking-tight truncate"
            style={{ color: 'rgba(255,255,255,0.95)', fontVariantNumeric: 'tabular-nums' }}
          >
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-1.5 p-2 flex-1">
          {BTN('AC', clear)}
          {BTN('±', negate)}
          {BTN('%', percent)}
          {OPS('÷', () => operate('/'))}

          {BTN('7', () => input('7'))}
          {BTN('8', () => input('8'))}
          {BTN('9', () => input('9'))}
          {OPS('×', () => operate('×'))}

          {BTN('4', () => input('4'))}
          {BTN('5', () => input('5'))}
          {BTN('6', () => input('6'))}
          {OPS('−', () => operate('-'))}

          {BTN('1', () => input('1'))}
          {BTN('2', () => input('2'))}
          {BTN('3', () => input('3'))}
          {OPS('+', () => operate('+'))}

          {BTN('0', () => input('0'), 'col-span-2')}
          {BTN('.', () => input('.'))}
          {OPS('=', equals)}
        </div>
      </div>

      <style>{`
        @keyframes calc-enter {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.88); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
