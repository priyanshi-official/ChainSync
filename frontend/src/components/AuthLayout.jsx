
import { Link } from 'react-router-dom'
import {ArrowLeft,Link2,ShieldCheck,Zap,ChartNoAxesColumnIncreasing} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function AuthLayout({ badge, title, subtitle, children, footer }) {
  const { theme } = useTheme()
  const dark = theme === 'dark'

  return (
    <main className={`min-h-screen p-3 sm:p-4 lg:h-screen lg:overflow-hidden ${dark ? 'bg-[#07120f] text-white' : 'bg-[#f1f7f3] text-[#102a20]'}`}>
      <div className={`mx-auto grid min-h-[calc(100vh-1.5rem)] w-full max-w-6xl overflow-hidden rounded-3xl border shadow-2xl sm:min-h-[calc(100vh-2rem)] lg:h-full lg:min-h-0 lg:grid-cols-[42%_58%] ${dark ? 'border-[#19372a] bg-[#0d211a]' : 'border-[#d5e7dc] bg-white'}`}>

        <section className="flex flex-col justify-between bg-[#0d211a] p-6 text-white sm:p-8 lg:p-7 xl:p-9">
          <div>
            <Link to="/" className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#245544] text-[#42dda0] hover:bg-[#14382b]">
              <ArrowLeft size={19} />
            </Link>

            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#42dda0] text-[#07120f]">
                <Link2 size={25} />
              </span>
              <span>
                <span className="block text-xl font-bold">ChainSync</span>
                <span className="text-[11px] text-[#a4c8b9]">MSME Supply Chain Platform</span>
              </span>
            </Link>
          </div>

          <div className="my-5">
            <p className="mb-3 text-[11px] font-bold tracking-[0.2em] text-[#42dda0]">
              CONNECT · PROCURE · GROW
            </p>
            <h1 className="text-3xl font-extrabold leading-tight xl:text-4xl">
              Your supply chain, connected.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#c5d8d0]">
              Connect with business partners, manage procurement and keep your supply chain moving from one platform.
            </p>
            <img
              src="/chainsync-supply-chain.png"
              alt="Connected supply chain"
              className="mx-auto mt-5 max-h-40 w-full object-contain xl:max-h-44"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-[#245544] pt-4">
            {[
              { Icon: ShieldCheck, text: 'Trusted Network' },
              { Icon: Zap, text: 'Secure Process' },
              { Icon: ChartNoAxesColumnIncreasing, text: 'Real-Time Tracking' }
            ].map(({ Icon, text }) => (
              <div key={text} className="text-center">
                <Icon size={19} className="mx-auto mb-1.5 text-[#42dda0]" />
                <p className="text-[10px] text-[#c5d8d0]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`flex items-center justify-center p-5 sm:p-7 lg:p-8 xl:p-10 ${dark ? 'bg-[#0d211a]' : 'bg-white'}`}>
          <div className="w-full max-w-md">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#16865b] dark:text-[#42dda0]">
              {badge}
            </p>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {title}
            </h2>

            <p className={`mt-2 text-sm leading-5 ${dark ? 'text-[#c5d8d0]' : 'text-[#526d60]'}`}>
              {subtitle}
            </p>

            <div className="mt-5">{children}</div>

            <div className={`mt-5 border-t pt-4 text-center text-sm ${dark ? 'border-[#29483a] text-[#c5d8d0]' : 'border-[#d5e7dc] text-[#526d60]'}`}>
              {footer}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AuthLayout
