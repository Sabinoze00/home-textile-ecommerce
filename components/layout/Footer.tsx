import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Collapsible } from '@/components/ui/collapsible'
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  Truck,
  Award,
  Palette,
} from 'lucide-react'

const helpLinks = [
  { name: 'Contact Us', href: '/contact' },
  { name: 'Size Guide', href: '/size-guide' },
  { name: 'Care Instructions', href: '/care' },
  { name: 'Returns & Exchanges', href: '/returns' },
  { name: 'Shipping Info', href: '/shipping' },
  { name: 'FAQ', href: '/faq' },
]

const resourceLinks = [
  { name: 'Track Your Order', href: '/track' },
  { name: 'Gift Cards', href: '/gift-cards' },
  { name: 'Registry', href: '/registry' },
  { name: 'Loyalty Program', href: '/loyalty' },
  { name: 'Student Discount', href: '/student' },
  { name: 'Military Discount', href: '/military' },
]

const aboutLinks = [
  { name: 'Our Story', href: '/about' },
  { name: 'Sustainability', href: '/sustainability' },
  { name: 'Careers', href: '/careers' },
  { name: 'Store Locator', href: '/stores' },
  { name: 'Wholesale', href: '/wholesale' },
  { name: 'Affiliate Program', href: '/affiliate' },
]

const pressLinks = [
  { name: 'Press Releases', href: '/press' },
  { name: 'Media Kit', href: '/media-kit' },
  { name: 'Awards', href: '/awards' },
  { name: 'Partnerships', href: '/partnerships' },
]

const valueProps = [
  {
    icon: Phone,
    title: 'Customer Service',
    description: '24/7 support available',
  },
  {
    icon: Award,
    title: 'Quality Guarantee',
    description: 'Premium materials only',
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $75',
  },
  {
    icon: Palette,
    title: 'Personalization',
    description: 'Custom options available',
  },
]

export function Footer() {
  return (
    <footer className="bg-textile-cream">
      {/* Value Propositions */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {valueProps.map(prop => (
              <div key={prop.title} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <prop.icon className="h-8 w-8 text-textile-navy" />
                </div>
                <div>
                  <h3 className="font-semibold text-textile-navy">
                    {prop.title}
                  </h3>
                  <p className="text-sm text-gray-600">{prop.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md text-center">
            <Mail className="mx-auto mb-4 h-8 w-8 text-textile-navy" />
            <h3 className="mb-2 text-xl font-semibold text-textile-navy">
              Stay Cozy with Us
            </h3>
            <p className="mb-6 text-gray-600">
              Get the latest on new arrivals, sales, and exclusive offers.
            </p>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button variant="textile" className="px-6">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links - Mobile Collapsible, Desktop Regular */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Mobile view with collapsible sections */}
        <div className="block space-y-0 md:hidden">
          <Collapsible title="Help">
            <ul className="space-y-2">
              {helpLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-textile-navy"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Collapsible>

          <Collapsible title="Resources">
            <ul className="space-y-2">
              {resourceLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-textile-navy"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Collapsible>

          <Collapsible title="About">
            <ul className="space-y-2">
              {aboutLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-textile-navy"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Collapsible>

          <Collapsible title="In the Press">
            <ul className="space-y-2">
              {pressLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-textile-navy"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Collapsible>
        </div>

        {/* Desktop view with regular columns */}
        <div className="hidden grid-cols-4 gap-8 md:grid">
          {/* Help */}
          <div>
            <h3 className="mb-4 font-semibold text-textile-navy">Help</h3>
            <ul className="space-y-2">
              {helpLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-textile-navy"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 font-semibold text-textile-navy">Resources</h3>
            <ul className="space-y-2">
              {resourceLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-textile-navy"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="mb-4 font-semibold text-textile-navy">About</h3>
            <ul className="space-y-2">
              {aboutLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-textile-navy"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* In the Press */}
          <div>
            <h3 className="mb-4 font-semibold text-textile-navy">
              In the Press
            </h3>
            <ul className="space-y-2">
              {pressLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-textile-navy"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-600">
              © 2024 Cozy Home. All rights reserved.
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-gray-600 transition-colors hover:text-textile-navy"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-gray-600 transition-colors hover:text-textile-navy"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="#"
                className="text-gray-600 transition-colors hover:text-textile-navy"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-gray-600 transition-colors hover:text-textile-navy"
              >
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>

            {/* Legal Links */}
            <div className="flex space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-600 transition-colors hover:text-textile-navy"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 transition-colors hover:text-textile-navy"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
