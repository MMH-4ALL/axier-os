import { useState, useRef, useEffect, useCallback } from 'react';
import { useOS } from '@/store/OSContext';
import { themes } from '@/themes';

interface Props {
  windowId: string;
  data?: Record<string, unknown>;
}

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'ascii';
  content: string;
}

const ASCII_LOGO = [
  '         //@@@@@\\\\           ',
  '        //@@@@@@@\\\\          ',
  '       //@@@@@@@@@\\\\         ',
  '      //@@@@@@@@@@@\\\\        ',
  '     //@@@@@@@@@@@@@\\\\       ',
  '    //@@@@@@@@@@@@@@@\\\\      ',
  '   //@@@@@@@@@@@@@@@@@\\\\     ',
  '  //@@@@@@@@@@@@@@@@@@@\\\\    ',
  ' //@@@@@@@@@@@@@@@@@@@@@\\\\   ',
  '///////////////////////////  ',
  '///////////////////////////  ',
];

const COWSAY_COW = [
  '        \\   ^__^',
  '         \\  (oo)\\_______',
  '            (__)\\       )\\/\\',
  '                ||----w |',
  '                ||     ||',
];

const FIGLET_FONT: Record<string, string[]> = {
  A: ['  __ _ ', ' / _` |', '| (_| |', ' \\__,_|', '       '],
  X: ['__  __', '\\ \/ /', ' >  < ', '/_/\\_\\', '      '],
  I: [' _ ', '| |', '| |', '|_|', '   '],
  E: [' _____ ', '| ____|', '|  _|  ', '| |___ ', '|_____|'],
  R: [' ____  ', '|  _ \\ ', '| |_) |', '|  _ < ', '|_| \\_\\'],
  O: ['  ___  ', ' / _ \\ ', '| | | |', '| |_| |', ' \\___/ '],
  S: [' _____ ', '/ ____|', '\\___ \\', ' ___) |', '|_____/ '],
};

function makeFiglet(text: string): string[] {
  const upper = text.toUpperCase();
  const lines = ['', '', '', '', ''];
  for (const ch of upper) {
    const font = FIGLET_FONT[ch];
    if (font) {
      for (let i = 0; i < 5; i++) {
        lines[i] += font[i];
      }
    } else {
      for (let i = 0; i < 5; i++) lines[i] += '  ';
    }
  }
  return lines;
}

