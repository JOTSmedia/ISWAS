import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { WorldMount } from "@/components/world/world-mount";

const NAV = [
  { to: "/", n: "01", label: "Overview" },
  { to: "/need", n: "02", label: "Need" },
  { to: "/stars", n: "03", label: "Stars" },
  { to: "/form", n: "04", label: "Form" },
  { to: "/comparison", n: "05", label: "Comparison" },
  { to: "/contact", n: "06", label: "Contact" },
] as const;

function TitleMark() {
  return (
    <>
      <span className="mark-rest">it started with a</span>{" "}
      <span className="mark-scream">SCREAM</span>
    </>
  );
}

function useRandomScreamGlow() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timers = new Map<HTMLElement, number>();
    const arm = (el: HTMLElement) => {
      if (timers.has(el) || el.classList.contains("load-scream")) return;
      const pulse = () => {
        if (!el.isConnected) {
          const pending = timers.get(el);
          if (pending) window.clearTimeout(pending);
          timers.delete(el);
          return;
        }
        el.classList.add("is-glowing");
        const hold = window.setTimeout(() => {
          el.classList.remove("is-glowing");
          const wait = window.setTimeout(pulse, 480 + Math.random() * 2600);
          timers.set(el, wait);
        }, 360 + Math.random() * 800);
        timers.set(el, hold);
      };
      timers.set(el, window.setTimeout(pulse, Math.random() * 1600));
    };
    const scan = () => document.querySelectorAll<HTMLElement>(".mark-scream").forEach(arm);
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);
}

function lockScream(el: HTMLElement) {
  el.style.fontFamily = '"Nosifer", cursive';
  el.style.fontWeight = "400";
  el.style.fontSynthesis = "none";
  el.style.textTransform = "uppercase";
  el.style.fontVariantCaps = "normal";
  el.style.letterSpacing = "0.02em";
  el.style.color = "var(--color-accent)";
}

