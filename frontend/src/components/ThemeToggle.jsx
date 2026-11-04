import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button type="button" onClick={toggleTheme} aria-label="Toggle theme"
      aria-pressed={isDark}
      className="flex items-center gap-2 text-[#526d60] transition hover:text-[#16865b] dark:text-[#c5d8d0] dark:hover:text-[#42dda0]">
      <Sun size={16} />
      <span className="relative h-6 w-10 rounded-full border border-[#d5e7dc] bg-[#e4f2e9] p-0.5 dark:border-[#19372a] dark:bg-[#10271e]">
        <span className={`block h-4 w-4 rounded-full bg-[#16865b] transition-transform duration-200 dark:bg-[#42dda0] ${isDark ? 'translate-x-4' : ''}`} />
      </span>
      <Moon size={16} />
    </button>
  )
}

export default ThemeToggle