import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['tr', 'en'],
  defaultLocale: 'tr',
  pathnames: {
    '/': '/',
    '/auth/login': {
      tr: '/giris',
      en: '/login'
    },
    '/auth/register': {
      tr: '/kayit',
      en: '/register'
    },
    '/products': {
      tr: '/urunler',
      en: '/products'
    },
    '/cart': {
      tr: '/sepet',
      en: '/cart'
    },
    '/profile': {
      tr: '/profil',
      en: '/profile'
    },
  }
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
