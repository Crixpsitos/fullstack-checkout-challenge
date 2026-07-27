import { Link, NavLink } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-sm text-gray-900 font-medium border-b-2 border-gray-900 pb-0.5'
    : 'text-sm text-gray-500 hover:text-gray-900 transition-colors'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold tracking-[0.25em] text-gray-900 uppercase">
            Lumina
          </Link>

          <nav className="flex items-center gap-8">
            <NavLink to="/" end className={navLinkClass}>Inicio</NavLink>
            <NavLink to="/products" className={navLinkClass}>Productos</NavLink>
          </nav>
        </div>
      </div>
    </header>
  )
}