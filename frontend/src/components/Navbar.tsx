import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart, Search, Menu } from 'lucide-react'

interface NavbarProps {
  cartCount?: number
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-sm text-gray-900 font-medium border-b-2 border-gray-900 pb-0.5'
    : 'text-sm text-gray-500 hover:text-gray-900 transition-colors'

export function Navbar({ cartCount = 0 }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-[0.25em] text-gray-900 uppercase">
            Lumina
          </Link>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" end className={navLinkClass}>
              Inicio
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              Productos
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              Nosotros
            </NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-900 transition-colors" aria-label="Buscar">
              <Search size={18} />
            </button>

            <Link to="/cart" className="relative text-gray-500 hover:text-gray-900 transition-colors" aria-label="Carrito">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button className="md:hidden text-gray-500 hover:text-gray-900 transition-colors" aria-label="Menú">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}