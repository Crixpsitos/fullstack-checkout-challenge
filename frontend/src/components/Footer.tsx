import { Link } from 'react-router-dom'
import { Send } from 'lucide-react'

const FOOTER_LINKS = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Shipping Info', to: '/shipping' },
  { label: 'Contact Us', to: '/contact' },
]

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="text-xl font-bold tracking-[0.25em] uppercase">
              Lumina
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mt-3">
              Minimalist design meets everyday elegance.
              Secure payments processed via encrypted gateway.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Additional Links
            </p>
            <ul className="space-y-2">
              {FOOTER_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-gray-300 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Stay in the loop
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-gray-800 text-sm text-white placeholder-gray-500 rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-gray-400"
              />
              <button className="flex items-center gap-1.5 bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Send size={13} />
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">© 2024 Lumina. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}