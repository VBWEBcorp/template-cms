import { SiteChrome } from '@/components/layout/site-chrome'

/** Ossature du site public : voir src/components/layout/site-chrome.tsx. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>
}
