import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import { useState } from 'react';
import IntroCutscene from '../components/auth/IntroCutscene';

export default function Login({
  loginIdentifier,
  setLoginIdentifier,
  loginPin,
  setLoginPin,
  loginError,
  onSubmit,
  onQuickFill,
  isSupabaseConfigured,
  const [showIntro, setShowIntro] = useState(true);

if (showIntro) {
  return (
    <IntroCutscene
      onFinish={() => setShowIntro(false)}
    />
  );
}
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/25 via-slate-950 to-slate-950 pointer-events-none" />

      <LoginForm
        loginIdentifier={loginIdentifier}
        setLoginIdentifier={setLoginIdentifier}
        loginPin={loginPin}
        setLoginPin={setLoginPin}
        loginError={loginError}
        onSubmit={onSubmit}
        onQuickFill={onQuickFill}
        isSupabaseConfigured={isSupabaseConfigured}
      />
    </div>
  );
}
