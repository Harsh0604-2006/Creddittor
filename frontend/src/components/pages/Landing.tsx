import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 md:py-6">
        <div className="text-2xl font-bold tracking-tight">Credex</div>
        <button
          onClick={() => navigate('/audit')}
          className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
          aria-label="Audit my AI stack"
        >
          Start Audit
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 md:py-32 text-center">
        {/* Hero Content */}
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
            Find out if you're overpaying for AI tools
          </h1>

          <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
            Free 2-minute audit. See exactly where your team is overspending and what to switch.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <button
              onClick={() => navigate('/audit')}
              className="px-8 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
              aria-label="Begin audit of my AI spending"
            >
              Audit my stack →
            </button>
          </div>

          {/* Trust Badge */}
          <div className="pt-8">
            <p className="text-sm text-slate-400">
              ✓ No credit card required · ✓ Takes 2 minutes · ✓ Free forever
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mt-20 md:mt-32 max-w-3xl">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">5K+</div>
            <p className="text-sm text-slate-400">Teams Audited</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">$2M+</div>
            <p className="text-sm text-slate-400">Saved</p>
          </div>
          <div className="col-span-2 md:col-span-1 text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">18</div>
            <p className="text-sm text-slate-400">Tools Supported</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 px-6 py-6 md:px-12 md:py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>&copy; 2024 Credex. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#terms" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
