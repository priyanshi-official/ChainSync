
import { useState } from 'react'
import { Link2, Menu, X, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Contact', href: '#contact' }
  ]

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[#d5e7dc]/80 bg-[#f8fcf9]/90 shadow-sm shadow-[#102a20]/[0.03] backdrop-blur-xl transition-colors duration-300 dark:border-[#19372a] dark:bg-[#07120f]/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <a href="#home" onClick={closeMenu} className="group flex shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d7f1e3] text-[#16865b] transition duration-300 group-hover:rotate-[-6deg] group-hover:scale-105 dark:bg-[#0d211a] dark:text-[#42dda0]">
            <Link2 size={25} />
          </span>
          <span>
            <span className="block text-lg font-extrabold tracking-tight text-[#102a20] dark:text-[#edf8f2]">ChainSync</span>
            <span className="block text-[10px] font-medium tracking-wide text-[#526d60] dark:text-[#a4c8b9] sm:text-xs">MSME Supply Chain Platform</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map(link => (
            <a key={link.label} href={link.href}
              className="relative py-2 text-sm font-semibold text-[#526d60] transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-[#16865b] after:transition-all after:duration-300 hover:text-[#16865b] hover:after:w-full dark:text-[#c5d8d0] dark:after:bg-[#42dda0] dark:hover:text-[#42dda0]">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link to="/login"
            className="rounded-full border border-[#c8ded1] px-5 py-2.5 text-sm font-semibold text-[#102a20] transition duration-200 hover:border-[#16865b] hover:bg-[#e4f2e9] dark:border-[#29483a] dark:text-[#edf8f2] dark:hover:border-[#42dda0] dark:hover:bg-[#0d211a]">
            Login
          </Link>
          <Link to="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-[#16865b] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#16865b]/15 transition duration-300 hover:-translate-y-0.5 hover:bg-[#106e49] hover:shadow-lg dark:bg-[#42dda0] dark:text-[#07120f] dark:hover:bg-[#68e9b5]">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button type="button" onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            className="rounded-xl border border-[#d5e7dc] p-2 text-[#102a20] transition hover:bg-[#e4f2e9] dark:border-[#29483a] dark:text-[#edf8f2] dark:hover:bg-[#0d211a]">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-[#d5e7dc] bg-[#ffffff] px-5 py-5 shadow-lg dark:border-[#19372a] dark:bg-[#0d211a] md:hidden">
          <nav className="flex flex-col gap-4">
            {links.map(link => (
              <a key={link.label} href={link.href} onClick={closeMenu}
                className="text-sm font-semibold text-[#102a20] transition hover:text-[#16865b] dark:text-[#edf8f2] dark:hover:text-[#42dda0]">
                {link.label}
              </a>
            ))}
            <Link to="/login" onClick={closeMenu}
              className="text-sm font-semibold text-[#102a20] dark:text-[#edf8f2]">
              Login
            </Link>
            <Link to="/signup" onClick={closeMenu}
              className="flex items-center justify-center gap-2 rounded-full bg-[#16865b] px-5 py-3 text-center text-sm font-bold text-white dark:bg-[#42dda0] dark:text-[#07120f]">
              Get Started <ArrowRight size={16} />
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
