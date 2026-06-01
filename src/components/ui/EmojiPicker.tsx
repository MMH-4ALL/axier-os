import { useState, useEffect, useRef } from 'react';
import { useOS } from '@/store/OSContext';

const CATEGORIES = {
  'Smileys': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😮‍💨','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'],
  'Gestures': ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄','👶','🧒','👦','👧','🧑','👱','🧔','👨','🧓','👩','🧓','👴','👵','🙍','🙎','🙅','🙆','💁','🙋','🧏','🙇','🤦','🤷','👮','🕵️','💂','🥷','👷','🤴','👸','👳','👲','🧕','🤵','👰','🤰','🤱','👼','🎒','👑','🧢','🎓'],
  'Hearts': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️'],
  'Nature': ['🌸','💮','🏵️','🌹','🥀','🌺','🌻','🌼','🌷','🌱','🌲','🌳','🌴','🌵','🌾','🌿','☘️','🍀','🍁','🍂','🍃','🪴','🍄','🌰','🦀','🦞','🦐','🦑','🌈','☀️','🌤️','⛅','🌥️','☁️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','🌪️','🌫️','💧','💦','🫧','☔','⚡','💥','💫','⭐','🌟','✨','💫','🌙','🌛','🌜','🌚','🌝','🌞','🌵','🌴','🌳'],
  'Food': ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕','🫖','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊','🥄','🍴','🍽️','🔪','🧂'],
  'Activities': ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🪗','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🕹️','🎰'],
  'Objects': ['⌚','📱','💻','⌨️','🖥️','🖨️','🖱️','🖲️','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸','💵','💴','💶','💷','💰','💳','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒️','🛠️','⛏️','🪚','🔩','⚙️','🪤','🧱','⛓️','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🪠','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎️','🔑','🗝️','🚪','🪑','🛋️','🛏️','🛌','🧸','🪆','🖼️','🪞','🪟','🛍️','🛒','🎁','🎈','🎏','🎀','🪄','🪅','🎊','🎉','🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷️','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','📊','📈','📉','🗒️','🗓️','📆','📅','🗑️','📇','🗃️','🗳️','🗄️','📋','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇️','📐','📏','🧮','📌','📍','✂️','🖊️','🖋️','✒️','🖌️','🖍️','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓'],
  'Symbols': ['❤️','🧡','💛','💚','💙','💜','⚠️','❌','✅','⚡','🔥','💥','✨','🌟','💫','⭐','🎵','🎶','♠️','♣️','♥️','♦️','☀️','🌙','⭐','🔔','🔕','📢','📣','💬','💭','🗯️','💤','♀️','♂️','⚧','⭕','❗','❓','💯','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔶','🔷','🔸','🔹','🔺','🔻','💎','🔳','🔲','▫️','◾','◽','◼️','◻️','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫','🔈','🔇','🔉','🔊','🔔','🔕','📣','📢'],
};

const RECENT_KEY = 'axier-recent-emojis';

export default function EmojiPicker({ onClose }: { onClose: () => void }) {
  const { copyToClipboard, sendNotification } = useOS();
  const [activeCat, setActiveCat] = useState('Smileys');
  const [search, setSearch] = useState('');
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
  });
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { searchRef.current?.focus(); }, []);

  const addRecent = (emoji: string) => {
    const next = [emoji, ...recent.filter(e => e !== emoji)].slice(0, 24);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const pick = (emoji: string) => {
    copyToClipboard(emoji);
    addRecent(emoji);
    sendNotification('Copied!', emoji, 'success');
    onClose();
  };

  const renderEmojis = () => {
    if (search) {
      const q = search.toLowerCase();
      const results: { emoji: string; cat: string }[] = Object.entries(CATEGORIES)
        .flatMap(([cat, emojis]) => emojis.map(e => ({ emoji: e, cat })))
        .filter(({ emoji: e }) => e.includes(q) || q.length >= 2);
      if (results.length === 0) return <div className="py-8 text-center text-white/30 text-sm">No emojis found</div>;
      return (
        <div className="grid grid-cols-8 gap-1 p-2">
          {results.slice(0, 80).map(({ emoji }, i) => (
            <button key={i} className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-white/10 transition-colors" onClick={() => pick(emoji)}>{emoji}</button>
          ))}
        </div>
      );
    }

    if (activeCat === 'Recent') {
      if (recent.length === 0) return <div className="py-8 text-center text-white/30 text-sm">No recent emojis</div>;
      return (
        <div className="grid grid-cols-8 gap-1 p-2">
          {recent.map((e, i) => (
            <button key={i} className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-white/10 transition-colors" onClick={() => pick(e)}>{e}</button>
          ))}
        </div>
      );
    }

    const emojis = CATEGORIES[activeCat as keyof typeof CATEGORIES] || [];
    return (
      <div className="grid grid-cols-8 gap-1 p-2">
        {emojis.map((e, i) => (
          <button key={i} className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-white/10 transition-colors" onClick={() => pick(e)}>{e}</button>
        ))}
      </div>
    );
  };

  const catIcons: Record<string, string> = {
    Recent: '🕐', Smileys: '😀', Gestures: '👋', Hearts: '❤️', Nature: '🌸', Food: '🍕', Activities: '⚽', Objects: '💡', Symbols: '⚡',
  };

  return (
    <>
      <div className="fixed inset-0 z-[90]" onClick={onClose} />
      <div
        className="fixed z-[91] rounded-2xl overflow-hidden flex flex-col"
        style={{
          width: '340px',
          height: '440px',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(8, 8, 18, 0.92)',
          backdropFilter: 'blur(48px)',
          WebkitBackdropFilter: 'blur(48px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.72)',
          animation: 'emoji-enter 0.2s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Search */}
        <div className="px-3 pt-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search emoji…"
              className="flex-1 bg-transparent text-sm text-white/80 outline-none placeholder-white/25"
              onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
            />
            {search && <button className="text-white/30 hover:text-white/60 text-xs" onClick={() => setSearch('')}>✕</button>}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-0.5 px-2 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {['Recent', 'Smileys', 'Gestures', 'Hearts', 'Nature', 'Food', 'Activities', 'Objects', 'Symbols'].map(cat => (
            <button
              key={cat}
              className="flex-1 py-1 rounded-lg text-sm transition-colors"
              style={{
                background: activeCat === cat && !search ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeCat === cat && !search ? 'white' : 'rgba(255,255,255,0.35)',
              }}
              onClick={() => { setActiveCat(cat); setSearch(''); }}
              title={cat}
            >
              {catIcons[cat] || '🔹'}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto">
          {renderEmojis()}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 text-[10px] text-white/20 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          Click to copy · copied to clipboard
        </div>
      </div>

      <style>{`
        @keyframes emoji-enter {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.88); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
