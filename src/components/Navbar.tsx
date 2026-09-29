import { Fragment, useState } from 'react';

const LINKS = ['Labs', 'Studio', 'Openings', 'Shop'];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 z-10 flex w-full items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <a href="#" className="flex items-center gap-3 text-black">
          <span
            className="text-[21px] tracking-tight sm:text-[26px]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Mainframe®
          </span>
          <span
            aria-hidden="true"
            className="text-[25px] select-none sm:text-[30px]"
            style={{ letterSpacing: '-0.02em' }}
          >
            ✳︎
          </span>
        </a>

        <div className="hidden text-[23px] text-black md:flex">
          {LINKS.map((label, i) => (
            <Fragment key={label}>
              <a href="#" className="transition-opacity hover:opacity-60">
                {label}
              </a>
              {i < LINKS.length - 1 && <span className="whitespace-pre">, </span>}
            </Fragment>
          ))}
        </div>

        <a
          href="mailto:hello@mainframe.co"
          className="hidden text-[23px] text-black underline underline-offset-2 transition-opacity hover:opacity-60 md:block"
        >
          Get in touch
        </a>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex flex-col gap-[5px] p-1 md:hidden"
        >
          <span
            className={`h-[2px] w-6 bg-black transition-all duration-300 ${
              open ? 'translate-y-[7px] rotate-45' : ''
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-black transition-all duration-300 ${
              open ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-black transition-all duration-300 ${
              open ? '-translate-y-[7px] -rotate-45' : ''
            }`}
          />
        </button>
      </nav>

      <div
        className="fixed inset-0 z-[9] flex flex-col items-start justify-center gap-8 bg-white/95 px-8 backdrop-blur-sm transition-opacity duration-300 md:hidden"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        aria-hidden={!open}
      >
        {LINKS.map((label) => (
          <a
            key={label}
            href="#"
            onClick={() => setOpen(false)}
            className="text-[32px] font-medium text-black"
          >
            {label}
          </a>
        ))}
        <a
          href="mailto:hello@mainframe.co"
          onClick={() => setOpen(false)}
          className="text-[32px] font-medium text-black underline underline-offset-2"
        >
          Get in touch
        </a>
      </div>
    </>
  );
}
