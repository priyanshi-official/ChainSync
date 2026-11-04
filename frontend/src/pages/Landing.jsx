import { useEffect, useState } from 'react'
import {
  ArrowRight, Boxes, ShieldCheck, Truck, Users, Zap,
  Factory, Package, BrainCircuit, Link2
} from 'lucide-react'
import Navbar from '../components/Navbar'

function Landing() {
  const [imageVisible, setImageVisible] = useState(false)

  useEffect(() => {
    setImageVisible(true)
  }, [])

  const features = [
    { icon: Users, title: 'Trusted Network', description: 'Connect with verified suppliers and distributors.' },
    { icon: ShieldCheck, title: 'Secure Transactions', description: 'Safe, transparent and reliable business workflows.' },
    { icon: Zap, title: 'Real-Time Tracking', description: 'Stay updated at every step of the supply chain.' },
    { icon: BrainCircuit, title: 'AI-Powered Insights', description: 'Make smarter decisions with data and AI.' }
  ]

  const steps = [
    { icon: Factory, title: 'Manufacturer', description: 'Post requirements, find suppliers, manage orders and track production.' },
    { icon: Truck, title: 'Supplier', description: 'Receive requests, share quotations, confirm orders and manage deliveries.' },
    { icon: Package, title: 'Distributor', description: 'Place orders, track shipments, receive goods and manage inventory.' }
  ]

  const cardClass = "rounded-2xl border border-[#19372a] bg-[#0d211a] p-6 text-[#edf8f2] transition-all duration-300 hover:-translate-y-2 hover:border-[#16865b] hover:shadow-xl hover:shadow-[#16865b]/10 dark:border-[#19372a] dark:bg-[#0d211a] dark:hover:border-[#42dda0] dark:hover:shadow-black/20"

  return (
    <div className="min-h-screen scroll-smooth overflow-hidden bg-[#f1f7f3] text-[#102a20] transition-colors duration-300 dark:bg-black dark:text-[#edf8f2]">
      <Navbar />

      <main>
        <section id="home" className="relative border-b border-[#c8ded1] bg-[radial-gradient(ellipse_at_80%_45%,rgba(22,134,91,0.12),transparent_42%)] dark:border-[#19372a] dark:bg-[radial-gradient(ellipse_at_78%_45%,rgba(36,173,117,0.13),transparent_40%)]">
          <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#42dda0]/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-24">
            <div className="relative z-10 transition-all duration-700">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#19372a] bg-[#0d211a] px-4 py-2 text-xs font-bold tracking-wide text-[#42dda0] shadow-sm dark:border-[#29483a] dark:bg-[#0d211a]/80 dark:text-[#42dda0]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#42dda0]" />
                CONNECT · PROCURE · GROW
              </div>

              <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
                Smarter Supply Chains for{' '}
                <span className="bg-gradient-to-r from-[#16865b] to-[#42dda0] bg-clip-text text-transparent dark:from-[#a4f5d0] dark:to-[#42dda0]">
                  Stronger MSMEs
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-[#526d60] dark:text-[#c5d8d0] sm:text-lg sm:leading-8">
                ChainSync is a unified platform that connects manufacturers,
                suppliers and distributors - making procurement, inventory and
                distribution simpler, faster and more transparent.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a href="/signup" className="group inline-flex items-center gap-2 rounded-full bg-[#16865b] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#16865b]/20 transition duration-300 hover:-translate-y-1 hover:bg-[#106e49] hover:shadow-xl dark:bg-[#42dda0] dark:text-[#07120f] dark:hover:bg-[#68e9b5]">
                  Get Started <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <a href="#how-it-works"
                  className="rounded-full border border-[#19372a] bg-[#0d211a] px-7 py-3.5 text-sm font-semibold text-[#edf8f2] transition duration-300 hover:-translate-y-1 hover:border-[#16865b] hover:bg-[#10271e] dark:border-[#29483a] dark:bg-[#0d211a]/60 dark:text-[#edf8f2] dark:hover:border-[#42dda0] dark:hover:bg-[#0d211a]">
                  Explore Platform
                </a>
              </div>

              <div className="mt-8 flex items-center gap-2 text-sm text-[#526d60] dark:text-[#c5d8d0]">
                <ShieldCheck size={18} className="shrink-0 text-[#16865b] dark:text-[#42dda0]" />
                Built for connected, transparent business operations
              </div>
            </div>

            <div
              className={`relative mx-auto w-full max-w-xl transition-all duration-1000 ease-out ${
                imageVisible
                  ? 'translate-y-0 scale-100 opacity-100'
                  : 'translate-y-12 scale-90 opacity-0'
              }`}
              style={{ transitionDelay: '250ms' }}
            >
              <div className="pointer-events-none absolute inset-10 animate-pulse rounded-full bg-[#42dda0]/10 blur-3xl" />

              <div className="relative rounded-3xl border border-[#19372a] bg-[#0d211a] p-5 text-[#edf8f2] shadow-2xl shadow-[#102a20]/10 backdrop-blur-sm dark:border-[#19372a] dark:bg-[#0d211a]/90 dark:shadow-black/30 sm:p-8">
                <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-[#19372a] bg-[#07120f] px-3 py-1.5 text-xs font-semibold text-[#c5d8d0] dark:border-[#19372a] dark:bg-[#07120f] dark:text-[#c5d8d0]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#42dda0]" />
                  Connected network
                </div>

                <div className="mb-8 mt-12 flex items-center justify-center gap-3 sm:gap-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#19372a] bg-[#10271e] text-[#42dda0] shadow-sm transition duration-300 hover:-translate-y-2 dark:border-[#19372a] dark:bg-[#10271e] dark:text-[#42dda0] sm:h-20 sm:w-20">
                    <Factory size={32} />
                  </div>
                  <div className="flex flex-1 items-center justify-center">
                    <div className="h-px flex-1 border-t border-dashed border-[#42dda0]" />
                    <Link2 size={22} className="mx-2 shrink-0 text-[#42dda0]" />
                    <div className="h-px flex-1 border-t border-dashed border-[#42dda0]" />
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#19372a] bg-[#10271e] text-[#42dda0] shadow-sm transition duration-300 hover:-translate-y-2 dark:border-[#19372a] dark:bg-[#10271e] dark:text-[#42dda0] sm:h-20 sm:w-20">
                    <Boxes size={32} />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#19372a] bg-[#07120f] p-4 text-[#edf8f2] dark:border-[#19372a] dark:bg-[#07120f] sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">Supply chain overview</p>
                      <p className="mt-1 text-xs text-[#c5d8d0]">One connected workflow</p>
                    </div>
                    <Truck size={24} className="text-[#42dda0]" />
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      { icon: Factory, label: 'Manufacture' },
                      { icon: Boxes, label: 'Procure' },
                      { icon: Package, label: 'Distribute' }
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="rounded-xl bg-[#10271e] p-3 text-center text-[#edf8f2] transition duration-300 hover:-translate-y-1 dark:bg-[#10271e]">
                        <Icon size={21} className="mx-auto text-[#42dda0]" />
                        <p className="mt-2 text-[10px] font-bold sm:text-xs">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 text-[9px] font-bold tracking-wider text-[#c5d8d0] dark:text-[#c5d8d0] sm:text-xs sm:tracking-widest">
                  <span>SUPPLIER</span>
                  <ArrowRight size={15} className="text-[#42dda0]" />
                  <span>MANUFACTURER</span>
                  <ArrowRight size={15} className="text-[#42dda0]" />
                  <span>DISTRIBUTOR</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Platform benefits" className="border-b border-[#c8ded1] bg-[#f1f7f3] dark:border-[#19372a] dark:bg-black">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} className="group flex items-start gap-4 rounded-2xl border border-[#19372a] bg-[#0d211a] p-4 text-[#edf8f2] transition duration-300 hover:-translate-y-1 hover:border-[#16865b] hover:shadow-lg hover:shadow-[#16865b]/10 dark:border-transparent dark:bg-transparent dark:hover:bg-[#0d211a]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#19372a] bg-[#10271e] text-[#42dda0] transition duration-300 group-hover:scale-110 dark:border-[#19372a] dark:bg-[#0d211a] dark:text-[#42dda0]">
                  <Icon size={23} />
                </div>
                <div>
                  <h2 className="text-sm font-bold">{title}</h2>
                  <p className="mt-1.5 text-sm leading-5 text-[#c5d8d0] dark:text-[#c5d8d0]">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:py-20 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-xs font-bold tracking-[0.2em] text-[#16865b] dark:text-[#42dda0]">THE PROBLEM</p>
            <h2 className="max-w-lg text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              MSMEs Face Real Supply Chain Challenges
            </h2>
            <p className="mt-5 max-w-lg leading-7 text-[#526d60] dark:text-[#c5d8d0]">
              Fragmented communication, delayed shipments, manual processes
              and limited visibility create inefficiencies and risks for MSMEs.
            </p>
          </div>

          <div className={`${cardClass} relative flex flex-col justify-center overflow-hidden p-7 sm:p-9`}>
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#42dda0]/10 blur-3xl" />
            <div className="relative">
              <p className="mb-4 text-xs font-bold tracking-[0.2em] text-[#42dda0] dark:text-[#42dda0]">OUR SOLUTION</p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">One Platform. Complete Control.</h2>
              <p className="mt-5 leading-7 text-[#c5d8d0] dark:text-[#c5d8d0]">
                ChainSync brings supplier connections, purchase orders, inventory,
                shipments, invoices and AI-driven insights together in one place.
              </p>
              <a href="#how-it-works" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#42dda0] transition-all hover:gap-4 dark:text-[#42dda0]">
                Discover the workflow <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-[#c8ded1] bg-[#f1f7f3] dark:border-[#19372a] dark:bg-black">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-4 text-xs font-bold tracking-[0.2em] text-[#16865b] dark:text-[#42dda0]">HOW IT WORKS</p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Simple Process. Powerful Results.</h2>
              <p className="mt-4 leading-7 text-[#526d60] dark:text-[#c5d8d0]">Three business roles connected through one platform.</p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {steps.map(({ icon: Icon, title, description }, index) => (
                <article key={title} className={cardClass}>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#19372a] bg-[#10271e] text-[#42dda0] dark:border-[#19372a] dark:bg-[#10271e] dark:text-[#42dda0]">
                      <Icon size={24} />
                    </div>
                    <span className="text-sm font-bold tracking-widest text-[#42dda0] dark:text-[#42dda0]">0{index + 1}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#c5d8d0] dark:text-[#c5d8d0]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="get-started" className="px-5 py-16 sm:py-20">
          <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-8 overflow-hidden rounded-3xl border border-[#19372a] bg-[#0d211a] p-7 text-[#edf8f2] shadow-xl shadow-[#102a20]/5 dark:border-[#19372a] dark:bg-[#0d211a] sm:p-10 lg:flex-row lg:items-center lg:p-14">
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#42dda0]/10 blur-3xl" />
            <div className="relative">
              <p className="mb-4 text-xs font-bold tracking-[0.2em] text-[#42dda0] dark:text-[#42dda0]">READY TO GET CONNECTED?</p>
              <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">Build a smarter supply chain with ChainSync.</h2>
              <p className="mt-4 text-[#c5d8d0] dark:text-[#c5d8d0]">Bring your business operations closer together.</p>
            </div>
            <div className="relative flex shrink-0 flex-wrap gap-3">
              <a href="/signup" className="group inline-flex items-center gap-2 rounded-full bg-[#16865b] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#16865b]/15 transition duration-300 hover:-translate-y-1 hover:bg-[#106e49] dark:bg-[#42dda0] dark:text-[#07120f] dark:hover:bg-[#68e9b5]">
                Get Started <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a href="/login" className="rounded-full border border-[#29483a] px-6 py-3.5 text-sm font-semibold text-[#edf8f2] transition hover:border-[#42dda0] dark:border-[#29483a] dark:hover:border-[#42dda0]">
                Login
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-[#aecdb9] bg-[#dcebe1] dark:border-[#19372a] dark:bg-[#07120f]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-9 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <a href="#home" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d7f1e3] text-[#16865b] transition duration-300 group-hover:rotate-[-6deg] dark:bg-[#0d211a] dark:text-[#42dda0]">
              <Link2 size={23} />
            </span>
            <span>
              <span className="block font-bold">ChainSync</span>
              <span className="block text-xs text-[#526d60] dark:text-[#c5d8d0]">MSME Supply Chain Platform</span>
            </span>
          </a>
          <p className="text-sm text-[#526d60] dark:text-[#c5d8d0]">Connecting manufacturers, suppliers and distributors.</p>
          <div className="flex flex-wrap gap-5 text-sm text-[#526d60] dark:text-[#c5d8d0]">
            <a href="#home" className="transition hover:text-[#16865b] dark:hover:text-[#42dda0]">Home</a>
            <a href="#about" className="transition hover:text-[#16865b] dark:hover:text-[#42dda0]">About</a>
            <a href="#how-it-works" className="transition hover:text-[#16865b] dark:hover:text-[#42dda0]">How It Works</a>
          </div>
          <p className="text-xs text-[#526d60] dark:text-[#c5d8d0]">© {new Date().getFullYear()} ChainSync</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
