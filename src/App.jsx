import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Shield, Lock, LogOut, Radio, Users, Car, FileText, AlertTriangle,
  CheckCircle2, Clock, Search, Plus, Copy, Check, Award,
  UserCheck, KeyRound, Scale, Megaphone, Database,
  Activity, ShieldAlert, Folder, FolderOpen, Trash2, ChevronDown, ChevronUp,
  Bell, X, Volume2
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const INITIAL_OFFICERS = [
  { id: '1', badge_number: 'PM-001', roblox_nick: 'Felipe', rp_name: 'Cmdt. Felipe', rank_level: 5, rank_name: 'Comandante-Geral', pin_code: '2026', status: 'Ativo', warnings: 0 },
  { id: '2', badge_number: 'PM-002', roblox_nick: 'Tsantos', rp_name: 'Subcmdt. T. Santos', rank_level: 4, rank_name: 'Subcomandante', pin_code: '1900', status: 'Ativo', warnings: 0 },
  { id: '3', badge_number: 'PM-003', roblox_nick: 'lucero', rp_name: 'Sup. Lucero', rank_level: 3, rank_name: 'Supervisor Operacional', pin_code: '1903', status: 'Ativo', warnings: 0 },
  { id: '4', badge_number: 'PM-004', roblox_nick: 'krussttelles', rp_name: 'Sd. Krussttelles', rank_level: 2, rank_name: 'Policial Militar', pin_code: '1234', status: 'Ativo', warnings: 0 },
  { id: '5', badge_number: 'PM-005', roblox_nick: 'Krustelles_22', rp_name: 'Sd. Krustelles', rank_level: 2, rank_name: 'Policial Militar', pin_code: '1234', status: 'Ativo', warnings: 0 },
  { id: '6', badge_number: 'PM-006', roblox_nick: 'wyzontheradar', rp_name: 'Rec. Corrêa', rank_level: 1, rank_name: 'Recruta', pin_code: '0000', status: 'Em Formação', warnings: 0 },
];

const INITIAL_DUTY_LOGS = [
  {
    id: 'd1',
    officer_id: '4',
    officer_nick: 'krussttelles',
    officer_rp_name: 'Sd. Krussttelles',
    officer_rank: 'Policial Militar',
    badge_number: 'PM-004',
    vtr_prefix: 'Caracterizada',
    patrol_area: 'GV e Horton',
    started_at: '2026-11-21T20:15:00-03:00',
    ended_at: '2026-11-21T22:50:00-03:00',
    duration_seconds: 9300,
    status: 'ENCERRADO',
    summary_notes: 'Perseguição atendida e troca de tiros em abordagem.'
  },
  {
    id: 'd2',
    officer_id: '3',
    officer_nick: 'lucero',
    officer_rp_name: 'Sup. Lucero',
    officer_rank: 'Supervisor Operacional',
    badge_number: 'PM-003',
    vtr_prefix: 'VTR-02 Tática',
    patrol_area: 'Túnel de Brookmere',
    started_at: '2026-11-24T08:05:00-03:00',
    ended_at: '2026-11-24T09:18:00-03:00',
    duration_seconds: 4380,
    status: 'ENCERRADO',
    summary_notes: 'Prisão de detentos em fuga no Túnel de Brookmere (Código 3).'
  }
];

const INITIAL_CITIZENS = [
  {
    id: 'c1',
    passport: 'PTN-1001',
    rp_name: 'Nickolas Silva',
    roblox_nick: 'nick',
    phone: '555-0142',
    cnh_status: 'Suspensa',
    gun_license: false,
    wanted_status: 'Preso',
    criminal_records: [
      { date: '24/11/2026', crime: 'Fuga em alta velocidade (Túnel de Brookmere) - Código 3', officer: '@lucero' }
    ]
  },
  {
    id: 'c2',
    passport: 'PTN-1002',
    rp_name: 'Marcus Vance',
    roblox_nick: 'mvance_rp',
    phone: '555-0198',
    cnh_status: 'Válida',
    gun_license: false,
    wanted_status: 'Procurado',
    criminal_records: [
      { date: '21/11/2026', crime: 'Troca de tiros em abordagem / Homicídio de Oficial (GV)', officer: '@krussttelles' }
    ]
  },
  {
    id: 'c3',
    passport: 'PTN-1003',
    rp_name: 'Arthur Pendelton',
    roblox_nick: 'arthur_p',
    phone: '555-0111',
    cnh_status: 'Válida',
    gun_license: true,
    wanted_status: 'Limpo',
    criminal_records: []
  }
];

const INITIAL_VEHICLES = [
  { id: 'v1', plate: 'PTN-9X88', model: 'Dodge Charger SRT', color: 'Preto Fosco', owner_name: 'Marcus Vance', owner_passport: 'PTN-1002', status: 'Roubado/Furtado', notes: 'Envolvido em perseguição na região de GV e Horton' },
  { id: 'v2', plate: 'PTN-4A21', model: 'BMW M3 Competition', color: 'Branco Alpino', owner_name: 'Arthur Pendelton', owner_passport: 'PTN-1003', status: 'Regular', notes: 'Documentação em dia' },
  { id: 'v3', plate: 'PTN-7712', model: 'Chevrolet Tahoe', color: 'Cinza Chumbo', owner_name: 'Nickolas Silva', owner_passport: 'PTN-1001', status: 'Apreendido', notes: 'Recolhido após ocorrência no Túnel de Brookmere' },
];

const INITIAL_REPORTS = [
  {
    id: 'r1',
    report_type: 'OCORRENCIA',
    author_nick: 'lucero',
    author_rank: 'Supervisor Operacional',
    vtr_prefix: 'VTR-02',
    location: 'Túnel de Brookmere',
    incident_code: 'Código 3',
    involved_officers: '@Krustelles_22 @wyzontheradar',
    involved_citizens: 'nick (PTN-1001)',
    description: 'Detentos correndo em alta velocidade indo para o túnel em tentativa de fuga, sendo interceptados e detidos pela guarnição.',
    actions_taken: 'Cerco tático e algemação',
    outcome: 'Preso',
    review_status: 'APROVADO',
    reviewed_by: 'Felipe',
    reviewer_rank: 'Comandante-Geral',
    review_notes: 'Relatório claro e condizente com o registro de turno.',
    reviewed_at: '2026-11-24T09:45:00-03:00',
    created_at: '2026-11-24T09:18:00-03:00'
  }
];

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'a1',
    title: 'PARAMETRIZAÇÃO — RECRUTA CORRÊA',
    category: 'PARAMETRIZACAO',
    content: 'O candidato Corrêa (@wyzontheradar) obteve a nota 9,1/10, demonstrando excelente desempenho no processo seletivo, respeito à hierarquia e conhecimento institucional. Bem-vindo à corporação!',
    author_nick: 'Felipe',
    created_at: '2026-11-24T00:31:00-03:00'
  }
];

const PENAL_ARTICLES = [
  { id: 'art1', code: 'Art. 121', name: 'Homicídio / Tentativa contra Oficial PM', months: 60, fine: 25000, bail: false },
  { id: 'art2', code: 'Art. 157', name: 'Roubo a Mão Armada / Latrocínio', months: 40, fine: 15000, bail: false },
  { id: 'art3', code: 'Art. 329', name: 'Resistência / Desobediência à Ordem Policial', months: 15, fine: 4000, bail: true },
  { id: 'art4', code: 'Art. 330', name: 'Fuga em Alta Velocidade / Direção Perigosa', months: 20, fine: 6500, bail: true },
  { id: 'art5', code: 'Art. 14', name: 'Porte Ilegal de Armamento Restrito', months: 30, fine: 12000, bail: false },
  { id: 'art6', code: 'Art. 180', name: 'Receptação / Condução de Veículo Roubado', months: 20, fine: 5000, bail: true },
];

const RANKS = [
  { level: 5, name: 'Comandante-Geral', desc: 'Autoridade máxima da Polícia Militar, responsável pelo comando e decisões gerais da Instituição.' },
  { level: 4, name: 'Subcomandante', desc: 'Auxilia o Comandante-Geral e acompanha a administração e organização da corporação.' },
  { level: 3, name: 'Supervisor Operacional', desc: 'Responsável por acompanhar e organizar as atividades operacionais dos policiais.' },
  { level: 2, name: 'Policial Militar', desc: 'Integrante efetivo responsável pelas atividades de policiamento e serviços operacionais no RP.' },
  { level: 1, name: 'Recruta', desc: 'Integrante em fase de formação e avaliação para ingresso efetivo na corporação.' },
];

