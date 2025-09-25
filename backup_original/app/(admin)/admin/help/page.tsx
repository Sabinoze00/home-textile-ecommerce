'use client'

import {
  HelpCircle,
  Book,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  Search,
} from 'lucide-react'

export default function AdminHelpPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
          <p className="mt-1 text-gray-600">
            Find answers to your questions and get help
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Search for help articles, tutorials, or common issues..."
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Help Categories */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Documentation */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center">
            <Book className="mr-3 h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Documentation
            </h3>
          </div>
          <p className="mb-4 text-gray-600">
            Complete guides and tutorials for using the admin panel
          </p>
          <div className="space-y-2">
            <a
              href="#"
              className="block text-sm text-blue-600 hover:text-blue-700"
            >
              Getting Started Guide
            </a>
            <a
              href="#"
              className="block text-sm text-blue-600 hover:text-blue-700"
            >
              Product Management
            </a>
            <a
              href="#"
              className="block text-sm text-blue-600 hover:text-blue-700"
            >
              Order Processing
            </a>
            <a
              href="#"
              className="block text-sm text-blue-600 hover:text-blue-700"
            >
              Customer Management
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center">
            <HelpCircle className="mr-3 h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Frequently Asked
            </h3>
          </div>
          <p className="mb-4 text-gray-600">
            Common questions and their answers
          </p>
          <div className="space-y-2">
            <a
              href="#"
              className="block text-sm text-green-600 hover:text-green-700"
            >
              How to add new products?
            </a>
            <a
              href="#"
              className="block text-sm text-green-600 hover:text-green-700"
            >
              Managing inventory levels
            </a>
            <a
              href="#"
              className="block text-sm text-green-600 hover:text-green-700"
            >
              Processing refunds
            </a>
            <a
              href="#"
              className="block text-sm text-green-600 hover:text-green-700"
            >
              Setting up payment methods
            </a>
          </div>
        </div>

        {/* Live Chat */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center">
            <MessageCircle className="mr-3 h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Live Chat</h3>
          </div>
          <p className="mb-4 text-gray-600">
            Chat with our support team in real-time
          </p>
          <button className="w-full rounded-md bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700">
            Start Chat
          </button>
          <p className="mt-2 text-xs text-gray-500">
            Average response time: 2 minutes
          </p>
        </div>
      </div>

      {/* Contact Options */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Contact Support
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex items-center rounded-lg bg-gray-50 p-4">
            <Phone className="mr-3 h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">Phone Support</h4>
              <p className="text-gray-600">1-800-SUPPORT</p>
              <p className="text-xs text-gray-500">Mon-Fri 9am-6pm EST</p>
            </div>
          </div>
          <div className="flex items-center rounded-lg bg-gray-50 p-4">
            <Mail className="mr-3 h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-medium text-gray-900">Email Support</h4>
              <p className="text-gray-600">support@example.com</p>
              <p className="text-xs text-gray-500">Response within 24 hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Links
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <a
            href="#"
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <span className="text-sm">System Status</span>
          </a>
          <a
            href="#"
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <span className="text-sm">API Documentation</span>
          </a>
          <a
            href="#"
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <span className="text-sm">Video Tutorials</span>
          </a>
          <a
            href="#"
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <span className="text-sm">Community Forum</span>
          </a>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <div className="flex items-center">
          <HelpCircle className="mr-3 h-5 w-5 text-yellow-600" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-900">
              Help System
            </h3>
            <p className="mt-1 text-yellow-700">
              Full help and support functionality is coming soon. This is a
              placeholder page to prevent 404 errors.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
