/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { APIProvider } from '@vis.gl/react-google-maps';

import Home from './pages/Home';
import ScholarProfile from './pages/ScholarProfile';
import MasjidProfile from './pages/MasjidProfile';
import MasjidPortal from './pages/MasjidPortal';
import KhateebPortal from './pages/KhateebPortal';
import Signup from './pages/Signup';
import PlatformAdmin from './pages/PlatformAdmin';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export default function App() {
  if (!hasValidKey) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'sans-serif', backgroundColor: '#111', color: '#eee'}}>
        <div style={{textAlign:'center',maxWidth:520, padding: 20}}>
          <h2 style={{color: '#D4AF37', marginBottom: 20}}>Google Maps API Key Required</h2>
          <p><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener" style={{color: '#88f'}}>Get an API Key</a></p>
          <p><strong>Step 2:</strong> Add your key as an environment variable:</p>
          <ul style={{textAlign:'left',lineHeight:'1.8'}}>
            <li><strong>In AI Studio:</strong> Open Settings (⚙️), go to Secrets, add <code>GOOGLE_MAPS_PLATFORM_KEY</code></li>
            <li><strong>In Vercel/Netlify:</strong> Go to your project settings, add <code>VITE_GOOGLE_MAPS_PLATFORM_KEY</code> to your environment variables, and trigger a redeploy.</li>
          </ul>
          <p style={{marginTop: 20, color: '#aaa'}}>The app rebuilds automatically after you add the secret.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scholar/:id" element={<ScholarProfile />} />
            <Route path="/masjid/:id" element={<MasjidProfile />} />
            <Route path="/masjid/portal" element={<MasjidPortal />} />
            <Route path="/khateeb/portal" element={<KhateebPortal />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/admin" element={<PlatformAdmin />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </APIProvider>
  );
}