function formatDateTime(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatDuration(seconds) {
  const sec = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sigp_pantanoria_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');

  const [officers, setOfficers] = useState(INITIAL_OFFICERS);
  const [dutyLogs, setDutyLogs] = useState(INITIAL_DUTY_LOGS);
  const [citizens, setCitizens] = useState(INITIAL_CITIZENS);
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);

  const [activeTab, setActiveTab] = useState('operacional');
  const [globalSearch, setGlobalSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const [reportToasts, setReportToasts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const notifiedReportIdsRef = useRef(new Set(INITIAL_REPORTS.map((r) => r.id)));
  const audioCtxRef = useRef(null);
  const currentUserRef = useRef(currentUser);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const unlockAudioContext = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const onFirstInteraction = () => {
      unlockAudioContext();
    };
    window.addEventListener('pointerdown', onFirstInteraction, { passive: true });
    window.addEventListener('keydown', onFirstInteraction, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };
  }, [unlockAudioContext]);

  const playNotificationSound = useCallback(async () => {
    if (!soundEnabledRef.current) return;
    const ctx = unlockAudioContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const now = ctx.currentTime;
      const notes = [880, 1174.66];

      notes.forEach((freq, idx) => {
        const startAt = now + idx * 0.18;
        const duration = 0.22;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startAt);

        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.linearRampToValueAtTime(0.35, startAt + 0.02);
        gain.gain.setValueAtTime(0.35, startAt + duration - 0.05);
        gain.gain.linearRampToValueAtTime(0.0001, startAt + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startAt);
        osc.stop(startAt + duration + 0.02);
      });
    } catch (err) {
      console.warn('Não foi possível reproduzir o som da notificação:', err);
    }
  }, [unlockAudioContext]);

  const triggerReportNotification = useCallback(
    (rep) => {
      if (!rep || !rep.id) return;
      if (notifiedReportIdsRef.current.has(rep.id)) return;
      notifiedReportIdsRef.current.add(rep.id);

      const user = currentUserRef.current;
      if (!user || user.rank_level < 4) return;

      const toastId = `${rep.id}-${Date.now()}`;
      const newToast = {
        toastId,
        reportId: rep.id,
        author_nick: rep.author_nick,
        author_rank: rep.author_rank,
        location: rep.location || 'Local não informado',
        incident_code: rep.incident_code || 'Código 1',
        outcome: rep.outcome || 'Registrado',
        created_at: rep.created_at || new Date().toISOString()
      };

      setReportToasts((prev) => [newToast, ...prev].slice(0, 4));
      playNotificationSound();

      setTimeout(() => {
        setReportToasts((prev) => prev.filter((t) => t.toastId !== toastId));
      }, 10000);
    },
    [playNotificationSound]
  );

  const dismissToast = (toastId) => {
    setReportToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  };

  const openReportFromToast = (toast) => {
    dismissToast(toast.toastId);
    setActiveTab('comando');
    setCmdReportsFolderOpen(true);
    setCmdReportFilterStatus('PENDENTE');
  };

  const [vtrPrefix, setVtrPrefix] = useState('Caracterizada');
  const [patrolArea, setPatrolArea] = useState('GV e Horton');
  const [shiftSummary, setShiftSummary] = useState('');
  const [nowTick, setNowTick] = useState(Date.now());

  const [citizenSearch, setCitizenSearch] = useState('');
  const [newCitizen, setNewCitizen] = useState({ passport: '', rp_name: '', roblox_nick: '', phone: '', cnh_status: 'Válida', gun_license: false, wanted_status: 'Limpo' });
  const [crimeInput, setCrimeInput] = useState({});

  const [vehicleSearch, setVehicleSearch] = useState('');
  const [newVehicle, setNewVehicle] = useState({ plate: '', model: '', color: '', owner_name: '', owner_passport: '', status: 'Regular', notes: '' });

  const [newReport, setNewReport] = useState({
    report_type: 'OCORRENCIA',
    vtr_prefix: 'VTR-01',
    location: 'Túnel de Brookmere',
    incident_code: 'Código 3',
    involved_officers: '',
    involved_citizens: '',
    description: '',
    actions_taken: 'Abordagem e algemação',
    outcome: 'Preso'
  });
  const [reviewNotesMap, setReviewNotesMap] = useState({});
  const [reportFilterStatus, setReportFilterStatus] = useState('TODOS');
  const [cmdReportsFolderOpen, setCmdReportsFolderOpen] = useState(false);
  const [cmdReportFilterStatus, setCmdReportFilterStatus] = useState('PENDENTE');
  const [cmdReviewNotesMap, setCmdReviewNotesMap] = useState({});

  const [dutyFilterOfficer, setDutyFilterOfficer] = useState('TODOS');
  const [dutyFilterStatus, setDutyFilterStatus] = useState('TODOS');
  const [newOfficer, setNewOfficer] = useState({
    badge_number: '',
    roblox_nick: '',
    rp_name: '',
    rank_level: 1,
    pin_code: '1234',
    status: 'Em Formação'
  });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    category: 'COMUNICADO',
    content: ''
  });

  const [selectedArticles, setSelectedArticles] = useState([]);

  const isHighCommand = currentUser && currentUser.rank_level >= 3;
  const isTopCommand = currentUser && currentUser.rank_level >= 4;
  const isHighRank = currentUser && currentUser.rank_level >= 4;

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const syncReportsLive = useCallback(async (shouldNotifyNew = false) => {
    if (!isSupabaseConfigured || !supabase) return;
    const { data, error } = await supabase
      .from('pm_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return;

    if (shouldNotifyNew) {
      const unseen = data.filter((r) => !notifiedReportIdsRef.current.has(r.id));
      unseen.forEach((r) => triggerReportNotification(r));
    } else {
      data.forEach((r) => notifiedReportIdsRef.current.add(r.id));
    }

    setReports(data);
  }, [triggerReportNotification]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    (async () => {
      try {
        const [offRes, dutyRes, citRes, vehRes, annRes] = await Promise.all([
          supabase.from('pm_officers').select('*').order('rank_level', { ascending: false }),
          supabase.from('pm_duty_logs').select('*').order('started_at', { ascending: false }),
          supabase.from('pm_citizens').select('*').order('created_at', { ascending: false }),
          supabase.from('pm_vehicles').select('*').order('created_at', { ascending: false }),
          supabase.from('pm_announcements').select('*').order('created_at', { ascending: false }),
        ]);
        if (offRes.data && offRes.data.length > 0) setOfficers(offRes.data);
        if (dutyRes.data) setDutyLogs(dutyRes.data);
        if (citRes.data) setCitizens(citRes.data);
        if (vehRes.data) setVehicles(vehRes.data);
        if (annRes.data) setAnnouncements(annRes.data);
        await syncReportsLive(false);
      } catch (err) {
        console.error('Erro ao sincronizar com Supabase:', err);
      }
    })();

    const channel = supabase
      .channel('pm_reports_realtime_alerts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pm_reports' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const inserted = payload.new;
            setReports((prev) => {
              if (prev.some((r) => r.id === inserted.id)) return prev;
              return [inserted, ...prev];
            });
            triggerReportNotification(inserted);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setReports((prev) =>
              prev.map((r) => (r.id === payload.new.id ? payload.new : r))
            );
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setReports((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncReportsLive(true);
      }
    }, 3500);

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [syncReportsLive, triggerReportNotification]);

  const activeShift = useMemo(() => {
    if (!currentUser) return null;
    return dutyLogs.find(
      (log) =>
        (log.officer_id === currentUser.id || log.officer_nick.toLowerCase() === currentUser.roblox_nick.toLowerCase()) &&
        log.status === 'EM_SERVICO'
    );
  }, [dutyLogs, currentUser]);

  const activeShiftsAll = useMemo(
    () => dutyLogs.filter((d) => d.status === 'EM_SERVICO'),
    [dutyLogs]
  );

  const handleLogin = (e) => {
    e.preventDefault();
    unlockAudioContext();
    setLoginError('');
    const term = loginIdentifier.trim().toLowerCase();
    const found = officers.find(
      (o) =>
        o.roblox_nick.toLowerCase() === term ||
        o.badge_number.toLowerCase() === term ||
        o.rp_name.toLowerCase() === term
    );

    if (!found) {
      setLoginError('Matrícula ou Nick Roblox não encontrado no efetivo da PM.');
      return;
    }
    if (found.status === 'Suspenso' || found.status === 'Exonerado') {
      setLoginError(`Acesso bloqueado: Situação funcional atual é "${found.status}". Procure o Alto Comando.`);
      return;
    }
    if (found.pin_code !== loginPin.trim()) {
      setLoginError('Senha / PIN funcional incorreto.');
      return;
    }

    setCurrentUser(found);
    localStorage.setItem('sigp_pantanoria_user', JSON.stringify(found));
    setActiveTab(found.rank_level >= 3 ? 'comando' : 'operacional');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sigp_pantanoria_user');
    setLoginPin('');
  };

  const handleStartShift = async () => {
    if (!currentUser || activeShift) return;
    const newLog = {
      id: crypto.randomUUID(),
      officer_id: currentUser.id,
      officer_nick: currentUser.roblox_nick,
      officer_rp_name: currentUser.rp_name,
      officer_rank: currentUser.rank_name,
      badge_number: currentUser.badge_number,
      vtr_prefix: vtrPrefix,
      patrol_area: patrolArea,
      started_at: new Date().toISOString(),
      ended_at: null,
      duration_seconds: 0,
      status: 'EM_SERVICO',
      summary_notes: ''
    };

    setDutyLogs((prev) => [newLog, ...prev]);

    if (isSupabaseConfigured && supabase) {
      const { id, ...payload } = newLog;
      const { data } = await supabase.from('pm_duty_logs').insert([payload]).select().single();
      if (data) {
        setDutyLogs((prev) => prev.map((item) => (item.id === newLog.id ? data : item)));
      }
    }
  };

  const handleEndShift = async () => {
    if (!activeShift) return;
    const endedAt = new Date().toISOString();
    const durationSec = Math.max(
      1,
      Math.floor((new Date(endedAt).getTime() - new Date(activeShift.started_at).getTime()) / 1000)
    );

    const updated = {
      ...activeShift,
      ended_at: endedAt,
      duration_seconds: durationSec,
      status: 'ENCERRADO',
      summary_notes: shiftSummary || 'Patrulhamento concluído sem alterações extraordinárias.'
    };

    setDutyLogs((prev) => prev.map((item) => (item.id === activeShift.id ? updated : item)));
    setShiftSummary('');

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('pm_duty_logs')
        .update({
          ended_at: updated.ended_at,
          duration_seconds: updated.duration_seconds,
          status: 'ENCERRADO',
          summary_notes: updated.summary_notes
        })
        .eq('id', activeShift.id);
    }
  };

  const handleAddCitizen = async (e) => {
    e.preventDefault();
    if (!newCitizen.passport || !newCitizen.rp_name) return;
    const payload = {
      ...newCitizen,
      passport: newCitizen.passport.toUpperCase(),
      criminal_records: []
    };
    const localItem = { id: crypto.randomUUID(), ...payload };
    setCitizens((prev) => [localItem, ...prev]);
    setNewCitizen({ passport: '', rp_name: '', roblox_nick: '', phone: '', cnh_status: 'Válida', gun_license: false, wanted_status: 'Limpo' });

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('pm_citizens').insert([payload]).select().single();
      if (data) setCitizens((prev) => prev.map((c) => (c.id === localItem.id ? data : c)));
    }
  };

  const handleUpdateCitizenStatus = async (citizen, newStatus) => {
    setCitizens((prev) => prev.map((c) => (c.id === citizen.id ? { ...c, wanted_status: newStatus } : c)));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('pm_citizens').update({ wanted_status: newStatus }).eq('id', citizen.id);
    }
  };

  const handleAddCrimeRecord = async (citizen) => {
    const crimeText = (crimeInput[citizen.id] || '').trim();
    if (!crimeText) return;
    const newRecord = {
      date: new Date().toLocaleDateString('pt-BR'),
      crime: crimeText,
      officer: `@${currentUser.roblox_nick}`
    };
    const updatedRecords = [newRecord, ...(citizen.criminal_records || [])];
    setCitizens((prev) =>
      prev.map((c) => (c.id === citizen.id ? { ...c, criminal_records: updatedRecords } : c))
    );
    setCrimeInput((prev) => ({ ...prev, [citizen.id]: '' }));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('pm_citizens').update({ criminal_records: updatedRecords }).eq('id', citizen.id);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newVehicle.plate || !newVehicle.model) return;
    const payload = { ...newVehicle, plate: newVehicle.plate.toUpperCase() };
    const localItem = { id: crypto.randomUUID(), ...payload };
    setVehicles((prev) => [localItem, ...prev]);
    setNewVehicle({ plate: '', model: '', color: '', owner_name: '', owner_passport: '', status: 'Regular', notes: '' });

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('pm_vehicles').insert([payload]).select().single();
      if (data) setVehicles((prev) => prev.map((v) => (v.id === localItem.id ? data : v)));
    }
  };

  const handleUpdateVehicleStatus = async (vehicle, status) => {
    setVehicles((prev) => prev.map((v) => (v.id === vehicle.id ? { ...v, status } : v)));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('pm_vehicles').update({ status }).eq('id', vehicle.id);
    }
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    unlockAudioContext();
    if (!newReport.description.trim()) return;
    const payload = {
      ...newReport,
      author_nick: currentUser.roblox_nick,
      author_rank: currentUser.rank_name,
      review_status: 'PENDENTE',
      reviewed_by: null,
      reviewer_rank: null,
      review_notes: '',
      reviewed_at: null,
      created_at: new Date().toISOString()
    };
    const localItem = { id: crypto.randomUUID(), ...payload };
    notifiedReportIdsRef.current.add(localItem.id);
    setReports((prev) => [localItem, ...prev]);
    setNewReport({
      report_type: 'OCORRENCIA',
      vtr_prefix: 'VTR-01',
      location: 'Túnel de Brookmere',
      incident_code: 'Código 3',
      involved_officers: '',
      involved_citizens: '',
      description: '',
      actions_taken: 'Abordagem e algemação',
      outcome: 'Preso'
    });

    let finalReport = localItem;
    if (isSupabaseConfigured && supabase) {
      const { id, ...dbPayload } = localItem;
      const { data } = await supabase.from('pm_reports').insert([dbPayload]).select().single();
      if (data) {
        notifiedReportIdsRef.current.add(data.id);
        finalReport = data;
        setReports((prev) => prev.map((r) => (r.id === localItem.id ? data : r)));
      }
    }

    if (isHighRank) {
      const toastId = `${finalReport.id}-${Date.now()}`;
      setReportToasts((prev) => [
        {
          toastId,
          reportId: finalReport.id,
          author_nick: finalReport.author_nick,
          author_rank: finalReport.author_rank,
          location: finalReport.location || 'Local não informado',
          incident_code: finalReport.incident_code || 'Código 1',
          outcome: finalReport.outcome || 'Registrado',
          created_at: finalReport.created_at
        },
        ...prev
      ].slice(0, 4));
      await playNotificationSound();
      setTimeout(() => {
        setReportToasts((prev) => prev.filter((t) => t.toastId !== toastId));
      }, 10000);
    }
  };

  const handleReviewReport = async (report, decision, customNotes) => {
    if (!isHighRank) return;
    const rawNote = customNotes !== undefined ? customNotes : reviewNotesMap[report.id];
    const notes = (rawNote || '').trim();
    const reviewedAt = new Date().toISOString();

    const updatedFields = {
      review_status: decision,
      reviewed_by: currentUser.roblox_nick,
      reviewer_rank: currentUser.rank_name,
      review_notes:
        notes ||
        (decision === 'APROVADO'
          ? 'Aprovado pelo Comando.'
          : 'Reprovado pelo Comando. Revisar informações.'),
      reviewed_at: reviewedAt
    };

    setReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, ...updatedFields } : r))
    );

    if (isSupabaseConfigured && supabase) {
      await supabase.from('pm_reports').update(updatedFields).eq('id', report.id);
    }
  };

  const handleDeleteReport = async (report) => {
    const isAuthor =
      currentUser &&
      report.author_nick.toLowerCase() === currentUser.roblox_nick.toLowerCase();
    if (!isHighRank && !isAuthor) return;

    const confirmed = window.confirm(
      `Apagar permanentemente o relatório de @${report.author_nick} em "${report.location}"?`
    );
    if (!confirmed) return;

    setReports((prev) => prev.filter((r) => r.id !== report.id));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('pm_reports').delete().eq('id', report.id);
    }
  };

  const copyDiscordFormat = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const formatReportForDiscord = (r) => {
    const statusLabel = r.review_status || 'PENDENTE';
    const parecerLinha = r.reviewed_by
      ? `\n• **Parecer (${statusLabel} por @${r.reviewed_by}):** ${r.review_notes || 'Sem observações'}`
      : `\n• **Status Comando:** ${statusLabel}`;

    return `🚓 **RELATÓRIO PÓS-OCORRÊNCIA — POLÍCIA MILITAR DE PANTANÓRIA**
• **Responsável:** @${r.author_nick}
• **Patente:** @${r.author_rank}
• **Data e horário:** ${formatDateTime(r.created_at)}
• **Local da ocorrência:** ${r.location || 'Não informado'}
• **Viatura:** ${r.vtr_prefix || 'Caracterizada'}
• **Policiais envolvidos:** ${r.involved_officers || 'Nenhum'}

**INFORMAÇÕES DA OCORRÊNCIA**
• **Tipo de ocorrência:** ${r.incident_code || 'Código 1'}
• **Pessoas envolvidas:** ${r.involved_citizens || 'Não identificado'}
• **Descrição resumida:** ${r.description}
• **Providências tomadas:** ${r.actions_taken || 'Nenhuma'}
• **Resultado final:** ${r.outcome || 'Concluído'}${parecerLinha}

**Assinatura do responsável:** ${r.author_nick}`;
  };

  const formatDutyForDiscord = (d) => {
    return `🚓 **SERVIÇO OPERACIONAL — POLÍCIA MILITAR DE PANTANÓRIA**
• **Responsável:** @${d.officer_nick} (${d.badge_number})
• **Patente:** @${d.officer_rank}
• **Início do Turno:** ${formatDateTime(d.started_at)}
• **Término do Turno:** ${d.ended_at ? formatDateTime(d.ended_at) : 'EM ANDAMENTO'}
• **Tempo Patrulhado:** ${formatDuration(d.duration_seconds)}
• **Prefixo da VTR:** ${d.vtr_prefix}
• **Área de Patrulhamento:** ${d.patrol_area || 'GV e Horton'}

**RESUMO DO SERVIÇO**
• **Observações:** ${d.summary_notes || 'Sem alterações'}
• **Assinatura do responsável:** ${d.officer_nick}`;
  };

  const handleAddOfficer = async (e) => {
    e.preventDefault();
    if (!isHighCommand || !newOfficer.badge_number || !newOfficer.roblox_nick) return;
    const rankObj = RANKS.find((r) => r.level === Number(newOfficer.rank_level)) || RANKS[4];
    const payload = {
      badge_number: newOfficer.badge_number.toUpperCase(),
      roblox_nick: newOfficer.roblox_nick.trim(),
      rp_name: newOfficer.rp_name.trim() || newOfficer.roblox_nick.trim(),
      rank_level: rankObj.level,
      rank_name: rankObj.name,
      pin_code: newOfficer.pin_code || '1234',
      status: newOfficer.status,
      warnings: 0
    };
    const localItem = { id: crypto.randomUUID(), ...payload };
    setOfficers((prev) => [...prev, localItem].sort((a, b) => b.rank_level - a.rank_level));
    setNewOfficer({ badge_number: '', roblox_nick: '', rp_name: '', rank_level: 1, pin_code: '1234', status: 'Em Formação' });

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('pm_officers').insert([payload]).select().single();
      if (data) setOfficers((prev) => prev.map((o) => (o.id === localItem.id ? data : o)));
    }
  };

  const handleChangeOfficerRank = async (officer, delta) => {
    if (!isTopCommand) return;
    const nextLevel = Math.min(5, Math.max(1, officer.rank_level + delta));
    const rankObj = RANKS.find((r) => r.level === nextLevel);
    if (!rankObj) return;

    setOfficers((prev) =>
      prev
        .map((o) => (o.id === officer.id ? { ...o, rank_level: nextLevel, rank_name: rankObj.name } : o))
        .sort((a, b) => b.rank_level - a.rank_level)
    );

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('pm_officers')
        .update({ rank_level: nextLevel, rank_name: rankObj.name })
        .eq('id', officer.id);
    }
  };

  const handleToggleOfficerWarning = async (officer, delta) => {
    if (!isHighCommand) return;
    const nextWarnings = Math.max(0, (officer.warnings || 0) + delta);
    setOfficers((prev) => prev.map((o) => (o.id === officer.id ? { ...o, warnings: nextWarnings } : o)));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('pm_officers').update({ warnings: nextWarnings }).eq('id', officer.id);
    }
  };

  const handleUpdateOfficerStatus = async (officer, status) => {
    if (!isTopCommand) return;
    setOfficers((prev) => prev.map((o) => (o.id === officer.id ? { ...o, status } : o)));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('pm_officers').update({ status }).eq('id', officer.id);
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!isHighCommand || !newAnnouncement.title || !newAnnouncement.content) return;
    const payload = {
      ...newAnnouncement,
      author_nick: currentUser.roblox_nick,
      created_at: new Date().toISOString()
    };
    const localItem = { id: crypto.randomUUID(), ...payload };
    setAnnouncements((prev) => [localItem, ...prev]);
    setNewAnnouncement({ title: '', category: 'COMUNICADO', content: '' });

    if (isSupabaseConfigured && supabase) {
      const { id, ...dbPayload } = localItem;
      const { data } = await supabase.from('pm_announcements').insert([dbPayload]).select().single();
      if (data) setAnnouncements((prev) => prev.map((a) => (a.id === localItem.id ? data : a)));
    }
  };

  const filteredCitizens = useMemo(() => {
    const q = (globalSearch || citizenSearch).toLowerCase().trim();
    if (!q) return citizens;
    return citizens.filter(
      (c) =>
        c.rp_name.toLowerCase().includes(q) ||
        c.passport.toLowerCase().includes(q) ||
        c.roblox_nick.toLowerCase().includes(q)
    );
  }, [citizens, citizenSearch, globalSearch]);

  const filteredVehicles = useMemo(() => {
    const q = (globalSearch || vehicleSearch).toLowerCase().trim();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.plate.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.owner_name.toLowerCase().includes(q) ||
        v.owner_passport.toLowerCase().includes(q)
    );
  }, [vehicles, vehicleSearch, globalSearch]);

  const filteredDutyLogs = useMemo(() => {
    return dutyLogs.filter((log) => {
      if (dutyFilterOfficer !== 'TODOS' && log.officer_nick !== dutyFilterOfficer) return false;
      if (dutyFilterStatus !== 'TODOS' && log.status !== dutyFilterStatus) return false;
      return true;
    });
  }, [dutyLogs, dutyFilterOfficer, dutyFilterStatus]);

  const penalTotals = useMemo(() => {
    const chosen = PENAL_ARTICLES.filter((a) => selectedArticles.includes(a.id));
    return {
      months: chosen.reduce((acc, a) => acc + a.months, 0),
      fine: chosen.reduce((acc, a) => acc + a.fine, 0),
      bailAllowed: chosen.length > 0 && chosen.every((a) => a.bail)
    };
  }, [selectedArticles]);

  const pendingReportsCount = useMemo(
    () => reports.filter((r) => (r.review_status || 'PENDENTE') === 'PENDENTE').length,
    [reports]
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/25 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="w-full max-w-md z-10">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-md">
            <div className="mb-6 p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="font-mono font-bold text-slate-200">
                  {isSupabaseConfigured ? 'REDE CENTRAL ONLINE' : 'MODO LOCAL'}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-slate-400">
                <span className="text-blue-400 font-semibold">
                  {activeShiftsAll.length} {activeShiftsAll.length === 1 ? 'VTR em QAP' : 'VTRs em QAP'}
                </span>
                <span>•</span>
                <span>
                  {new Date(nowTick).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mb-4 shadow-lg shadow-blue-950/50">
                <Shield className="w-9 h-9 text-blue-400" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
                Estado de Pantanória • Acesso Restrito
              </span>
              <h1 className="text-2xl font-extrabold text-white mt-1">
                SIGP — Terminal Policial
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Identifique-se com sua Matrícula ou Nick para liberar suas permissões de patente.
              </p>
            </div>

            {!isSupabaseConfigured && (
              <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <Database className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Modo demonstração ativo. Conecte suas chaves do <strong>Supabase</strong> na Vercel para persistência global.
                </span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Matrícula Funcional ou Nick Roblox
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Felipe, PM-001 ou krussttelles"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Senha / PIN de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
              >
                <KeyRound className="w-4 h-4" />
                Autenticar no Sistema PM
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2.5 text-center">
                Acesso Rápido por Patente (Clique para preencher)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setLoginIdentifier('Felipe'); setLoginPin('2026'); }}
                  className="text-left p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition"
                >
                  <div className="text-xs font-bold text-amber-300">Cmdt. Felipe</div>
                  <div className="text-[10px] text-slate-400">Comandante-Geral (Nível 5)</div>
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginIdentifier('Tsantos'); setLoginPin('1900'); }}
                  className="text-left p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition"
                >
                  <div className="text-xs font-bold text-amber-300">Subcmdt. Tsantos</div>
                  <div className="text-[10px] text-slate-400">Subcomandante (Nível 4)</div>
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginIdentifier('krussttelles'); setLoginPin('1234'); }}
                  className="text-left p-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700 transition"
                >
                  <div className="text-xs font-bold text-slate-200">Sd. krussttelles</div>
                  <div className="text-[10px] text-slate-400">Policial Militar (Nível 2)</div>
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginIdentifier('wyzontheradar'); setLoginPin('0000'); }}
                  className="text-left p-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700 transition"
                >
                  <div className="text-xs font-bold text-slate-200">Rec. Corrêa</div>
                  <div className="text-[10px] text-slate-400">Recruta (Nível 1)</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const elapsedSeconds = activeShift
    ? Math.floor((nowTick - new Date(activeShift.started_at).getTime()) / 1000)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-tight">PM PANTANÓRIA</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  SIGP v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Operador: <strong className="text-slate-200">{currentUser.rp_name}</strong> (@{currentUser.roblox_nick}) •{' '}
                <span className={isHighCommand ? 'text-amber-400 font-semibold' : 'text-blue-400'}>
                  {currentUser.rank_name}
                </span>
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-md min-w-[220px]">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Busca rápida: Placa (PTN-...), Passaporte ou Nick..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeShift ? (
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-300">
                  EM SERVIÇO • {formatDuration(elapsedSeconds)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="text-xs font-mono text-slate-400">FORA DE SERVIÇO</span>
              </div>
            )}

            {isHighRank && (
              <button
                type="button"
                onClick={async () => {
                  unlockAudioContext();
                  if (!soundEnabled) {
                    setSoundEnabled(true);
                    soundEnabledRef.current = true;
                    await playNotificationSound();
                  } else {
                    await playNotificationSound();
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSoundEnabled((prev) => !prev);
                }}
                title="Clique para testar o som (botão direito liga/desliga)"
                className={`p-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1 ${
                  soundEnabled
                    ? 'bg-amber-500/15 border-amber-500/35 text-amber-300 hover:bg-amber-500/25'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden md:inline">{soundEnabled ? 'Som ON' : 'Mudo'}</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              title="Sair do Terminal"
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 border border-slate-700 text-slate-300 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto pb-2">
          {isHighCommand && (
            <button
              onClick={() => setActiveTab('comando')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'comando'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-amber-400/80 hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              Alto Comando ({activeShiftsAll.length} ativos)
              {isHighRank && pendingReportsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/25 text-rose-200 border border-rose-500/40">
                  {pendingReportsCount} rel.
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('operacional')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'operacional'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            Ponto & Patrulha
          </button>

          <button
            onClick={() => setActiveTab('cidadaos')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'cidadaos'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            INFOPEN (Cidadãos)
          </button>

          <button
            onClick={() => setActiveTab('veiculos')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'veiculos'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Car className="w-4 h-4" />
            RENAVAM (Veículos)
          </button>

          <button
            onClick={() => setActiveTab('relatorios')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'relatorios'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Relatórios & Discord
          </button>

          <button
            onClick={() => setActiveTab('penal')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'penal'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            Calculadora Penal
          </button>

          <button
            onClick={() => setActiveTab('hierarquia')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'hierarquia'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Hierarquia & Comunicados
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {activeTab === 'comando' && isHighCommand && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Award className="w-5 h-5" />
                  CENTRAL DE COMANDO — {currentUser.rank_name.toUpperCase()}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Gestão administrativa do efetivo, promoções, advertências e pasta de relatórios. A auditoria de turnos fica em <strong>Ponto & Patrulha</strong>.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-center">
                  <div className="text-lg font-extrabold text-emerald-400">{activeShiftsAll.length}</div>
                  <div className="text-[10px] uppercase text-slate-400">Em Patrulha Agora</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-center">
                  <div className="text-lg font-extrabold text-blue-400">{officers.length}</div>
                  <div className="text-[10px] uppercase text-slate-400">Total Efetivo</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-center">
                  <div className="text-lg font-extrabold text-amber-400">{pendingReportsCount}</div>
                  <div className="text-[10px] uppercase text-slate-400">Rel. Pendentes</div>
                </div>
              </div>
            </div>

            {isHighRank && (
              <div className="bg-slate-900 border border-amber-500/35 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setCmdReportsFolderOpen((prev) => !prev)}
                  className="w-full p-5 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      {cmdReportsFolderOpen ? (
                        <FolderOpen className="w-5 h-5 text-amber-300" />
                      ) : (
                        <Folder className="w-5 h-5 text-amber-300" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-white tracking-tight">
                          PASTA DE RELATÓRIOS — APROVAÇÃO E REPROVAÇÃO DO COMANDO
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {cmdReportsFolderOpen ? 'PASTA ABERTA' : 'PASTA RECOLHIDA'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Arquivo reservado de ocorrências enviadas pelos policiais. Abra para aprovar, reprovar, emitir parecer ou apagar registros antigos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-bold">
                        {pendingReportsCount} pendentes
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                        {reports.length} total
                      </span>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      {cmdReportsFolderOpen ? (
                        <>
                          Ocultar Pasta <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Abrir Pasta <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </span>
                  </div>
                </button>

                {cmdReportsFolderOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-slate-400">
                        Use os filtros abaixo para separar o que precisa de análise ou limpar registros já encerrados.
                      </span>
                      <select
                        value={cmdReportFilterStatus}
                        onChange={(e) => setCmdReportFilterStatus(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                      >
                        <option value="PENDENTE">Somente Pendentes</option>
                        <option value="TODOS">Todos os Relatórios</option>
                        <option value="APROVADO">Aprovados</option>
                        <option value="REPROVADO">Reprovados</option>
                      </select>
                    </div>

                    {reports.filter((rep) => {
                      const status = rep.review_status || 'PENDENTE';
                      return cmdReportFilterStatus === 'TODOS' || status === cmdReportFilterStatus;
                    }).length === 0 ? (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-400">
                        Nenhum relatório encontrado neste filtro dentro da pasta.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reports
                          .filter((rep) => {
                            const status = rep.review_status || 'PENDENTE';
                            return cmdReportFilterStatus === 'TODOS' || status === cmdReportFilterStatus;
                          })
                          .map((rep) => {
                            const status = rep.review_status || 'PENDENTE';
                            return (
                              <div
                                key={rep.id}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-bold">
                                      {rep.incident_code}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                        status === 'APROVADO'
                                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                          : status === 'REPROVADO'
                                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      }`}
                                    >
                                      {status}
                                    </span>
                                    <span className="font-bold text-white text-xs sm:text-sm">
                                      {rep.location}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      • Por <strong className="text-slate-200">@{rep.author_nick}</strong> ({rep.author_rank})
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => copyDiscordFormat(formatReportForDiscord(rep), `cmd-${rep.id}`)}
                                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                                    >
                                      {copiedId === `cmd-${rep.id}` ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                      Discord
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteReport(rep)}
                                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Apagar
                                    </button>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                                  {rep.description}
                                </p>

                                <div className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-400">
                                  <span>Viatura: <strong className="text-slate-200">{rep.vtr_prefix}</strong></span>
                                  <span>Envolvidos: <strong className="text-slate-200">{rep.involved_citizens || 'N/A'}</strong></span>
                                  <span>Resultado: <strong className="text-emerald-400">{rep.outcome}</strong></span>
                                  <span className="font-mono">{formatDateTime(rep.created_at)}</span>
                                </div>

                                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="text"
                                    placeholder="Parecer do Comando / motivo da aprovação ou reprovação..."
                                    value={cmdReviewNotesMap[rep.id] ?? rep.review_notes ?? ''}
                                    onChange={(e) =>
                                      setCmdReviewNotesMap((prev) => ({ ...prev, [rep.id]: e.target.value }))
                                    }
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleReviewReport(
                                          rep,
                                          'APROVADO',
                                          cmdReviewNotesMap[rep.id] ?? rep.review_notes
                                        )
                                      }
                                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                                    >
                                      Aprovar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleReviewReport(
                                          rep,
                                          'REPROVADO',
                                          cmdReviewNotesMap[rep.id] ?? rep.review_notes
                                        )
                                      }
                                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                                    >
                                      Reprovar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  Prontuário Completo do Efetivo & Credenciais
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] uppercase text-slate-400">
                        <th className="py-2 px-3">Matrícula</th>
                        <th className="py-2 px-3">Policial / Nick</th>
                        <th className="py-2 px-3">Patente</th>
                        <th className="py-2 px-3">PIN Acesso</th>
                        <th className="py-2 px-3">Adv.</th>
                        <th className="py-2 px-3">Ações Comando</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-xs">
                      {officers.map((off) => (
                        <tr key={off.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-mono font-bold text-blue-400">{off.badge_number}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-white">{off.rp_name}</div>
                            <div className="text-[11px] text-slate-400">@{off.roblox_nick} • {off.status}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              off.rank_level >= 4
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : off.rank_level === 3
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-blue-500/15 text-blue-300'
                            }`}>
                              {off.rank_name}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-amber-300">{off.pin_code}</td>
                          <td className="py-3 px-3 font-mono font-bold text-red-400">{off.warnings || 0}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              {isTopCommand && (
                                <>
                                  <button
                                    onClick={() => handleChangeOfficerRank(off, 1)}
                                    className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[10px] font-bold"
                                  >
                                    +Patente
                                  </button>
                                  <button
                                    onClick={() => handleChangeOfficerRank(off, -1)}
                                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                                  >
                                    -Patente
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleToggleOfficerWarning(off, 1)}
                                className="px-2 py-1 rounded bg-red-600/20 hover:bg-red-600/40 text-red-300 text-[10px] font-bold"
                              >
                                +Adv
                              </button>
                              {isTopCommand && (
                                <button
                                  onClick={() =>
                                    handleUpdateOfficerStatus(
                                      off,
                                      off.status === 'Suspenso' ? 'Ativo' : 'Suspenso'
                                    )
                                  }
                                  className="px-2 py-1 rounded bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-[10px]"
                                >
                                  {off.status === 'Suspenso' ? 'Reativar' : 'Suspender'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  Incorporar Policial / Recruta
                </h3>
                <form onSubmit={handleAddOfficer} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Matrícula Funcional</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: PM-007"
                      value={newOfficer.badge_number}
                      onChange={(e) => setNewOfficer({ ...newOfficer, badge_number: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Nick Roblox / Discord</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: danielscruz50"
                      value={newOfficer.roblox_nick}
                      onChange={(e) => setNewOfficer({ ...newOfficer, roblox_nick: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Nome de Guerra (RP)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Rec. Daniel Cruz"
                      value={newOfficer.rp_name}
                      onChange={(e) => setNewOfficer({ ...newOfficer, rp_name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Patente Inicial</label>
                      <select
                        value={newOfficer.rank_level}
                        onChange={(e) => setNewOfficer({ ...newOfficer, rank_level: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white"
                      >
                        {RANKS.map((r) => (
                          <option key={r.level} value={r.level}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">PIN de Login</label>
                      <input
                        type="text"
                        required
                        placeholder="1234"
                        value={newOfficer.pin_code}
                        onChange={(e) => setNewOfficer({ ...newOfficer, pin_code: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition mt-2"
                  >
                    Cadastrar no Efetivo PM
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'operacional' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-blue-400" />
                    Controle de Ponto Eletrônico (#serviço-operacional)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Seu horário de entrada e saída fica registrado automaticamente para auditoria do Alto Comando.
                  </p>
                </div>

                {!activeShift ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Prefixo da Viatura (VTR)</label>
                        <select
                          value={vtrPrefix}
                          onChange={(e) => setVtrPrefix(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white"
                        >
                          <option value="Caracterizada">VTR Caracterizada</option>
                          <option value="VTR-01 Patrulha">VTR-01 Patrulha</option>
                          <option value="VTR-02 Tática">VTR-02 Tática</option>
                          <option value="GTM Motopatrulha">GTM Motopatrulha</option>
                          <option value="Descaracterizada (P2)">Descaracterizada (P2)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Setor / Área de Patrulhamento</label>
                        <input
                          type="text"
                          value={patrolArea}
                          onChange={(e) => setPatrolArea(e.target.value)}
                          placeholder="Ex: GV e Horton, Túnel de Brookmere..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleStartShift}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      INICIAR TURNO OPERACIONAL AGORA
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold uppercase text-emerald-400">Turno Ativo em Andamento</span>
                        <div className="text-3xl font-mono font-extrabold text-white mt-1">
                          {formatDuration(elapsedSeconds)}
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Iniciado em: <strong>{formatDateTime(activeShift.started_at)}</strong> • {activeShift.vtr_prefix} ({activeShift.patrol_area})
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Resumo das Ocorrências / Observações para Encerramento
                      </label>
                      <textarea
                        rows={3}
                        value={shiftSummary}
                        onChange={(e) => setShiftSummary(e.target.value)}
                        placeholder="Ex: Patrulhamento em GV e Horton, 1 perseguição atendida, nenhuma prisão realizada..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                      />
                    </div>

                    <button
                      onClick={handleEndShift}
                      className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <Clock className="w-5 h-5" />
                      ENCERRAR TURNO E REGISTRAR HORÁRIO DE SAÍDA
                    </button>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-3">Meus Últimos Turnos Registrados</h3>
                  <div className="space-y-2">
                    {dutyLogs
                      .filter((l) => l.officer_nick.toLowerCase() === currentUser.roblox_nick.toLowerCase())
                      .slice(0, 5)
                      .map((log) => (
                        <div
                          key={log.id}
                          className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <div className="font-semibold text-white">
                              {log.vtr_prefix} • {log.patrol_area}
                            </div>
                            <div className="text-slate-400 font-mono text-[11px]">
                              Início: {formatDateTime(log.started_at)} | Fim: {log.ended_at ? formatDateTime(log.ended_at) : 'Ativo'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-400">
                              {formatDuration(log.duration_seconds)}
                            </span>
                            <button
                              onClick={() => copyDiscordFormat(formatDutyForDiscord(log), log.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1"
                            >
                              {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              Discord
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Viaturas em QAP ({activeShiftsAll.length})
                </h3>

                {activeShiftsAll.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    Nenhuma viatura em patrulhamento ativo no momento.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeShiftsAll.map((s) => (
                      <div key={s.id} className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{s.officer_rp_name}</span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">ONLINE</span>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {s.officer_rank} • {s.vtr_prefix}
                        </div>
                        <div className="text-slate-500 font-mono text-[10px] mt-2">
                          Entrada: {formatDateTime(s.started_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isHighCommand && (
              <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-400" />
                      Auditoria de Ponto Eletrônico (Início e Término de Turno)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Registro exato de entrada, saída, duração total e viatura de todos os policiais ({dutyLogs.length} turnos registrados).
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select
                      value={dutyFilterOfficer}
                      onChange={(e) => setDutyFilterOfficer(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    >
                      <option value="TODOS">Todos os Policiais</option>
                      {officers.map((o) => (
                        <option key={o.id} value={o.roblox_nick}>
                          {o.badge_number} • {o.rp_name} (@{o.roblox_nick})
                        </option>
                      ))}
                    </select>

                    <select
                      value={dutyFilterStatus}
                      onChange={(e) => setDutyFilterStatus(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    >
                      <option value="TODOS">Todos os Status</option>
                      <option value="EM_SERVICO">Em Serviço (Ativos)</option>
                      <option value="ENCERRADO">Turnos Encerrados</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] uppercase text-slate-400">
                        <th className="py-2.5 px-3">Policial / Matrícula</th>
                        <th className="py-2.5 px-3">Patente</th>
                        <th className="py-2.5 px-3">Viatura / Setor</th>
                        <th className="py-2.5 px-3">Início do Turno</th>
                        <th className="py-2.5 px-3">Encerramento do Turno</th>
                        <th className="py-2.5 px-3">Duração</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-xs">
                      {filteredDutyLogs.map((log) => {
                        const liveSec =
                          log.status === 'EM_SERVICO'
                            ? Math.floor((nowTick - new Date(log.started_at).getTime()) / 1000)
                            : log.duration_seconds;
                        return (
                          <tr key={log.id} className="hover:bg-slate-800/40">
                            <td className="py-3 px-3">
                              <div className="font-bold text-white">{log.officer_rp_name}</div>
                              <div className="text-[11px] font-mono text-slate-400">
                                {log.badge_number} • @{log.officer_nick}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-300">{log.officer_rank}</td>
                            <td className="py-3 px-3">
                              <div className="text-blue-400 font-semibold">{log.vtr_prefix}</div>
                              <div className="text-[11px] text-slate-400">{log.patrol_area}</div>
                            </td>
                            <td className="py-3 px-3 font-mono text-emerald-300">
                              {formatDateTime(log.started_at)}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-300">
                              {log.ended_at ? (
                                formatDateTime(log.ended_at)
                              ) : (
                                <span className="text-emerald-400 italic">Patrulhando agora...</span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-white">
                              {formatDuration(liveSec)}
                            </td>
                            <td className="py-3 px-3">
                              {log.status === 'EM_SERVICO' ? (
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  EM SERVIÇO
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                  ENCERRADO
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cidadaos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    INFOPEN — Registro Geral de Cidadãos de Pantanória
                  </h2>
                  <input
                    type="text"
                    placeholder="Filtrar por Passaporte, Nome ou Nick..."
                    value={citizenSearch}
                    onChange={(e) => setCitizenSearch(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white w-full sm:w-64"
                  />
                </div>

                <div className="space-y-4">
                  {filteredCitizens.map((cit) => (
                    <div key={cit.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                              {cit.passport}
                            </span>
                            <h3 className="font-bold text-white text-sm">{cit.rp_name}</h3>
                            <span className="text-xs text-slate-400">(@{cit.roblox_nick})</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-3">
                            <span>Tel: <strong className="text-slate-200">{cit.phone}</strong></span>
                            <span>CNH: <strong className="text-slate-200">{cit.cnh_status}</strong></span>
                            <span>Porte de Arma: <strong className={cit.gun_license ? 'text-emerald-400' : 'text-slate-500'}>{cit.gun_license ? 'Sim' : 'Não'}</strong></span>
                          </div>
                        </div>

                        <select
                          value={cit.wanted_status}
                          onChange={(e) => handleUpdateCitizenStatus(cit, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                            cit.wanted_status === 'Procurado' || cit.wanted_status === 'Foragido'
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : cit.wanted_status === 'Preso'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          <option value="Limpo">Limpo</option>
                          <option value="Procurado">PROCURADO</option>
                          <option value="Preso">PRESO</option>
                          <option value="Foragido">FORAGIDO</option>
                        </select>
                      </div>

                      <div className="border-t border-slate-800/80 pt-2.5">
                        <div className="text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                          Antecedentes / Passagens ({(cit.criminal_records || []).length})
                        </div>
                        {(cit.criminal_records || []).length === 0 ? (
                          <p className="text-xs text-slate-500 italic">Nada consta no prontuário.</p>
                        ) : (
                          <ul className="space-y-1 text-xs">
                            {cit.criminal_records.map((rec, idx) => (
                              <li key={idx} className="bg-slate-900 px-2.5 py-1.5 rounded text-slate-300 flex justify-between gap-2">
                                <span>• {rec.crime}</span>
                                <span className="text-[10px] font-mono text-slate-500 shrink-0">{rec.date} ({rec.officer})</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="flex gap-2 mt-2.5">
                          <input
                            type="text"
                            placeholder="Averbar nova infração / ocorrência no prontuário..."
                            value={crimeInput[cit.id] || ''}
                            onChange={(e) => setCrimeInput({ ...crimeInput, [cit.id]: e.target.value })}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCrimeRecord(cit)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                          >
                            Averbar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-blue-400" />
                Cadastrar Cidadão no INFOPEN
              </h3>
              <form onSubmit={handleAddCitizen} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Passaporte / ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: PTN-1004"
                    value={newCitizen.passport}
                    onChange={(e) => setNewCitizen({ ...newCitizen, passport: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nome Completo (RP)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo"
                    value={newCitizen.rp_name}
                    onChange={(e) => setNewCitizen({ ...newCitizen, rp_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nick Roblox</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: carlos_rp"
                    value={newCitizen.roblox_nick}
                    onChange={(e) => setNewCitizen({ ...newCitizen, roblox_nick: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Telefone</label>
                    <input
                      type="text"
                      placeholder="555-0199"
                      value={newCitizen.phone}
                      onChange={(e) => setNewCitizen({ ...newCitizen, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Situação CNH</label>
                    <select
                      value={newCitizen.cnh_status}
                      onChange={(e) => setNewCitizen({ ...newCitizen, cnh_status: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white"
                    >
                      <option value="Válida">Válida</option>
                      <option value="Suspensa">Suspensa</option>
                      <option value="Sem CNH">Sem CNH</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-slate-300 pt-1">
                  <input
                    type="checkbox"
                    checked={newCitizen.gun_license}
                    onChange={(e) => setNewCitizen({ ...newCitizen, gun_license: e.target.checked })}
                  />
                  Possui Porte Legal de Arma
                </label>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition mt-2"
                >
                  Salvar Ficha no Banco de Dados
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'veiculos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-400" />
                  RENAVAM — Consulta de Placas e Frota
                </h2>
                <input
                  type="text"
                  placeholder="Buscar por Placa, Modelo ou Proprietário..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white w-full sm:w-64"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVehicles.map((v) => (
                  <div key={v.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="bg-white text-slate-950 font-mono font-extrabold text-sm px-3 py-1 rounded border-t-4 border-blue-700 tracking-wider">
                        {v.plate}
                      </div>
                      <select
                        value={v.status}
                        onChange={(e) => handleUpdateVehicleStatus(v, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          v.status === 'Roubado/Furtado'
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : v.status === 'Apreendido'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        <option value="Regular">Regular</option>
                        <option value="Roubado/Furtado">ROUBADO / FURTADO</option>
                        <option value="Apreendido">APREENDIDO</option>
                      </select>
                    </div>

                    <div>
                      <div className="font-bold text-white text-sm">{v.model}</div>
                      <div className="text-xs text-slate-400">Cor: {v.color}</div>
                    </div>

                    <div className="text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                      <div className="text-slate-300">
                        Proprietário: <strong>{v.owner_name}</strong> ({v.owner_passport})
                      </div>
                      {v.notes && <div className="text-slate-400 mt-1 text-[11px]">Obs: {v.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-blue-400" />
                Emplacar / Registrar Veículo
              </h3>
              <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Placa</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: PTN-5B90"
                    value={newVehicle.plate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Modelo do Veículo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ford Crown Victoria"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Cor</label>
                    <input
                      type="text"
                      required
                      placeholder="Preto"
                      value={newVehicle.color}
                      onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Passaporte Dono</label>
                    <input
                      type="text"
                      required
                      placeholder="PTN-1003"
                      value={newVehicle.owner_passport}
                      onChange={(e) => setNewVehicle({ ...newVehicle, owner_passport: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nome do Proprietário</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome RP do dono"
                    value={newVehicle.owner_name}
                    onChange={(e) => setNewVehicle({ ...newVehicle, owner_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Observações</label>
                  <input
                    type="text"
                    placeholder="Opcional..."
                    value={newVehicle.notes}
                    onChange={(e) => setNewVehicle({ ...newVehicle, notes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition mt-2"
                >
                  Registrar no RENAVAM
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'relatorios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-400" />
                Lavrar Relatório Pós-Ocorrência
              </h2>
              <form onSubmit={handleAddReport} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Código Ocorrência</label>
                    <select
                      value={newReport.incident_code}
                      onChange={(e) => setNewReport({ ...newReport, incident_code: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white"
                    >
                      <option value="Código 1">Código 1 (Rotina)</option>
                      <option value="Código 2">Código 2 (Urgência)</option>
                      <option value="Código 3">Código 3 (Emergência / Fuga)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Viatura</label>
                    <input
                      type="text"
                      value={newReport.vtr_prefix}
                      onChange={(e) => setNewReport({ ...newReport, vtr_prefix: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Local da Ocorrência</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Túnel de Brookmere, GV..."
                    value={newReport.location}
                    onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Policiais Envolvidos</label>
                  <input
                    type="text"
                    placeholder="Ex: @Krustelles_22 @wyzontheradar"
                    value={newReport.involved_officers}
                    onChange={(e) => setNewReport({ ...newReport, involved_officers: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Suspeitos / Pessoas Envolvidas</label>
                  <input
                    type="text"
                    placeholder="Ex: nick (PTN-1001)"
                    value={newReport.involved_citizens}
                    onChange={(e) => setNewReport({ ...newReport, involved_citizens: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Descrição Resumida</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Relate o ocorrido com clareza..."
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Providências</label>
                    <input
                      type="text"
                      value={newReport.actions_taken}
                      onChange={(e) => setNewReport({ ...newReport, actions_taken: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Resultado Final</label>
                    <select
                      value={newReport.outcome}
                      onChange={(e) => setNewReport({ ...newReport, outcome: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white"
                    >
                      <option value="Preso">Preso</option>
                      <option value="Advertido / Liberado">Advertido / Liberado</option>
                      <option value="Veículo Apreendido">Veículo Apreendido</option>
                      <option value="Foragido">Foragido</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition"
                >
                  Enviar para o Comando
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  {isHighRank ? (
                    <>
                      <strong className="text-amber-400">Visão de Patente Alta:</strong> Você visualiza todos os relatórios e pode{' '}
                      <strong className="text-white">Aprovar</strong>, <strong className="text-white">Reprovar</strong> ou <strong className="text-white">Apagar</strong>.
                    </>
                  ) : (
                    <>
                      <strong className="text-blue-400">Acesso Restrito:</strong> Você visualiza apenas os relatórios enviados por você até análise do Comando.
                    </>
                  )}
                </div>
                <select
                  value={reportFilterStatus}
                  onChange={(e) => setReportFilterStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="PENDENTE">Pendentes de Avaliação</option>
                  <option value="APROVADO">Aprovados</option>
                  <option value="REPROVADO">Reprovados</option>
                </select>
              </div>

              {reports
                .filter((rep) => {
                  const canView =
                    isHighRank ||
                    rep.author_nick.toLowerCase() === currentUser.roblox_nick.toLowerCase();
                  if (!canView) return false;

                  const status = rep.review_status || 'PENDENTE';
                  return reportFilterStatus === 'TODOS' || status === reportFilterStatus;
                })
                .map((rep) => {
                  const status = rep.review_status || 'PENDENTE';
                  const isAuthor =
                    rep.author_nick.toLowerCase() === currentUser.roblox_nick.toLowerCase();
                  const canDelete = isHighRank || isAuthor;

                  return (
                    <div key={rep.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold">
                            {rep.incident_code}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                              status === 'APROVADO'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : status === 'REPROVADO'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {status}
                          </span>
                          <span className="font-bold text-white text-sm">{rep.location}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => copyDiscordFormat(formatReportForDiscord(rep), rep.id)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
                          >
                            {copiedId === rep.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copiedId === rep.id ? 'Copiado!' : 'Copiar p/ Discord'}
                          </button>

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReport(rep)}
                              title="Apagar relatório"
                              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Apagar
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                        {rep.description}
                      </p>

                      <div className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-400">
                        <span>Responsável: <strong className="text-slate-200">@{rep.author_nick}</strong> ({rep.author_rank})</span>
                        <span>Envolvidos: <strong className="text-slate-200">{rep.involved_citizens || 'N/A'}</strong></span>
                        <span>Resultado: <strong className="text-emerald-400">{rep.outcome}</strong></span>
                        <span className="font-mono">{formatDateTime(rep.created_at)}</span>
                      </div>

                      {rep.reviewed_by && (
                        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-slate-200">
                              Avaliação do Comando: @{rep.reviewed_by} ({rep.reviewer_rank})
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {formatDateTime(rep.reviewed_at)}
                            </span>
                          </div>
                          <p className="text-slate-300">{rep.review_notes}</p>
                        </div>
                      )}

                      {isHighRank && (
                        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Parecer do Comando / observação (opcional)..."
                            value={reviewNotesMap[rep.id] ?? rep.review_notes ?? ''}
                            onChange={(e) => setReviewNotesMap((prev) => ({ ...prev, [rep.id]: e.target.value }))}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleReviewReport(rep, 'APROVADO')}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                            >
                              Aprovar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewReport(rep, 'REPROVADO')}
                              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                            >
                              Reprovar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {activeTab === 'penal' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-blue-400" />
                Código Penal de Pantanória — Selecione as Infrações
              </h2>
              <div className="space-y-2.5">
                {PENAL_ARTICLES.map((art) => {
                  const checked = selectedArticles.includes(art.id);
                  return (
                    <label
                      key={art.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                        checked
                          ? 'bg-blue-600/15 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedArticles((prev) =>
                              prev.includes(art.id) ? prev.filter((x) => x !== art.id) : [...prev, art.id]
                            )
                          }
                        />
                        <div>
                          <div className="text-xs font-bold">
                            {art.code} — {art.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {art.bail ? 'Crime Afiançável' : 'Inafiançável'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <div className="font-bold text-amber-400">{art.months} meses</div>
                        <div className="text-emerald-400">$ {art.fine.toLocaleString('pt-BR')}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit space-y-4">
              <h3 className="text-base font-bold text-white">Sentença Calculada</h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Pena Total:</span>
                  <span className="font-mono font-extrabold text-amber-400 text-base">{penalTotals.months} meses</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Multa Total:</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-base">
                    $ {penalTotals.fine.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Direito a Fiança:</span>
                  <span className={`font-bold ${penalTotals.bailAllowed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedArticles.length === 0 ? '—' : penalTotals.bailAllowed ? 'SIM' : 'NÃO (INAFIANÇÁVEL)'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedArticles([])}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Limpar Seleção
              </button>
            </div>
          </div>
        )}

        {activeTab === 'hierarquia' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Hierarquia Oficial — Polícia Militar de Pantanória
              </h2>
              {RANKS.map((r) => (
                <div key={r.level} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">
                      {6 - r.level}. {r.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300">
                      Nível {r.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{r.desc}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {isHighCommand && (
                <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-amber-300 mb-3">
                    Publicar Comunicado ou Parametrização (Alto Comando)
                  </h3>
                  <form onSubmit={handleAddAnnouncement} className="space-y-2.5 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="Título (ex: PARAMETRIZAÇÃO — RECRUTA...)"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    />
                    <textarea
                      rows={3}
                      required
                      placeholder="Texto oficial do comunicado..."
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                    />
                    <button
                      type="submit"
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-xl"
                    >
                      Publicar no Mural Oficial
                    </button>
                  </form>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-blue-400" />
                  Mural de Comunicados & Parametrizações
                </h2>
                {announcements.map((a) => (
                  <div key={a.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
                    <div className="text-xs font-extrabold text-blue-400">{a.title}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{a.content}</p>
                    <div className="text-[10px] text-slate-500 pt-1">
                      Comando da Polícia Militar • @{a.author_nick} • {formatDateTime(a.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {isHighRank && reportToasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm space-y-2.5 pointer-events-none px-4 sm:px-0">
          {reportToasts.map((toast) => (
            <div
              key={toast.toastId}
              className="pointer-events-auto bg-slate-900/95 border border-amber-500/45 rounded-2xl p-4 shadow-2xl shadow-black/70 backdrop-blur-md space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/35 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-amber-300 animate-bounce" />
                  </span>
                  <div>
                    <div className="text-[11px] font-mono uppercase font-bold text-amber-300">
                      Novo Relatório para Análise
                    </div>
                    <div className="text-xs font-bold text-white">
                      @{toast.author_nick} • {toast.incident_code}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.toastId)}
                  aria-label="Fechar notificação"
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-300 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 space-y-1">
                <div>
                  Local: <strong className="text-white">{toast.location}</strong>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Resultado: <strong className="text-emerald-400">{toast.outcome}</strong></span>
                  <span className="font-mono">{formatDateTime(toast.created_at)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => dismissToast(toast.toastId)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Ignorar
                </button>
                <button
                  type="button"
                  onClick={() => openReportFromToast(toast)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                >
                  Abrir Pasta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
