'use client'; 

import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; 
import { ChatbotFloating } from '../components/ChatbotFloating'; 
import NotificationBell from '../components/NotificationBell'; 
import ProfileIcon from '../components/ProfileIcon'; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: { sub: string, exp: number } = jwtDecode(token);
        
        // Check if the token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          console.warn('Token expired. Clearing session.');
          localStorage.removeItem('access_token');
          setCurrentUserId('');
        } else {
          setCurrentUserId(decoded.sub); 
        }
      } catch (e) {
        console.error('Failed to decode token:', e);
        localStorage.removeItem('access_token');
      }
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <style>
          {`
            body {
              font-family: 'Inter', sans-serif;
            }
          `}
        </style>
      </head>
      <body>
        {/* Changed background from gray-950 to slate-950 for that tech feel */}
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 selection:bg-blue-500/30">
          
          <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-slate-800">
            <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center space-x-3">
                {/* Tech AI Node Logo */}
                <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/50 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  <a href="/" className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 hover:opacity-80 transition-opacity">
                    CivixConnect
                  </a>
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {currentUserId && (
                  <div className="flex items-center space-x-4 border-r border-slate-700 pr-4 mr-2">
                    <NotificationBell userId={currentUserId} />
                    <ProfileIcon />
                  </div>
                )}
                
                <nav>
                  <ul className="flex space-x-4 sm:space-x-6">
                    <li><a href="/about" className="text-slate-400 hover:text-cyan-400 transition-colors font-medium text-sm">About</a></li>
                    <li><a href="/services" className="text-slate-400 hover:text-cyan-400 transition-colors font-medium text-sm">Services</a></li>
                    <li><a href="/contact" className="text-slate-400 hover:text-cyan-400 transition-colors font-medium text-sm">Contact</a></li>
                  </ul>
                </nav>
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          
          {/* === Global Floating Chatbot Integration === */}
          <ChatbotFloating />
          
          <footer className="bg-slate-950 border-t border-slate-900 py-8 mt-auto z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
              <div className="mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} CivixConnect. Powered by Swavi AI.
              </div>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">Admin Portal</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}