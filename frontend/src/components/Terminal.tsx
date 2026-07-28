import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

/** Bridges an xterm.js instance to the terminal-server WebSocket: binary frames only. */
export function Terminal({ socket }: { socket: WebSocket | null }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !socket) return;

    const term = new XTerm({
      convertEol: true,
      fontSize: 13.5,
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: "bar",
      theme: {
        background: "#0b0e17",
        foreground: "#e2e8f0",
        cursor: "#818cf8",
        cursorAccent: "#0b0e17",
        selectionBackground: "#6366f14d",
        black: "#0b0e17",
        brightBlack: "#475569",
      },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current);
    fit.fit();

    const sendResize = () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      fit.fit();
      sendResize();
    });
    resizeObserver.observe(containerRef.current);

    const onData = term.onData((data) => {
      if (socket.readyState === WebSocket.OPEN) socket.send(new TextEncoder().encode(data));
    });

    socket.binaryType = "arraybuffer";
    const onMessage = (event: MessageEvent) => {
      // Control messages (step_result, etc.) arrive as text frames — only binary frames are terminal output.
      if (event.data instanceof ArrayBuffer) {
        term.write(new Uint8Array(event.data));
      }
    };
    socket.addEventListener("message", onMessage);

    if (socket.readyState === WebSocket.OPEN) sendResize();
    else socket.addEventListener("open", sendResize, { once: true });

    return () => {
      resizeObserver.disconnect();
      onData.dispose();
      socket.removeEventListener("message", onMessage);
      term.dispose();
    };
  }, [socket]);

  return <div ref={containerRef} className="h-full w-full" />;
}
