"use client"
import React from 'react'

export default function Footer() {
  return (
      <footer className="bg-black text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} IKIGAI Travel Gear. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer> 
  )
}