export default function Terminal({ windowId: _windowId }: Props) {
  const { state, dispatch, currentTheme, sendNotification, setNoBootScreen } = useOS();
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [currentDir, setCurrentDir] = useState('user');
  const [showMatrix, setShowMatrix] = useState(false);
  const [showHtop, setShowHtop] = useState(false);
  const [htopData, setHtopData] = useState<{ pid: number; name: string; cpu: number; mem: number; user: string }[]>([]);
  const [cmatrixChars, setCmatrixChars] = useState<{ x: number; y: number; char: string; speed: number }[]>([]);
  const [typingEffect, setTypingEffect] = useState(false);
  const [typingLines, setTypingLines] = useState<TerminalLine[]>([]);
  const [awaitingSecretWord, setAwaitingSecretWord] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const termTheme = themes[state.settings.terminal.theme]?.terminal || currentTheme.terminal;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, typingLines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Typing effect for neofetch
  useEffect(() => {
    if (typingEffect && typingLines.length > 0) {
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < typingLines.length) {
          setLines(prev => [...prev, typingLines[idx]]);
          idx++;
        } else {
          clearInterval(interval);
          setTypingEffect(false);
          setTypingLines([]);
        }
      }, 40);
      return () => clearInterval(interval);
    }
  }, [typingEffect, typingLines]);

  // Matrix rain animation
  useEffect(() => {
    if (!showMatrix) return;
    const chars = '0123456789ABCDEF@#$%&*<>?/~=';
    const interval = setInterval(() => {
      setCmatrixChars(prev => {
        const newChars = prev.map(c => ({ ...c, y: c.y + c.speed })).filter(c => c.y < 100);
        if (newChars.length < 60) {
          for (let i = 0; i < 3; i++) {
            newChars.push({
              x: Math.random() * 100,
              y: -5,
              char: chars[Math.floor(Math.random() * chars.length)],
              speed: 0.5 + Math.random() * 1.5,
            });
          }
        }
        return newChars;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [showMatrix]);

  // htop simulation
  useEffect(() => {
    if (!showHtop) return;
    const processes = [
      { name: 'axkernel', user: 'root' },
      { name: 'axdesktop', user: 'user' },
      { name: 'axterm', user: 'user' },
      { name: 'axbrowser', user: 'user' },
      { name: 'node', user: 'user' },
      { name: 'python3', user: 'user' },
      { name: 'vim', user: 'user' },
      { name: 'ssh-agent', user: 'user' },
      { name: 'systemd', user: 'root' },
      { name: 'cron', user: 'root' },
      { name: 'nginx', user: 'www' },
      { name: 'postgres', user: 'postgres' },
    ];
    const interval = setInterval(() => {
      setHtopData(processes.map((p, i) => ({
        pid: 1000 + i * 23,
        name: p.name,
        cpu: Math.random() * 30 + (i === 0 ? 5 : 0),
        mem: Math.random() * 15 + 1,
        user: p.user,
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, [showHtop]);

  const getDirName = (dirId: string) => {
    const node = state.fs.find(n => n.id === dirId);
    return node?.name || dirId;
  };

  const resolvePath = (path: string): string | null => {
    if (path === '~') return 'user';
    if (path === '/') return 'root';
    if (path === '.') return currentDir;
    if (path === '..') {
      const node = state.fs.find(n => n.id === currentDir);
      return node?.parentId || 'root';
    }
    if (path.startsWith('/')) {
      const parts = path.split('/').filter(Boolean);
      let current = 'root';
      for (const part of parts) {
        const found = state.fs.find(n => n.parentId === current && n.name === part && n.type === 'folder');
        if (!found) return null;
        current = found.id;
      }
      return current;
    }
    const found = state.fs.find(n => n.parentId === currentDir && n.name === path);
    return found?.id || null;
  };

  const handleSecretWord = (word: string) => {
    setAwaitingSecretWord(false);
    if (word.toLowerCase() === 'please!') {
      setLines(prev => [...prev, { type: 'output', content: '' }]);
      setTimeout(() => {
        setLines(prev => [...prev,
          { type: 'error', content: '  [██████████████████████████████] 100%' },
          { type: 'output', content: '' },
          { type: 'error', content: '  Deleting /bin...' },
          { type: 'error', content: '  Deleting /usr...' },
          { type: 'error', content: '  Deleting /home...' },
          { type: 'error', content: '  Deleting /etc/passwd...' },
          { type: 'error', content: '  Deleting everything...' },
          { type: 'output', content: '  ...' },
        ]);
        setTimeout(() => {
          setNoBootScreen(true);
          sendNotification('SYSTEM FAILURE', 'No boot device found.', 'error');
        }, 2000);
      }, 1000);
    } else {
      setLines(prev => [...prev,
        { type: 'output', content: '' },
        { type: 'error', content: '  ❌ Incorrect. The system remains intact.' },
        { type: 'output', content: '  (Nice try though.)' },
        { type: 'output', content: '' },
      ]);
    }
  };

  const executeCommand = useCallback((cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    // Intercept secret word check
    if (awaitingSecretWord) {
      setHistory(prev => [...prev, trimmed]);
      setHistoryIdx(-1);
      setLines(prev => [...prev, { type: 'input', content: trimmed }]);
      // Run as secret word check
      handleSecretWord(trimmed);
      setInput('');
      return;
    }

    setHistory(prev => [...prev, trimmed]);
    setHistoryIdx(-1);

    // Add input line
    setLines(prev => [...prev, { type: 'input', content: trimmed }]);

    const args = trimmed.split(/\s+/);
    const cmd = args[0].toLowerCase();

    // Stop any running animations
    setShowMatrix(false);
    setShowHtop(false);

    const addOutput = (content: string, type: 'output' | 'error' | 'ascii' = 'output') => {
      setLines(prev => [...prev, { type, content }]);
    };

    const addOutputs = (outputs: string[], type: 'output' | 'error' | 'ascii' = 'output') => {
      setLines(prev => [...prev, ...outputs.map(c => ({ type, content: c }))]);
    };

    switch (cmd) {
      case 'help':
        addOutputs([
          'Axier OS Terminal - Available Commands:',
          '',
          '  ls [path]          List directory contents',
          '  cd <path>          Change directory',
          '  mkdir <name>       Create directory',
          '  cat <file>         Display file contents',
          '  echo <text>        Print text',
          '  clear              Clear terminal',
          '  neofetch           Show system info with ASCII art',
          '  cmatrix            Matrix rain effect',
          '  htop               Process viewer',
          '  axpkg <cmd>        Package manager',
          '  cowsay <msg>       Talking cow',
          '  figlet <text>      Large text',
          '  whoami             Show current user',
          '  pwd                Print working directory',
          '  rm <name>          Remove file or directory',
          '  touch <name>       Create empty file',
          '  date               Show current date and time',
          '  uname              Show system information',
          '  fortune            Random fortune cookie',
          '  axier --power      ???',
          '  unlock-axier       ???',
          '',
          'Type "help <command>" for more info on a specific command.',
        ]);
        break;

      case 'ls': {
        const path = args[1] || '.';
        const dirId = resolvePath(path);
        if (!dirId) {
          addOutput(`ls: cannot access '${path}': No such file or directory`, 'error');
          break;
        }
        const node = state.fs.find(n => n.id === dirId);
        if (node?.type === 'file') {
          addOutput(node.name);
          break;
        }
        const children = state.fs.filter(n => n.parentId === dirId);
        if (children.length === 0) {
          // empty
        } else {
          const output = children.map(c => {
            if (c.type === 'folder') return `\x1b[34m${c.name}/\x1b[0m`;
            if (c.name.endsWith('.md') || c.name.endsWith('.txt')) return `\x1b[32m${c.name}\x1b[0m`;
            return c.name;
          }).join('  ');
          addOutput(output);
        }
        break;
      }

      case 'cd': {
        const path = args[1] || '~';
        const dirId = resolvePath(path);
        if (!dirId) {
          addOutput(`cd: no such file or directory: ${path}`, 'error');
          break;
        }
        const node = state.fs.find(n => n.id === dirId);
        if (node?.type !== 'folder') {
          addOutput(`cd: not a directory: ${path}`, 'error');
          break;
        }
        setCurrentDir(dirId);
        break;
      }

      case 'mkdir': {
        const name = args[1];
        if (!name) {
          addOutput('mkdir: missing operand', 'error');
          break;
        }
        const exists = state.fs.find(n => n.parentId === currentDir && n.name === name);
        if (exists) {
          addOutput(`mkdir: cannot create directory '${name}': File exists`, 'error');
          break;
        }
        dispatch({
          type: 'FS_ADD',
          node: { id: `fs-${Date.now()}`, name, type: 'folder', parentId: currentDir, createdAt: new Date().toISOString() },
        });
        sendNotification('File System', `Directory '${name}' created`, 'success');
        break;
      }

      case 'cat': {
        const name = args[1];
        if (!name) {
          addOutput('cat: missing file operand', 'error');
          break;
        }
        const file = state.fs.find(n => n.parentId === currentDir && n.name === name && n.type === 'file');
        if (!file) {
          addOutput(`cat: ${name}: No such file`, 'error');
          break;
        }
        if (file.content) {
          file.content.split('\n').forEach(l => addOutput(l));
        }
        break;
      }

      case 'echo': {
        addOutput(args.slice(1).join(' '));
        break;
      }

      case 'clear': {
        setLines([]);
        break;
      }

      case 'neofetch': {
        const infoLines = [
          'user@axier-os',
          '-------------------',
          `OS: Axier OS 1.0 x86_64`,
          `Kernel: 6.8.0-axier-custom`,
          `Uptime: ${Math.floor(Math.random() * 24)} hours, ${Math.floor(Math.random() * 60)} mins`,
          `Packages: ${state.packages.filter(p => p.installed).length} (axpkg)`,
          `Shell: axsh 2.1.0`,
          `Resolution: 1920x1080`,
          `DE: AxierDesktop`,
          `WM: AxierWM`,
          `Theme: ${currentTheme.name}`,
          `Icons: Axier-${state.settings.iconPack}`,
          `Terminal: axterm`,
          `CPU: Axier Core i9 (16) @ 4.2GHz`,
          `Memory: 4.2GiB / 16GiB`,
        ];

        const combined: TerminalLine[] = [];
        const maxLines = Math.max(ASCII_LOGO.length, infoLines.length);
        for (let i = 0; i < maxLines; i++) {
          const asciiPart = ASCII_LOGO[i] || ' '.repeat(30);
          const infoPart = infoLines[i] || '';
          combined.push({ type: 'ascii', content: `${asciiPart}  ${infoPart}` });
        }

        // Add color bar
        const colors = [currentTheme.terminal.red, currentTheme.terminal.green, currentTheme.terminal.yellow,
          currentTheme.terminal.blue, currentTheme.terminal.magenta, currentTheme.terminal.cyan, currentTheme.terminal.white];
        combined.push({ type: 'output', content: '' });
        combined.push({ type: 'ascii', content: ' '.repeat(30) + colors.map(c => `\x1b[48;2;${hexToRgb(c)}m   \x1b[0m`).join('') });

        // Add all at once — no typing animation (typing effect causes white flash)
        setLines(prev => [...prev, ...combined]);
        break;
      }

      case 'cmatrix': {
        setShowMatrix(true);
        addOutput('Press any key to exit cmatrix...');
        break;
      }

      case 'htop': {
        setShowHtop(true);
        addOutput('Press any key to exit htop...');
        break;
      }

      case 'axpkg': {
        const subCmd = args[1];
        const pkgName = args[2];
        if (subCmd === 'install' && pkgName) {
          const pkg = state.packages.find(p => p.name === pkgName || p.id === pkgName);
          if (!pkg) {
            addOutput(`axpkg: package '${pkgName}' not found`, 'error');
            break;
          }
          if (pkg.installed) {
            addOutput(`axpkg: '${pkgName}' is already installed`);
            break;
          }
          addOutput(`Resolving dependencies...`);
          addOutput(`Downloading ${pkg.name} (${pkg.size})...`);
          setTimeout(() => {
            dispatch({ type: 'PKG_INSTALL', id: pkg.id });
            addOutput(`Successfully installed ${pkg.name} v${pkg.version}`);
            sendNotification('Package Manager', `${pkg.name} installed successfully`, 'success');
          }, 800);
        } else if (subCmd === 'remove' && pkgName) {
          const pkg = state.packages.find(p => p.name === pkgName || p.id === pkgName);
          if (!pkg || !pkg.installed) {
            addOutput(`axpkg: package '${pkgName}' is not installed`, 'error');
            break;
          }
          dispatch({ type: 'PKG_UNINSTALL', id: pkg.id });
          addOutput(`Removed ${pkg.name}`);
        } else if (subCmd === 'list') {
          const installed = state.packages.filter(p => p.installed);
          addOutput(`Installed packages (${installed.length}):`);
          installed.forEach(p => addOutput(`  ${p.name} v${p.version} - ${p.description}`));
        } else if (subCmd === 'search' && pkgName) {
          const results = state.packages.filter(p =>
            p.name.includes(pkgName) || p.description.toLowerCase().includes(pkgName.toLowerCase())
          );
          if (results.length === 0) {
            addOutput(`No packages found matching '${pkgName}'`);
          } else {
            results.forEach(p => {
              const status = p.installed ? '[installed]' : '[available]';
              addOutput(`  ${p.name} v${p.version} ${status} - ${p.description}`);
            });
          }
        } else {
          addOutputs([
            'axpkg - Axier Package Manager',
            '',
            'Usage: axpkg <command> [package]',
            '',
            'Commands:',
            '  install <pkg>    Install a package',
            '  remove <pkg>     Remove a package',
            '  list             List installed packages',
            '  search <query>   Search for packages',
          ]);
        }
        break;
      }

      case 'cowsay': {
        const msg = args.slice(1).join(' ') || 'Moo!';
        const bubble = `< ${msg} >`;
        const border = '-'.repeat(bubble.length);
        addOutput(` ${border}`);
        addOutput(bubble);
        addOutput(` ${border}`);
        COWSAY_COW.forEach(l => addOutput(l));
        break;
      }

      case 'figlet': {
        const text = args.slice(1).join(' ') || 'AXIER';
        const figLines = makeFiglet(text);
        figLines.forEach(l => addOutput(l, 'ascii'));
        break;
      }

      case 'whoami':
        addOutput('user');
        break;

      case 'pwd': {
        const buildPath = (id: string): string => {
          const node = state.fs.find(n => n.id === id);
          if (!node || node.parentId === null) return '/';
          return buildPath(node.parentId) + (node.parentId === 'root' ? '' : '/') + node.name;
        };
        addOutput('/home' + buildPath(currentDir));
        break;
      }

      case 'rm': {
        const name = args[1];
        if (!name) {
          addOutput('rm: missing operand', 'error');
          break;
        }
        const node = state.fs.find(n => n.parentId === currentDir && n.name === name);
        if (!node) {
          addOutput(`rm: cannot remove '${name}': No such file or directory`, 'error');
          break;
        }
        dispatch({ type: 'FS_DELETE', id: node.id });
        addOutput(`Removed '${name}'`);
        break;
      }

      case 'touch': {
        const name = args[1];
        if (!name) {
          addOutput('touch: missing file operand', 'error');
          break;
        }
        const exists = state.fs.find(n => n.parentId === currentDir && n.name === name);
        if (exists) {
          break; // Update timestamp - no-op
        }
        dispatch({
          type: 'FS_ADD',
          node: {
            id: `fs-${Date.now()}`,
            name,
            type: 'file',
            parentId: currentDir,
            content: '',
            createdAt: new Date().toISOString(),
            size: 0,
            mimeType: 'text/plain',
          },
        });
        break;
      }

      case 'date':
        addOutput(new Date().toString());
        break;

      case 'uname':
        addOutput('AxierOS 6.8.0-axier-custom #1 SMP Axier x86_64 GNU/Linux');
        break;

      case 'fortune': {
        const fortunes = [
          'A bug in the hand is better than one as yet undetected.',
          'Your code will work on the first try. (Just kidding.)',
          'The terminal is mightier than the GUI.',
          'In a world without fences, who needs Gates?',
          'Unix is user-friendly. It just picks its friends carefully.',
          'There are 10 types of people: those who understand binary and those who don\'t.',
          'Real programmers don\'t comment their code. If it was hard to write, it should be hard to understand.',
          'Keep it simple, stupid.',
          'The best code is no code at all.',
          'With great power comes great responsibility.',
        ];
        addOutput(fortunes[Math.floor(Math.random() * fortunes.length)]);
        break;
      }

      case 'axier': {
        if (args[1] === '--power') {
          addOutputs([
            '',
            '  ⚡ ACTIVATING AXIER ULTIMATE MODE ⚡',
            '',
            '  Initializing quantum computing core...',
            '  Bypassing all security protocols...',
            '  Accessing the mainframe...',
            '',
          ]);
          setTimeout(() => {
            addOutputs([
              '  ╔═══════════════════════════════════╗',
              '  ║   YOU HAVE DISCOVERED THE SECRET  ║',
              '  ║        POWER OF AXIER OS          ║',
              '  ╚═══════════════════════════════════╝',
              '',
              '  The system hums with newfound energy...',
              '  Colors shift and reality bends slightly.',
              '',
            ]);
            sendNotification('Secret Unlocked', 'Axier Ultimate Power activated!', 'success');
          }, 1500);
        } else {
          addOutput('Usage: axier --power');
        }
        break;
      }

      case 'unlock-axier': {
        if (state.secretThemeUnlocked) {
          addOutput('The secret theme is already unlocked!');
          addOutput('Switch to "Axier Ultimate" theme in Settings.');
        } else {
          dispatch({ type: 'UNLOCK_SECRET_THEME' });
          addOutputs([
            '',
            '  🔓 SECRET THEME UNLOCKED! 🔓',
            '',
            '  You have discovered the legendary Axier Ultimate theme!',
            '  Neon purples and electric cyans now flow through the system.',
            '',
            '  Go to Settings > Themes to activate "Axier Ultimate".',
            '',
          ]);
          sendNotification('Secret Unlocked', 'Axier Ultimate theme discovered!', 'success');
        }
        break;
      }

      case 'sudo': {
        if (args[1] === 'rm' && args[2] === '-rf' && args[3] === '/') {
          setAwaitingSecretWord(true);
          addOutputs(['', '  ⚠️ WARNING: This will destroy the entire filesystem.', '', '  What\'s the secret word?']);
          // Next input will be checked as the secret word
          return;
        } else if (args[1] === 'rm') {
          addOutput('rm: cannot remove \'/\': Permission denied');
        } else {
          addOutput(`sudo: ${args.slice(1).join(' ')}: command requires root privileges`);
          addOutput('This incident has been logged. 📋');
        }
        break;
      }

      default:
        addOutput(`${cmd}: command not found. Type 'help' for available commands.`, 'error');
    }
  }, [currentDir, state.fs, state.packages, state.secretThemeUnlocked, currentTheme, dispatch, sendNotification, resolvePath, awaitingSecretWord]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMatrix || showHtop) {
      setShowMatrix(false);
      setShowHtop(false);
      return;
    }

    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        const newIdx = historyIdx + 1;
        setHistoryIdx(newIdx);
        setInput(history[history.length - 1 - newIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const newIdx = historyIdx - 1;
        setHistoryIdx(newIdx);
        setInput(history[history.length - 1 - newIdx] || '');
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const prompt = awaitingSecretWord ? 'secret word > ' : `user@axier:${getDirName(currentDir)}$`;

  return (
    <div
      className="w-full h-full flex flex-col relative"
      style={{
        background: termTheme.background,
        fontFamily: "'VT323', 'Courier New', monospace",
        fontSize: `${state.settings.terminal.fontSize}px`,
        color: termTheme.foreground,
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal output */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden p-2" style={{ wordBreak: 'break-word' }}>
        {/* Welcome message */}
        {lines.length === 0 && (
          <div className="mb-2 opacity-60">
            <div>Axier Terminal v2.1.0 - Type 'help' for commands</div>
            <div className="mb-2" />
          </div>
        )}

        {lines.map((line, idx) => (
          <div key={idx} className="whitespace-pre leading-tight overflow-hidden"
            style={{
              color: line.type === 'error' ? termTheme.red :
                line.type === 'ascii' ? termTheme.cyan :
                  termTheme.foreground,
            }}>
            {line.type === 'input' && (
              <span>
                <span style={{ color: termTheme.green }}>{prompt} </span>
                {line.content}
              </span>
            )}
            {line.type !== 'input' && renderColoredText(line.content, termTheme)}
          </div>
        ))}

        {/* Input line */}
        {!showMatrix && !showHtop && (
          <div className="flex items-center">
            <span style={{ color: termTheme.green }} className="whitespace-pre">{prompt} </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none"
              style={{
                color: termTheme.foreground,
                fontFamily: "'VT323', 'Courier New', monospace",
                fontSize: 'inherit',
                caretColor: termTheme.cursor,
              }}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
            />
          </div>
        )}
      </div>

      {/* CMatrix overlay */}
      {showMatrix && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: termTheme.background }}>
          {cmatrixChars.map((c, i) => (
            <span
              key={i}
              className="absolute font-mono text-xs"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                color: Math.random() > 0.9 ? '#fff' : termTheme.green,
                opacity: 0.7 + Math.random() * 0.3,
                textShadow: `0 0 8px ${termTheme.green}`,
                fontFamily: "'VT323', monospace",
                fontSize: '14px',
              }}
            >
              {c.char}
            </span>
          ))}
        </div>
      )}

      {/* htop overlay */}
      {showHtop && (
        <div className="absolute inset-0 p-3 flex flex-col" style={{ background: termTheme.background }}>
          <div className="flex justify-between mb-1" style={{ color: termTheme.cyan }}>
            <span>Axier Process Manager</span>
            <span>Uptime: 3:42:15</span>
          </div>
          <div className="flex gap-4 mb-2 text-xs" style={{ color: termTheme.foreground }}>
            <span>Tasks: {htopData.length}</span>
            <span>CPU: {htopData.reduce((a, b) => a + b.cpu, 0).toFixed(1)}%</span>
            <span>Mem: 4.2G/16G</span>
          </div>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="flex-1 h-4 rounded-sm" style={{
                background: `linear-gradient(to top, ${termTheme.green} ${20 + Math.random() * 60}%, transparent 0%)`,
              }} />
            ))}
          </div>
          <div className="grid grid-cols-[60px_1fr_60px_60px_60px] gap-2 text-xs mb-1 font-bold" style={{ color: termTheme.yellow }}>
            <span>PID</span><span>COMMAND</span><span>CPU%</span><span>MEM%</span><span>USER</span>
          </div>
          <div className="flex-1 overflow-hidden">
            {htopData.map((p, i) => (
              <div key={p.pid} className="grid grid-cols-[60px_1fr_60px_60px_60px] gap-2 text-xs py-0.5"
                style={{ color: i % 2 === 0 ? termTheme.foreground : termTheme.white }}>
                <span>{p.pid}</span>
                <span className="truncate">{p.name}</span>
                <span>{p.cpu.toFixed(1)}</span>
                <span>{p.mem.toFixed(1)}</span>
                <span style={{ color: p.user === 'root' ? termTheme.red : termTheme.cyan }}>{p.user}</span>
              </div>
            ))}
          </div>
          <div className="mt-1 text-xs opacity-60" style={{ color: termTheme.foreground }}>
            F1:Help F2:Setup F3:Search F4:Filter F5:Tree F6:Sort F7:Nice- F8:Nice+ F9:Kill F10:Quit
          </div>
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r};${g};${b}`;
}

function renderColoredText(text: string, termTheme: Record<string, string>): React.ReactNode {
  const parts = text.split(/(\x1b\[[0-9;]*m)/g);
  const result: React.ReactNode[] = [];
  let currentColor = termTheme.foreground;
  let keyIdx = 0;

  for (const part of parts) {
    if (part.startsWith('\x1b[')) {
      const code = part.replace(/\x1b\[|\m/g, '');
      if (code === '0m' || code === '') currentColor = termTheme.foreground;
      else if (code.includes('31') || code.includes('91')) currentColor = termTheme.red;
      else if (code.includes('32') || code.includes('92')) currentColor = termTheme.green;
      else if (code.includes('33') || code.includes('93')) currentColor = termTheme.yellow;
      else if (code.includes('34') || code.includes('94')) currentColor = termTheme.blue;
      else if (code.includes('35') || code.includes('95')) currentColor = termTheme.magenta;
      else if (code.includes('36') || code.includes('96')) currentColor = termTheme.cyan;
      continue;
    }
    if (part) {
      result.push(<span key={keyIdx++} style={{ color: currentColor }}>{part}</span>);
    }
  }

  if (result.length === 0) return <span>{text}</span>;
  return <>{result}</>;
}
