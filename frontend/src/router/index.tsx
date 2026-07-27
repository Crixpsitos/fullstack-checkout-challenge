import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '../layouts/RootLayout'

const HomePage          = lazy(() => import('../pages/Home').then(m => ({ default: m.HomePage })))
const ProductsPage      = lazy(() => import('../pages/Products').then(m => ({ default: m.ProductsPage })))
const ProductDetailPage = lazy(() => import('../pages/ProductDetail').then(m => ({ default: m.ProductDetailPage })))
const CheckoutPage      = lazy(() => import('../pages/Checkout').then(m => ({ default: m.CheckoutPage })))
const NotFoundPage      = lazy(() => import('../pages/NotFound').then(m => ({ default: m.NotFoundPage })))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true,          element: <Suspense fallback={<PageLoader />}><HomePage /></Suspense> },
      { path: 'products',     element: <Suspense fallback={<PageLoader />}><ProductsPage /></Suspense> },
      { path: 'products/:id', element: <Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense> },
      { path: 'checkout/:id', element: <Suspense fallback={<PageLoader />}><CheckoutPage /></Suspense> },
      { path: '*',            element: <Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense> },
    ],
  },
])
