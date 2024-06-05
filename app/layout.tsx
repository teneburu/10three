import { Layout } from '@/components/dom/Layout'
import '@/global.css'

export const metadata = {
  title: 'Ténèbres - Hacker and Developer',
  description: 'My personal website, featuring a portfolio, a blog, and a contact form.',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='antialiased'>
      <head />
      <body>
        {children}
      </body>
    </html>
  )
}