function LoadScreen({ onDone }: { onDone: () => void }) {
  const restRef = useRef<HTMLSpanElement>(null);
  const screamRef = useRef<HTMLSpanElement>(null);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState(0);
  const [phase, setPhase] = useState<"load" | "scream">("load");

  useEffect(() => {
    if (phase !== "load") return;
    const order = [0, 1, 2, 3, 2, 1];
    let index = 0;
    const id = window.setInterval(() => {
      index = (index + 1) % order.length;
      setDots(order[index]);
    }, 260);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      onDone();
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const ready = (document.readyState === "complete" && elapsed > 1400) || elapsed > 2800;
      const target = ready ? 100 : Math.min(92, (elapsed / 1400) * 92);
      setProgress((current) => (current > target ? current : target));
      if (ready && elapsed > 1560) {
        setPhase("scream");
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  useEffect(() => {
    if (phase !== "scream") return;
    const scream = screamRef.current;
    const rest = restRef.current;
    const heroRest = document.querySelector<HTMLElement>(".hero-title .mark-rest");
    const heroScream = document.querySelector<HTMLElement>(".hero-title .mark-scream");
    if (!scream || !rest || !heroRest || !heroScream) {
      onDone();
      return;
    }

    lockScream(scream);
    const startBox = scream.getBoundingClientRect();
    const startSize = parseFloat(getComputedStyle(scream).fontSize) || 48;
    const targetWidth = window.innerWidth * 0.75;
    const big = startSize * (targetWidth / Math.max(startBox.width, 1));

    const pin = (el: HTMLElement, box: DOMRect, size: number) => {
      el.style.position = "fixed";
      el.style.margin = "0";
      el.style.whiteSpace = "nowrap";
      el.style.lineHeight = "1";
      el.style.left = `${box.left + box.width / 2}px`;
      el.style.top = `${box.top + box.height / 2}px`;
      el.style.transform = "translate(-50%, -50%)";
      el.style.fontSize = `${size}px`;
    };
    pin(scream, startBox, startSize);

    const grow = "680ms cubic-bezier(0.16, 1, 0.3, 1)";
    const frame = requestAnimationFrame(() => {
      scream.style.transition = `left ${grow}, top ${grow}, font-size ${grow}`;
      scream.style.left = `${window.innerWidth / 2}px`;
      scream.style.top = `${window.innerHeight * 0.5}px`;
      scream.style.fontSize = `${big}px`;
    });

    const peakTimer = window.setTimeout(() => {
      scream.classList.add("is-peak");
    }, 720);

    const settleTimer = window.setTimeout(() => {
      scream.classList.remove("is-peak");
      const screamTarget = heroScream.getBoundingClientRect();
      const screamEnd = parseFloat(getComputedStyle(heroScream).fontSize);
      const ease = "880ms cubic-bezier(0.16, 1, 0.3, 1)";
      let shrinking = false;
      const finish = (event: TransitionEvent) => {
        if (!shrinking || event.propertyName !== "font-size") return;
        scream.classList.remove("is-shaking");
        scream.removeEventListener("transitionend", finish);
        onDone();
      };
      scream.addEventListener("transitionend", finish);
      requestAnimationFrame(() => {
        shrinking = true;
        scream.classList.add("is-shaking");
        scream.style.transition = `left ${ease}, top ${ease}, font-size ${ease}`;
        scream.style.left = `${screamTarget.left + screamTarget.width / 2}px`;
        scream.style.top = `${screamTarget.top + screamTarget.height / 2}px`;
        scream.style.fontSize = `${screamEnd}px`;
      });
    }, 1900);

    const fallbackTimer = window.setTimeout(onDone, 3000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(peakTimer);
      window.clearTimeout(settleTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [phase, onDone]);

  const percent = Math.round(progress);

  return (
    <div className="load-screen" role="status" aria-label="Loading">
      <div className="load-stack">
        <p className="load-phrase" data-hidden={phase === "scream" ? "true" : "false"}>
          <span ref={restRef} className="mark-rest">
            it started with a
          </span>
          {phase === "load" ? (
            <span className="load-dots" aria-hidden="true">
              <i data-on={dots >= 1}>.</i>
              <i data-on={dots >= 2}>.</i>
              <i data-on={dots >= 3}>.</i>
            </span>
          ) : null}
        </p>
        {phase === "load" ? (
          <div className="load-meter">
            <div
              className="load-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <div className="load-bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="load-percent">{percent}%</p>
          </div>
        ) : (
          <span ref={screamRef} className="mark-scream load-scream">
            SCREAM
          </span>
        )}
      </div>
    </div>
  );
}

function SocialIcon({ name }: { name: string }) {
  if (name === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "X") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5 L19 19 M19 5 L5 19" />
      </svg>
    );
  }
  if (name === "Facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 8h3V4h-3c-2.2 0-4 1.8-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8c0-.6.4-1 1-1z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M11 10 L16 12.5 L11 15 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SlideNav({ pathname }: { pathname: string }) {
  const index = NAV.findIndex((item) => item.to === pathname);
  const prev = index > 0 ? NAV[index - 1] : null;
  const next = index >= 0 && index < NAV.length - 1 ? NAV[index + 1] : null;
  if (!prev && !next) return null;

  return (
    <nav className="slide-nav" aria-label="Slides">
      {prev ? (
        <Link to={prev.to} className="slide-link">
          <span className="tabular-nums">{prev.n}</span>
          {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={next.to} className="slide-link slide-link-next">
          <span className="tabular-nums">{next.n}</span>
          {next.label}
        </Link>
      ) : null}
    </nav>
  );
}

function SiteFooter() {
  const social = ["Instagram", "X", "Facebook", "YouTube"];

  return (
    <footer className="site-footer">
      <p className="text-xs font-medium tracking-stamp text-secondary">Trancas International Films</p>
      <p className="mt-2 font-sans text-sm font-semibold text-fg">
        <TitleMark />
      </p>
      <ul className="social-row">
        {social.map((name) => (
          <li key={name}>
            <a
              href={`#${name.toLowerCase()}`}
              className="social-link"
              aria-label={`${name} placeholder`}
              onClick={(event) => event.preventDefault()}
            >
              <SocialIcon name={name} />
              {name}
            </a>
          </li>
        ))}
      </ul>
      <p>© 2023 Trancas International Films, Inc. All rights reserved.</p>
      <p className="mt-1">Confidential proprietary information. WGA No. 2310392. For the intended recipient only.</p>
    </footer>
  );
}

function useSectionScroll(pathname: string, intro: boolean) {
  const navigate = useNavigate();
  const lock = useRef(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (intro) return;
    const index = NAV.findIndex((item) => item.to === pathname);
    if (index < 0) return;

    const blocked = () => Boolean(document.querySelector(".gallery-dialog, [role='dialog']"));
    const scroller = () => document.scrollingElement;
    const atTop = () => (scroller()?.scrollTop ?? 0) < 8;
    const atBottom = () => {
      const el = scroller();
      if (!el) return true;
      return el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    };

    const go = (dir: 1 | -1) => {
      if (blocked() || performance.now() < lock.current) return;
      const next = NAV[index + dir];
      if (!next) return;
      if (dir === 1 && !atBottom()) return;
      if (dir === -1 && !atTop()) return;
      lock.current = performance.now() + 880;
      void navigate({ to: next.to });
    };

    const onWheel = (event: WheelEvent) => {
      if (blocked() || Math.abs(event.deltaY) < 12) return;
      const dir: 1 | -1 = event.deltaY > 0 ? 1 : -1;
      const edge = dir === 1 ? atBottom() && index < NAV.length - 1 : atTop() && index > 0;
      if (!edge) return;
      event.preventDefault();
      go(dir);
    };

    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const y = event.changedTouches[0]?.clientY ?? touchY;
      const dy = touchY - y;
      if (Math.abs(dy) < 56) return;
      go(dy > 0 ? 1 : -1);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pathname, intro, navigate]);
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [intro, setIntro] = useState(pathname === "/");
  useRandomScreamGlow();
  useSectionScroll(pathname, intro);

  return (
    <div className={intro ? "relative min-h-dvh is-intro" : "relative min-h-dvh"}>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-bg focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <WorldMount />
      <div className="scrim pointer-events-none fixed inset-0 z-[1]" />
      <div className="grain pointer-events-none fixed inset-0 z-[2]" />
      <div className="vignette pointer-events-none fixed inset-0 z-[2]" />
      <header className="mast">
        <Link to="/" className="brand block font-sans text-sm font-semibold tracking-tight text-fg md:text-base">
          <TitleMark />
        </Link>
        <nav
          className="mt-2 flex w-full flex-wrap items-baseline gap-x-3 gap-y-1 md:justify-center md:gap-x-5"
          aria-label="Presentation"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="nav-link inline-flex min-h-11 items-baseline gap-1.5 text-sm text-muted md:min-h-9"
            >
              <span className="text-xs tabular-nums tracking-wider">{item.n}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="sheet" id="content">
        <div key={pathname} className={intro ? "dossier-panel" : "dossier-panel rise"}>
          {children}
          <SlideNav pathname={pathname} />
        </div>
      </div>
      <SiteFooter />
      {intro ? <LoadScreen onDone={() => setIntro(false)} /> : null}
    </div>
  );
}
