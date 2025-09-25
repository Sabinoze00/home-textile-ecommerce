'use client'

import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
} from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-600">
            Manage your store settings and preferences
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* General Settings */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center">
            <Settings className="mr-3 h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">General</h3>
          </div>
          <p className="mb-4 text-gray-600">
            Store name, description, and basic information
          </p>
          <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            Configure
          </button>
        </div>

        {/* User Management */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center">
            <User className="mr-3 h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Users & Roles
            </h3>
          </div>
          <p className="mb-4 text-gray-600">
            Manage admin users and permissions
          </p>
          <button className="w-full rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
            Manage Users
          </button>
        </div>

        {/* Notifications */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center">
            <Bell className="mr-3 h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
          </div>
          <p className="mb-4 text-gray-600">
            Email alerts and system notifications
          </p>
          <button className="w-full rounded-md bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700">
            Setup Alerts
          </button>
        </div>

        {/* Security */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center">
            <Shield className="mr-3 h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          </div>
          <p className="mb-4 text-gray-600">
            Authentication and security settings
          </p>
          <button className="w-full rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700">
            Security Settings
          </button>
        </div>

        {/* Database */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center">
            <Database className="mr-3 h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Database</h3>
          </div>
          <p className="mb-4 text-gray-600">Backup and database maintenance</p>
          <button className="w-full rounded-md bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700">
            Manage Database
          </button>
        </div>

        {/* Appearance */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center">
            <Palette className="mr-3 h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
          </div>
          <p className="mb-4 text-gray-600">Theme and branding customization</p>
          <button className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700">
            Customize Theme
          </button>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-center">
          <Globe className="mr-3 h-5 w-5 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              Settings Panel
            </h3>
            <p className="mt-1 text-blue-700">
              Full settings functionality is coming soon. This is a placeholder
              page to prevent 404 errors.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
