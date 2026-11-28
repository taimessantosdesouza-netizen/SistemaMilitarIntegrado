import React, { useState } from 'react';
import IntroCutscene from '../components/auth/IntroCutscene';
import LoginForm from '../components/auth/LoginForm';

export default function Login({
  loginIdentifier,
  setLoginIdentifier,
  loginPin,
  setLoginPin,
  loginError,
  onSubmit,
  onQuickFill,
  isSupabaseConfigured,
}) {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return (
      <IntroCutscene
        onFinish={() => setShowIntro(false)}
      />
    );
  }
  // O return original continua aqui.
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
     <div className="absolute inset-0 pointer-events-none">
  <img
    src="/gvcr.png"
    alt=""
    className="w-full h-full object-cover opacity-40"
  />

  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-slate-950/80" />

  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
</div>
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
