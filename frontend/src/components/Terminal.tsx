import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import {
  TerminalIcon,
  RefreshCwIcon,
  MaximizeIcon,
  MinimizeIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "./Icons.js";

// Helper trash icon if not present in Icons
function ClearIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

export interface TerminalProps {
  socket: WebSocket | null;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  containerInfo?: string;
}

export function Terminal({
  socket,
  isMaximized = false,
  onToggleMaximize,
  containerInfo = "sandbox",
}: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [fontSize, setFontSize] = useState<number>(13.5);

  useEffect(() => {
    if (!containerRef.current || !socket) return;

    const term = new XTerm({
      convertEol: true,
      fontSize: fontSize,
      fontFamily: "'JetBrains Mono', ui-monospace, Menlo, Monaco, 'Courier New', monospace",
      fontWeight: "400",
      fontWeightBold: "600",
      lineHeight: 1.4,
      letterSpacing: 0,
      cursorBlink: true,
      cursorStyle: "bar",
      cursorWidth: 2,
      scrollback: 5000,
      theme: {
        background: "#080b12",
        foreground: "#cbd5e1",
        cursor: "#38bdf8",
        cursorAccent: "#080b12",
        selectionBackground: "rgba(56, 189, 248, 0.25)",
        black: "#080b12",
        red: "#f43f5e",
        green: "#10b981",
        yellow: "#f59e0b",
        blue: "#38bdf8",
        magenta: "#c084fc",
        cyan: "#22d3ee",
        white: "#e2e8f0",
        brightBlack: "#475569",
        brightRed: "#fb7185",
        brightGreen: "#34d399",
        brightYellow: "#fbbf24",
        brightBlue: "#60a5fa",
        brightMagenta: "#e879f9",
        brightCyan: "#67e8f9",
        brightWhite: "#f8fafc",
      },
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current);
    termRef.current = term;
    fitAddonRef.current = fit;

    // Small delay to ensure container layout dimensions have settled
    requestAnimationFrame(() => {
      try {
        fit.fit();
      } catch {}
    });

    const sendResize = () => {
      if (socket.readyState === WebSocket.OPEN && term.cols > 0 && term.rows > 0) {
        socket.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      try {
        fit.fit();
        sendResize();
      } catch {}
    });
    resizeObserver.observe(containerRef.current);

    const onData = term.onData((data) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(new TextEncoder().encode(data));
      }
    });

    socket.binaryType = "arraybuffer";
    const onMessage = (event: MessageEvent) => {
      // Binary frames are terminal stdout from Docker PTY
      if (event.data instanceof ArrayBuffer) {
        term.write(new Uint8Array(event.data));
      }
    };
    socket.addEventListener("message", onMessage);

    if (socket.readyState === WebSocket.OPEN) {
      sendResize();
    } else {
      socket.addEventListener("open", sendResize, { once: true });
    }

    return () => {
      resizeObserver.disconnect();
      onData.dispose();
      socket.removeEventListener("message", onMessage);
      term.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
    };
  }, [socket]);

  // Adjust font size dynamically
  useEffect(() => {
    if (termRef.current && fitAddonRef.current) {
      termRef.current.options.fontSize = fontSize;
      try {
        fitAddonRef.current.fit();
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "resize",
              cols: termRef.current.cols,
              rows: termRef.current.rows,
            }),
          );
        }
      } catch {}
    }
  }, [fontSize, socket]);

  function handleClear() {
    if (termRef.current) {
      termRef.current.clear();
      // Send Ctrl+L form-feed byte to the shell
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(new Uint8Array([12])); // 12 is Ctrl+L (Form Feed)
      }
    }
  }

  function handleResetShell() {
    if (socket && socket.readyState === WebSocket.OPEN) {
      // Send SIGINT (Ctrl+C) then clear
      socket.send(new Uint8Array([3]));
      setTimeout(() => {
        socket.send(new TextEncoder().encode("clear\n"));
      }, 50);
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#080b12] border border-white/[0.08] rounded-xl overflow-hidden shadow-card">
      {/* Terminal Top Window Chrome */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0c101a] border-b border-white/[0.06] select-none text-xs">
        <div className="flex items-center gap-2">
          {/* OS Window Dots */}
          <div className="flex items-center gap-1.5 mr-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-700/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-700/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-700/60" />
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] bg-slate-900/80 px-2 py-0.5 rounded border border-white/[0.05]">
            <TerminalIcon size={12} className="text-blue-400" />
            <span className="text-slate-300 font-medium">{containerInfo}</span>
            <span className="text-slate-600">/bin/sh</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 ml-2 text-[11px]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                socket && socket.readyState === WebSocket.OPEN
                  ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                  : "bg-amber-400 animate-pulse"
              }`}
            />
            <span className="text-slate-400 font-mono">
              {socket && socket.readyState === WebSocket.OPEN ? "TTY Active" : "Connecting..."}
            </span>
          </div>
        </div>

        {/* Terminal Controls */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            title="Clear Terminal (Ctrl+L)"
            onClick={handleClear}
            className="p-1.5 hover:text-slate-200 hover:bg-slate-800/60 rounded transition-colors"
          >
            <ClearIcon size={13} />
          </button>
          <button
            type="button"
            title="Reset / Send Ctrl+C"
            onClick={handleResetShell}
            className="p-1.5 hover:text-slate-200 hover:bg-slate-800/60 rounded transition-colors"
          >
            <RefreshCwIcon size={12} />
          </button>
          <span className="h-3 w-px bg-white/10 mx-0.5" />
          <button
            type="button"
            title="Decrease Font Size"
            onClick={() => setFontSize((s) => Math.max(11, s - 1))}
            className="p-1.5 hover:text-slate-200 hover:bg-slate-800/60 rounded transition-colors"
          >
            <ZoomOutIcon size={13} />
          </button>
          <span className="text-[11px] font-mono text-slate-500 w-5 text-center">{fontSize}</span>
          <button
            type="button"
            title="Increase Font Size"
            onClick={() => setFontSize((s) => Math.min(18, s + 1))}
            className="p-1.5 hover:text-slate-200 hover:bg-slate-800/60 rounded transition-colors"
          >
            <ZoomInIcon size={13} />
          </button>

          {onToggleMaximize && (
            <>
              <span className="h-3 w-px bg-white/10 mx-0.5" />
              <button
                type="button"
                title={isMaximized ? "Restore Split View" : "Maximize Terminal"}
                onClick={onToggleMaximize}
                className="p-1.5 hover:text-blue-400 hover:bg-slate-800/60 rounded transition-colors"
              >
                {isMaximized ? <MinimizeIcon size={13} /> : <MaximizeIcon size={13} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Actual xterm viewport */}
      <div className="flex-1 min-h-0 p-1.5 relative">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
