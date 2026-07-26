import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '../layouts/RootLayout'
import { HomePage } from '../pages/Home'
import { ProductsPage } from '../pages/Products'
import { ProductDetailPage } from '../pages/ProductDetail'
import { NotFoundPage } from '../pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
