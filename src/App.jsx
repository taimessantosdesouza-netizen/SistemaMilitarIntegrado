import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Shield, Lock, LogOut, Radio, Users, Car, FileText, AlertTriangle,
  CheckCircle2, Clock, Search, Plus, Copy, Check, Award,
  UserCheck, KeyRound, Scale, Megaphone, Database,
  Activity, ShieldAlert, Folder, FolderOpen, Trash2, ChevronDown, ChevronUp,
  Bell, X, Volume2, ArrowLeft
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { INITIAL_OFFICERS } from './constants/officers';
import { INITIAL_CITIZENS } from './constants/citizens';
import { INITIAL_VEHICLES } from './constants/vehicles';
import { INITIAL_REPORTS } from './constants/reports';
import { INITIAL_DUTY_LOGS } from './constants/dutyLogs';
import { INITIAL_ANNOUNCEMENTS } from './constants/announcements';
import { PENAL_ARTICLES } from './constants/penalArticles';
import { RANKS } from './constants/ranks';
import { formatDateTime } from './utils/formatters';

function formatDuration(seconds) {
  const sec = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

export default function App() {
  // Este portal agora atende exclusivamente à Polícia Militar.
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sigp_pantanoria_user');
    if (!saved) return null;
    try {
      const user = JSON.parse(saved);
      // Impede que uma sessão antiga de outra corporação entre no sistema da PM.
      if (String(user?.badge_number || '').toUpperCase().startsWith('BM-')) {
        localStorage.removeItem('sigp_pantanoria_user');
        return null;
      }
      return user;
    } catch {
      localStorage.removeItem('sigp_pantanoria_user');
      return null;
    }
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
  // Remove a preferência antiga de seleção de corporação, se existir.
  useEffect(() => { localStorage.removeItem('sigp_pantanoria_selected_corps'); }, []);
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

  const [shiftFines, setShiftFines] = useState(() => {
    try {
      const saved = localStorage.getItem('sigp_pantanoria_shift_fines');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [fineTarget, setFineTarget] = useState('');
  const [fineFeedback, setFineFeedback] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('sigp_pantanoria_shift_fines', JSON.stringify(shiftFines));
    } catch {
      // ignora erro de armazenamento local
    }
  }, [shiftFines]);

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
  const [reportImage, setReportImage] = useState('');
  const [reportImageName, setReportImageName] = useState('');
  const [cropZoom, setCropZoom] = useState(1);

  const [reviewNotesMap, setReviewNotesMap] = useState({});
  const [reportFilterStatus, setReportFilterStatus] = useState('TODOS');
  const [reportSearch, setReportSearch] = useState('');
  const [reportFilterType, setReportFilterType] = useState('TODOS');
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

  const activeShiftFines = useMemo(() => {
    if (!activeShift) return [];
    return shiftFines.filter((f) => f.shiftId === activeShift.id);
  }, [shiftFines, activeShift]);

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
      setLoginError('Matrícula ou Nick Roblox não encontrado no efetivo da Polícia Militar.');
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
        setShiftFines((prev) =>
          prev.map((f) => (f.shiftId === newLog.id ? { ...f, shiftId: data.id } : f))
        );
      }
    }
  };

  const handleRegisterShiftFine = async () => {
    if (!currentUser || selectedArticles.length === 0) return;

    if (!activeShift) {
      setFineFeedback('Inicie o ponto em "Ponto & Patrulha" antes de registrar uma multa no turno.');
      return;
    }

    const chosen = PENAL_ARTICLES.filter((a) => selectedArticles.includes(a.id));
    const nowIso = new Date().toISOString();
    const targetClean = fineTarget.trim();

    const entries = chosen.map((art) => ({
      id: crypto.randomUUID(),
      shiftId: activeShift.id,
      officerNick: currentUser.roblox_nick,
      artCode: art.code,
      artName: art.name,
      fine: art.fine,
      months: art.months,
      target: targetClean || 'Não informado',
      createdAt: nowIso,
    }));

    setShiftFines((prev) => [...entries, ...prev]);

    let infopenMatchedName = '';
    if (targetClean) {
      const normalizedTarget = targetClean.toLowerCase();
      const matchedCitizen = citizens.find(
        (c) =>
          normalizedTarget.includes(c.passport.toLowerCase()) ||
          normalizedTarget.includes(c.rp_name.toLowerCase()) ||
          (c.roblox_nick && normalizedTarget.includes(c.roblox_nick.toLowerCase()))
      );

      if (matchedCitizen) {
        infopenMatchedName = matchedCitizen.rp_name;
        const todayStr = new Date().toLocaleDateString('pt-BR');
        const newCrimeRecords = chosen.map((art) => ({
          date: todayStr,
          crime: `Multa/Autuação: ${art.code} — ${art.name} ($${art.fine.toLocaleString()})`,
          officer: `@${currentUser.roblox_nick}`,
        }));
        const updatedRecords = [...newCrimeRecords, ...(matchedCitizen.criminal_records || [])];

        setCitizens((prev) =>
          prev.map((c) => (c.id === matchedCitizen.id ? { ...c, criminal_records: updatedRecords } : c))
        );

        if (isSupabaseConfigured && supabase) {
          await supabase
            .from('pm_citizens')
            .update({ criminal_records: updatedRecords })
            .eq('id', matchedCitizen.id);
        }
      }
    }

    setFineTarget('');
    setSelectedArticles([]);
    setFineFeedback(
      infopenMatchedName
        ? `${entries.length} multa(s) vinculada(s) ao turno atual e averbada(s) no INFOPEN de ${infopenMatchedName}.`
        : `${entries.length} multa(s) vinculada(s) ao turno atual. Entrarão nas observações ao encerrar o ponto.`
    );
  };

  const handleEndShift = async () => {
    if (!activeShift) return;
    const endedAt = new Date().toISOString();
    const durationSec = Math.max(
      1,
      Math.floor((new Date(endedAt).getTime() - new Date(activeShift.started_at).getTime()) / 1000)
    );

    const finesInThisShift = shiftFines.filter((f) => f.shiftId === activeShift.id);
    const finesSummaryText =
      finesInThisShift.length > 0
        ? `Multas aplicadas (${finesInThisShift.length}): ` +
          finesInThisShift
            .map(
              (f) =>
                `${f.artCode} — ${f.artName} ($${f.fine.toLocaleString()} | Alvo: ${f.target})`
            )
            .join(' | ')
        : '';

    const manualNotes = shiftSummary.trim();
    const combinedNotes =
      [manualNotes, finesSummaryText].filter(Boolean).join(' • ') ||
      'Patrulhamento concluído sem alterações extraordinárias.';

    const updated = {
      ...activeShift,
      ended_at: endedAt,
      duration_seconds: durationSec,
      status: 'ENCERRADO',
      summary_notes: combinedNotes
    };

    setDutyLogs((prev) => prev.map((item) => (item.id === activeShift.id ? updated : item)));
    setShiftSummary('');
    setFineFeedback('');

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

  const createCroppedEvidence = (dataUrl, zoom = 1) =>
    new Promise((resolve, reject) => {
      if (!dataUrl) return resolve(null);
      const image = new Image();
      image.onload = () => {
        const aspect = 16 / 9;
        const baseWidth = Math.min(image.width, image.height * aspect);
        const baseHeight = baseWidth / aspect;
        const sourceWidth = baseWidth / zoom;
        const sourceHeight = baseHeight / zoom;
        const sx = (image.width - sourceWidth) / 2;
        const sy = (image.height - sourceHeight) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, sx, sy, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.onerror = reject;
      image.src = dataUrl;
    });

  const handleAddReport = async (e) => {
    e.preventDefault();
    unlockAudioContext();

    const requiredFields = [
      ['Local da ocorrência', newReport.location],
      ['Descrição', newReport.description],
    ];
    const missingField = requiredFields.find(([, value]) => !String(value || '').trim());
    if (missingField) {
      window.alert(`Preencha o campo obrigatório: ${missingField[0]}.`);
      return;
    }
    if (String(newReport.description).trim().length < 20) {
      window.alert('A descrição precisa ter pelo menos 20 caracteres para garantir um registro claro.');
      return;
    }

    let croppedEvidence = null;
    try {
      croppedEvidence = await createCroppedEvidence(reportImage, cropZoom);
    } catch (error) {
      window.alert('Não foi possível processar a imagem. Tente selecionar o arquivo novamente.');
      return;
    }

    const payload = {
      ...newReport,
      location: newReport.location.trim(),
      involved_officers: newReport.involved_officers.trim(),
      involved_citizens: newReport.involved_citizens.trim(),
      description: newReport.description.trim(),
      actions_taken: newReport.actions_taken.trim(),
      evidence_image: croppedEvidence,
      author_nick: currentUser.roblox_nick,
      author_rank: currentUser.rank_name,
      review_status: 'PENDENTE',
      reviewed_by: null,
      reviewer_rank: null,
      review_notes: '',
      reviewed_at: null,
      created_at: new Date().toISOString()
    };

    let savedReport = { id: crypto.randomUUID(), ...payload };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('pm_reports').insert([payload]).select().single();
      if (error || !data) {
        console.error('Falha ao salvar relatório:', error);
        window.alert(`Não foi possível salvar o relatório no banco de dados. Seus dados continuam no formulário. ${error?.message || ''}`);
        return;
      }
      savedReport = data;
    }

    notifiedReportIdsRef.current.add(savedReport.id);
    setReports((prev) => [savedReport, ...prev.filter((item) => item.id !== savedReport.id)]);
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
    setReportImage('');
    setReportImageName('');
    setCropZoom(1);

    if (isHighRank) {
      const toastId = `${savedReport.id}-${Date.now()}`;
      setReportToasts((prev) => [
        {
          toastId,
          reportId: savedReport.id,
          author_nick: savedReport.author_nick,
          author_rank: savedReport.author_rank,
          location: savedReport.location || 'Local não informado',
          incident_code: savedReport.incident_code || 'Código 1',
          outcome: savedReport.outcome || 'Registrado',
          created_at: savedReport.created_at
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
    if ((report.author_nick || '').toLowerCase() === (currentUser?.roblox_nick || '').toLowerCase()) {
      window.alert('Para manter a imparcialidade, você não pode avaliar um relatório criado por você.');
      return;
    }
    const rawNote = customNotes !== undefined ? customNotes : reviewNotesMap[report.id];
    const notes = (rawNote || '').trim();
    if (decision === 'REPROVADO' && notes.length < 8) {
      window.alert('Informe um motivo com pelo menos 8 caracteres antes de reprovar o relatório.');
      return;
    }
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

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('pm_reports').update(updatedFields).eq('id', report.id);
      if (error) {
        console.error('Falha ao atualizar parecer:', error);
        window.alert(`Não foi possível registrar a avaliação. ${error.message || ''}`);
        return;
      }
    }
    setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, ...updatedFields } : r)));
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

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('pm_reports').delete().eq('id', report.id);
      if (error) {
        console.error('Falha ao apagar relatório:', error);
        window.alert(`Não foi possível apagar o relatório. ${error.message || ''}`);
        return;
      }
    }
    setReports((prev) => prev.filter((r) => r.id !== report.id));
  };

  const copyDiscordFormat = async (text, id) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard indisponível');
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2200);
    } catch (error) {
      console.error('Falha ao copiar relatório:', error);
      window.alert('Não foi possível copiar automaticamente. Verifique a permissão de área de transferência do navegador.');
    }
  };

  const formatReportForDiscord = (r) => {
    const statusLabel = r.review_status || 'PENDENTE';
    const parecerLinha = r.reviewed_by
      ? `\n• **Parecer (${statusLabel} por @${r.reviewed_by}):** ${r.review_notes || 'Sem observações'}`
      : `\n• **Status Comando:** ${statusLabel}`;

    return `🚓 **RELATÓRIO PÓS-OCORRÊNCIA — POLÍCIA MILITAR DE CAPITAL VILLE**
- **Responsável:** @${r.author_nick}
- **Patente:** @${r.author_rank}
- **Data e horário:** ${formatDateTime(r.created_at)}
- **Local da ocorrência:** ${r.location || 'Não informado'}
- **Viatura:** ${r.vtr_prefix || 'Caracterizada'}
- **Policiais envolvidos:** ${r.involved_officers || 'Nenhum'}

**INFORMAÇÕES DA OCORRÊNCIA**
- **Natureza do registro:** ${r.report_type || 'OCORRENCIA'}
- **Código operacional:** ${r.incident_code || 'Código 1'}
- **Pessoas envolvidas:** ${r.involved_citizens || 'Não identificado'}
- **Descrição resumida:** ${r.description}
- **Providências tomadas:** ${r.actions_taken || 'Nenhuma'}
- **Resultado final:** ${r.outcome || 'Concluído'}${parecerLinha}

**Assinatura do responsável:** ${r.author_nick}`;
  };

  const formatDutyForDiscord = (d) => {
    return `🚓 **SERVIÇO OPERACIONAL — POLÍCIA MILITAR DE CAPITAL VILLE**
- **Responsável:** @${d.officer_nick} (${d.badge_number})
- **Patente:** @${d.officer_rank}
- **Início do Turno:** ${formatDateTime(d.started_at)}
- **Término do Turno:** ${d.ended_at ? formatDateTime(d.ended_at) : 'EM ANDAMENTO'}
- **Tempo Patrulhado:** ${formatDuration(d.duration_seconds)}
- **Prefixo da VTR:** ${d.vtr_prefix}
- **Área de Patrulhamento:** ${d.patrol_area || 'GV e Horton'}

**RESUMO DO SERVIÇO**
- **Observações:** ${d.summary_notes || 'Sem alterações'}
- **Assinatura do responsável:** ${d.officer_nick}`;
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

  const handleDeleteAnnouncement = async (announcement) => {
    if (!isHighCommand || !announcement?.id) return;

    const confirmed = window.confirm(
      `Apagar permanentemente o comunicado "${announcement.title}"?`
    );
    if (!confirmed) return;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('pm_announcements').delete().eq('id', announcement.id);
      if (error) {
        console.error('Falha ao apagar comunicado:', error);
        window.alert(`Não foi possível apagar o comunicado. ${error.message || ''}`);
        return;
      }
    }

    setAnnouncements((prev) => prev.filter((a) => a.id !== announcement.id));
  };

  const filteredCitizens = useMemo(() => {
    const q = (globalSearch || citizenSearch).toLowerCase().trim();
    if (!q) return citizens;
    return citizens.filter(
      (c) =>
        c.rp_name.toLowerCase().includes(q) ||
        c.passport.toLowerCase().includes(q) ||
        (c.roblox_nick || '').toLowerCase().includes(q)
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
        (v.owner_passport || '').toLowerCase().includes(q)
    );
  }, [vehicles, vehicleSearch, globalSearch]);

  const filteredDutyLogs = useMemo(() => {
    return dutyLogs.filter((log) => {
      if (dutyFilterOfficer !== 'TODOS' && log.officer_nick !== dutyFilterOfficer) return false;
      if (dutyFilterStatus !== 'TODOS' && log.status !== dutyFilterStatus) return false;
      return true;
    });
  }, [dutyLogs, dutyFilterOfficer, dutyFilterStatus]);

  const penaltySummary = useMemo(() => {
    const chosen = PENAL_ARTICLES.filter((a) => selectedArticles.includes(a.id));
    return {
      totalMonths: chosen.reduce((acc, a) => acc + a.months, 0),
      totalFine: chosen.reduce((acc, a) => acc + a.fine, 0),
      hasNonBailable: chosen.some((a) => !a.bail),
      count: chosen.length
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
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-8 backdrop-blur-md">

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 shadow-lg shadow-blue-900/40 flex items-center justify-center mb-4">
                <Shield className="w-9 h-9 text-blue-400" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest font-semibold text-blue-400">
                Polícia Militar de Capital Ville • Rede Operacional
              </span>
              <h1 className="text-2xl font-extrabold text-white mt-1">SIGP — Terminal da Polícia Militar</h1>
              <p className="text-xs text-slate-400 mt-1">
                Identifique-se com seu Nick Roblox ou Matrícula para acessar o sistema.
              </p>
            </div>

            {!isSupabaseConfigured && (
              <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <Database className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Modo demonstração local ativo. Configure as variáveis do <strong>Supabase</strong> na Vercel para persistir dados na nuvem.
                </span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nick Roblox ou Matrícula
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Felipe, Tsantos ou PM-001"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Senha / PIN Funcional
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/40 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Autenticar no Sistema
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2.5 text-center">
                Acesso Rápido (Testes / Comando)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setLoginIdentifier('Felipe'); setLoginPin('2026'); }}
                  className="text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition"
                >
                  <div className="text-xs font-bold text-amber-400">Cmdt. Felipe</div>
                  <div className="text-[10px] text-slate-400">Comandante-Geral</div>
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginIdentifier('Tsantos'); setLoginPin('1900'); }}
                  className="text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition"
                >
                  <div className="text-xs font-bold text-blue-400">
                    Subcmdt. Tsantos
                  </div>
                  <div className="text-[10px] text-slate-400">Subcomandante</div>
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginIdentifier('lucero'); setLoginPin('1903'); }}
                  className="text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition"
                >
                  <div className="text-xs font-bold text-cyan-400">Sup. Lucero</div>
                  <div className="text-[10px] text-slate-400">Supervisor Operacional</div>
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginIdentifier('krussttelles'); setLoginPin('1234'); }}
                  className="text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition"
                >
                  <div className="text-xs font-bold text-slate-200">Sd. Krussttelles</div>
                  <div className="text-[10px] text-slate-400">Policial Militar</div>
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
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-tight">SIGP CAPITAL VILLE</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  RP MILITAR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Oficial: <strong className="text-slate-200">{currentUser.rp_name}</strong> (@{currentUser.roblox_nick}) •{' '}
                <span className="text-amber-400 font-semibold">
                  {currentUser.rank_name}
                </span>
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-xs min-w-[180px]">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Buscar Passaporte, Nome ou Placa..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeShift ? (
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-300">
                  {formatDuration(elapsedSeconds)}
                </span>
                {activeShiftFines.length > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/35">
                    {activeShiftFines.length} multa(s)
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-xs font-mono text-slate-300">FORA DE SERVIÇO</span>
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
                title="Clique para testar o som (botão direito para ativar/mutar)"
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
              type="button"
              onClick={() => setActiveTab('operacional')}
              title="Voltar ao painel operacional"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Painel</span>
            </button>

            <button
              onClick={handleLogout}
              title="Sair do Terminal"
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700 text-slate-200 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-2.5 pt-1 flex flex-wrap items-center gap-1.5">
          {isHighCommand && (
            <button
              onClick={() => setActiveTab('comando')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'comando'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-amber-400/90 hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Alto Comando ({activeShiftsAll.length})
              {isHighRank && pendingReportsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/25 text-amber-200 border border-amber-500/40">
                  {pendingReportsCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('operacional')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'operacional'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Ponto & Patrulha
          </button>

          <button
            onClick={() => setActiveTab('infopen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'infopen'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            INFOPEN
          </button>

          <button
            onClick={() => setActiveTab('veiculos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'veiculos'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            RENAVAM
          </button>

          <button
            onClick={() => setActiveTab('relatorios')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'relatorios'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Relatórios
          </button>

          <button
            onClick={() => setActiveTab('codigo-penal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'codigo-penal'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Código Penal
          </button>

          <button
            onClick={() => setActiveTab('hierarquia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'hierarquia'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            Hierarquia & Mural
          </button>

        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {activeTab === 'comando' && isHighCommand && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5" />
                  PAINEL DO ALTO COMANDO — {currentUser.rank_name.toUpperCase()}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Pasta de relatórios para aprovação/reprovação e recrutamento. A auditoria de turnos fica em <strong>Ponto & Patrulha</strong> e o prontuário do efetivo em <strong>Hierarquia & Mural</strong>.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-center">
                  <div className="text-lg font-extrabold text-emerald-400">{activeShiftsAll.length}</div>
                  <div className="text-[10px] uppercase text-slate-400">Em Serviço</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-center">
                  <div className="text-lg font-extrabold text-blue-400">{officers.length}</div>
                  <div className="text-[10px] uppercase text-slate-400">Efetivo Total</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-center">
                  <div className="text-lg font-extrabold text-amber-400">{pendingReportsCount}</div>
                  <div className="text-[10px] uppercase text-slate-400">Rel. Pendentes</div>
                </div>
              </div>
            </div>

            {isHighRank && (
              <div className="bg-slate-900 border border-amber-500/30 rounded-2xl overflow-hidden">
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
                          PASTA DE RELATÓRIOS — APROVAÇÃO E REPROVAÇÃO
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {cmdReportsFolderOpen ? 'PASTA ABERTA' : 'PASTA RECOLHIDA'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Arquivo reservado de ocorrências enviadas pelas tropas. Clique para abrir ou recolher.
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
                        Filtre os relatórios para avaliar ou apagar ocorrências já encerradas.
                      </span>
                      <select
                        value={cmdReportFilterStatus}
                        onChange={(e) => setCmdReportFilterStatus(e.target.value)}
                        style={{ colorScheme: 'dark' }}
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
                                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[11px] font-bold">
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
                                  <span>Envolvidos: <strong className="text-slate-200">{rep.involved_citizens || 'N/A'}</strong></span>
                                  <span>Desfecho: <strong className="text-emerald-400">{rep.outcome}</strong></span>
                                  <span className="font-mono">{formatDateTime(rep.created_at)}</span>
                                </div>

                                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="text"
                                    placeholder="Parecer do Comando..."
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

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-emerald-400" />
                Recrutar / Cadastrar Policial
              </h3>
              <form onSubmit={handleAddOfficer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Matrícula (Ex: PM-007)"
                  value={newOfficer.badge_number}
                  onChange={(e) => setNewOfficer({ ...newOfficer, badge_number: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
                <input
                  type="text"
                  required
                  placeholder="Nick Roblox"
                  value={newOfficer.roblox_nick}
                  onChange={(e) => setNewOfficer({ ...newOfficer, roblox_nick: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Nome RP (Ex: Sd. Silva)"
                  value={newOfficer.rp_name}
                  onChange={(e) => setNewOfficer({ ...newOfficer, rp_name: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <select
                  value={newOfficer.rank_level}
                  onChange={(e) => setNewOfficer({ ...newOfficer, rank_level: Number(e.target.value) })}
                  style={{ colorScheme: 'dark' }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white"
                >
                  {RANKS.map((r) => (
                    <option key={r.level} value={r.level}>
                      {r.name} (Nível {r.level})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="PIN (Ex: 1234)"
                  value={newOfficer.pin_code}
                  onChange={(e) => setNewOfficer({ ...newOfficer, pin_code: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg transition"
                >
                  Cadastrar
                </button>
              </form>
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
                    Controle de Ponto Eletrônico
                  </h2>
                  <p className="text-xs text-slate-400">
                    Registre o início e o término do seu patrulhamento. Multas aplicadas durante o turno entram automaticamente nas observações ao encerrar.
                  </p>
                </div>

                {!activeShift ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Prefixo / Tipo de Viatura</label>
                        <select
                          value={vtrPrefix}
                          onChange={(e) => setVtrPrefix(e.target.value)}
                          style={{ colorScheme: 'dark' }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white"
                        >
                          <option value="Caracterizada">Viatura Caracterizada</option>
                          <option value="VTR-01 Patrulha">VTR-01 Patrulha Ostensiva</option>
                          <option value="VTR-02 Tática">VTR-02 Tática / Choque</option>
                          <option value="GRAer / Águia">GRAer / Helicóptero</option>
                          <option value="Moto Patrulha">Moto Patrulha</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Área de Patrulhamento</label>
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
                      INICIAR SERVIÇO AGORA
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold uppercase text-emerald-400">Turno em Andamento</span>
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
                        Resumo do Turno / Ocorrências Atendidas
                      </label>
                      <textarea
                        rows={3}
                        value={shiftSummary}
                        onChange={(e) => setShiftSummary(e.target.value)}
                        placeholder="Ex: Patrulhamento em GV e Horton, abordagem a suspeito, apoio em ocorrência..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                      />
                    </div>

                    {activeShiftFines.length > 0 && (
                      <div className="bg-slate-950/90 border border-amber-500/35 rounded-xl p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-amber-300 font-bold">
                          <span>Multas registradas neste turno ({activeShiftFines.length})</span>
                          <span className="font-mono text-emerald-400">
                            ${activeShiftFines.reduce((acc, f) => acc + f.fine, 0).toLocaleString()}
                          </span>
                        </div>
                        <ul className="space-y-1 text-slate-300">
                          {activeShiftFines.map((f) => (
                            <li key={f.id} className="flex justify-between gap-2 text-[11px]">
                              <span>
                                • <strong>{f.artCode}</strong> — {f.artName} (Alvo: {f.target})
                              </span>
                              <span className="font-mono text-emerald-400 shrink-0">
                                ${f.fine.toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-[11px] text-slate-400 pt-1">
                          Estas autuações serão anexadas automaticamente às observações ao encerrar o serviço.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleEndShift}
                      className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-rose-950"
                    >
                      <Clock className="w-5 h-5" />
                      ENCERRAR SERVIÇO E REGISTRAR SAÍDA
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
                          className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="font-semibold text-white">
                                {log.vtr_prefix} • {log.patrol_area}
                              </div>
                              <div className="text-slate-400 font-mono text-[11px]">
                                Início: {formatDateTime(log.started_at)} | Fim: {log.ended_at ? formatDateTime(log.ended_at) : 'Ativo'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-emerald-400">
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
                          {log.summary_notes && (
                            <div className="text-[11px] text-slate-300 bg-slate-900/90 border border-slate-800/80 rounded-lg px-2.5 py-1.5">
                              <strong className="text-slate-400">Observações:</strong> {log.summary_notes}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Efetivo em Serviço Agora ({activeShiftsAll.length})
                </h3>

                {activeShiftsAll.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    Nenhum policial em serviço no momento. Inicie seu turno ao lado!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeShiftsAll.map((s) => (
                      <div key={s.id} className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{s.officer_rp_name}</span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">EM SERVIÇO</span>
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
              <div className="bg-slate-900 border border-amber-500/25 rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-400" />
                      Auditoria Completa de Turnos / Ponto ({dutyLogs.length} registros)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Acompanhe horários exatos de entrada, saída, tempo patrulhado e observações/multas de cada policial.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select
                      value={dutyFilterOfficer}
                      onChange={(e) => setDutyFilterOfficer(e.target.value)}
                      style={{ colorScheme: 'dark' }}
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
                      style={{ colorScheme: 'dark' }}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    >
                      <option value="TODOS">Todos os Status</option>
                      <option value="EM_SERVICO">Em Serviço</option>
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
                        <th className="py-2.5 px-3">Viatura / Área</th>
                        <th className="py-2.5 px-3">Início do Turno</th>
                        <th className="py-2.5 px-3">Término do Turno</th>
                        <th className="py-2.5 px-3">Tempo Patrulhado</th>
                        <th className="py-2.5 px-3">Observações / Multas</th>
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
                                <span className="text-emerald-400 italic">Em andamento...</span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-white">
                              {formatDuration(liveSec)}
                            </td>
                            <td className="py-3 px-3 text-slate-300 max-w-xs">
                              {log.summary_notes || '—'}
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

        {activeTab === 'infopen' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    INFOPEN — Fichas Criminais e Antecedentes
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
                            {cit.roblox_nick && (
                              <span className="text-xs text-slate-400">(@{cit.roblox_nick})</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-3">
                            <span>CNH: <strong className={cit.cnh_status === 'Suspensa' ? 'text-rose-400' : 'text-emerald-400'}>{cit.cnh_status}</strong></span>
                            <span>Porte de Arma: <strong className={cit.gun_license ? 'text-emerald-400' : 'text-slate-500'}>{cit.gun_license ? 'Possui' : 'Não possui'}</strong></span>
                            {cit.phone && <span>Tel: <strong className="text-slate-300">{cit.phone}</strong></span>}
                          </div>
                        </div>

                        <select
                          value={cit.wanted_status}
                          onChange={(e) => handleUpdateCitizenStatus(cit, e.target.value)}
                          style={{ colorScheme: 'dark' }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                            cit.wanted_status === 'Procurado'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : cit.wanted_status === 'Preso'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          <option value="Limpo">Limpo</option>
                          <option value="Procurado">Procurado</option>
                          <option value="Preso">Preso</option>
                        </select>
                      </div>

                      <div className="border-t border-slate-800/80 pt-2.5">
                        <div className="text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                          Passagens / Boletins ({(cit.criminal_records || []).length})
                        </div>
                        {(cit.criminal_records || []).length === 0 ? (
                          <p className="text-xs text-slate-500 italic">Nenhuma ocorrência criminal registrada.</p>
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
                            placeholder="Adicionar nova passagem / crime..."
                            value={crimeInput[cit.id] || ''}
                            onChange={(e) => setCrimeInput({ ...crimeInput, [cit.id]: e.target.value })}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCrimeRecord(cit)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                          >
                            Registrar
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
                <Plus className="w-5 h-5 text-emerald-400" />
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
                    placeholder="Ex: Lucas Almeida"
                    value={newCitizen.rp_name}
                    onChange={(e) => setNewCitizen({ ...newCitizen, rp_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nick Roblox</label>
                  <input
                    type="text"
                    placeholder="Ex: lucas_rp"
                    value={newCitizen.roblox_nick}
                    onChange={(e) => setNewCitizen({ ...newCitizen, roblox_nick: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">CNH</label>
                    <select
                      value={newCitizen.cnh_status}
                      onChange={(e) => setNewCitizen({ ...newCitizen, cnh_status: e.target.value })}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white"
                    >
                      <option value="Válida">Válida</option>
                      <option value="Suspensa">Suspensa</option>
                      <option value="Sem CNH">Sem CNH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Status</label>
                    <select
                      value={newCitizen.wanted_status}
                      onChange={(e) => setNewCitizen({ ...newCitizen, wanted_status: e.target.value })}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white"
                    >
                      <option value="Limpo">Limpo</option>
                      <option value="Procurado">Procurado</option>
                      <option value="Preso">Preso</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-slate-300 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCitizen.gun_license}
                    onChange={(e) => setNewCitizen({ ...newCitizen, gun_license: e.target.checked })}
                  />
                  Possui Porte de Arma legalizado
                </label>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition mt-2"
                >
                  Salvar Ficha no INFOPEN
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'veiculos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-400" />
                  RENAVAM — Consulta de Placas e Veículos
                </h2>
                <input
                  type="text"
                  placeholder="Buscar placa (PTN-...), modelo ou proprietário..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white w-full sm:w-64"
                />
              </div>

              <div className="space-y-3">
                {filteredVehicles.map((veh) => (
                  <div key={veh.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-slate-800 text-amber-300 border border-slate-700">
                          {veh.plate}
                        </span>
                        <span className="font-bold text-white text-sm">{veh.model}</span>
                        <span className="text-xs text-slate-400">• {veh.color}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Proprietário: <strong className="text-slate-200">{veh.owner_name}</strong> ({veh.owner_passport})
                      </div>
                      {veh.notes && <div className="text-xs text-slate-500">{veh.notes}</div>}
                    </div>

                    <select
                      value={veh.status}
                      onChange={(e) => handleUpdateVehicleStatus(veh, e.target.value)}
                      style={{ colorScheme: 'dark' }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                        veh.status === 'Roubado/Furtado'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : veh.status === 'Apreendido'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      <option value="Regular">Regular</option>
                      <option value="Roubado/Furtado">Roubado/Furtado</option>
                      <option value="Apreendido">Apreendido</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-emerald-400" />
                Registrar Veículo no RENAVAM
              </h3>
              <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Placa (Ex: PTN-8K20)"
                  value={newVehicle.plate}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
                <input
                  type="text"
                  required
                  placeholder="Modelo (Ex: Lancer Evolution)"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Cor"
                  value={newVehicle.color}
                  onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Nome do Proprietário"
                  value={newVehicle.owner_name}
                  onChange={(e) => setNewVehicle({ ...newVehicle, owner_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Passaporte (Ex: PTN-1002)"
                  value={newVehicle.owner_passport}
                  onChange={(e) => setNewVehicle({ ...newVehicle, owner_passport: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
                <select
                  value={newVehicle.status}
                  onChange={(e) => setNewVehicle({ ...newVehicle, status: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Regular">Regular</option>
                  <option value="Roubado/Furtado">Roubado/Furtado</option>
                  <option value="Apreendido">Apreendido</option>
                </select>
                <input
                  type="text"
                  placeholder="Observações"
                  value={newVehicle.notes}
                  onChange={(e) => setNewVehicle({ ...newVehicle, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition"
                >
                  Cadastrar Veículo
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
                <div>
                  <label className="block text-slate-400 mb-1">Natureza do registro</label>
                  <select
                    value={newReport.report_type}
                    onChange={(e) => setNewReport({ ...newReport, report_type: e.target.value })}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white"
                  >
                    <option value="OCORRENCIA">Ocorrência policial</option>
                    <option value="ABORDAGEM">Abordagem</option>
                    <option value="PERSEGUICAO">Perseguição</option>
                    <option value="APREENSAO">Apreensão</option>
                    <option value="APOIO">Apoio operacional</option>
                    <option value="OUTRO">Outro registro</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Código / Tipo</label>
                    <select
                      value={newReport.incident_code}
                      onChange={(e) => setNewReport({ ...newReport, incident_code: e.target.value })}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white"
                    >
                      <option value="Código 1">Código 1 (Patrulha)</option>
                      <option value="Código 2">Código 2 (Urgência)</option>
                      <option value="Código 3">Código 3 (Emergência / Fuga)</option>
                      <option value="Código 4">Código 4 (Tiroteio / Confronto)</option>
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
                    placeholder="Ex: Túnel de Brookmere, GV e Horton..."
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
                  <label className="block text-slate-400 mb-1">Pessoas Envolvidas</label>
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
                    rows={5}
                    required
                    minLength={20}
                    maxLength={3000}
                    placeholder="Registre os fatos em ordem cronológica: situação inicial, ações dos envolvidos, intervenção policial e desfecho..."
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                  <div className="text-right text-[10px] text-slate-500">{newReport.description.length}/3000 caracteres (mínimo 20)</div>
                </div>

                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/70 p-3 space-y-3">
                  <div>
                    <label className="block text-slate-200 font-semibold mb-1">Evidência da ocorrência (print)</label>
                    <p className="text-[11px] text-slate-500">Envie uma imagem do computador. O recorte será ajustado para 16:9 antes de anexar ao relatório.</p>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 8 * 1024 * 1024) {
                        window.alert('A imagem deve ter no máximo 8 MB.');
                        e.target.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setReportImage(String(reader.result || ''));
                        setReportImageName(file.name);
                        setCropZoom(1);
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="block w-full text-[11px] text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-blue-500"
                  />
                  {reportImage && (
                    <div className="space-y-2">
                      <div className="aspect-video overflow-hidden rounded-lg border border-slate-700 bg-black">
                        <img
                          src={reportImage}
                          alt="Prévia do recorte da evidência"
                          className="h-full w-full object-cover"
                          style={{ objectPosition: 'center', transform: `scale(${cropZoom})` }}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-[11px] text-slate-400">Ajustar aproximação</label>
                        <span className="text-[11px] text-blue-300 font-mono">{cropZoom.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="2.5"
                        step="0.1"
                        value={cropZoom}
                        onChange={(e) => setCropZoom(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-500 truncate">{reportImageName}</span>
                        <button type="button" onClick={() => { setReportImage(''); setReportImageName(''); setCropZoom(1); }} className="text-[11px] text-rose-300 hover:text-rose-200">Remover imagem</button>
                      </div>
                    </div>
                  )}
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
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white"
                    >
                      <option value="Preso">Preso</option>
                      <option value="Abatido em Confronto">Abatido em Confronto</option>
                      <option value="Liberado após Averiguação">Liberado após Averiguação</option>
                      <option value="Suspeito Evadiu">Suspeito Evadiu</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition"
                >
                  Salvar e Enviar para Comando
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Total', value: reports.filter((r) => isHighRank || (r.author_nick || '').toLowerCase() === (currentUser?.roblox_nick || '').toLowerCase()), tone: 'text-slate-100' },
                  { label: 'Pendentes', value: reports.filter((r) => (isHighRank || (r.author_nick || '').toLowerCase() === (currentUser?.roblox_nick || '').toLowerCase()) && (r.review_status || 'PENDENTE') === 'PENDENTE'), tone: 'text-amber-300' },
                  { label: 'Aprovados', value: reports.filter((r) => (isHighRank || (r.author_nick || '').toLowerCase() === (currentUser?.roblox_nick || '').toLowerCase()) && r.review_status === 'APROVADO'), tone: 'text-emerald-300' },
                  { label: 'Reprovados', value: reports.filter((r) => (isHighRank || (r.author_nick || '').toLowerCase() === (currentUser?.roblox_nick || '').toLowerCase()) && r.review_status === 'REPROVADO'), tone: 'text-rose-300' }
                ].map((metric) => (
                  <div key={metric.label} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">{metric.label}</div>
                    <div className={`text-xl font-extrabold ${metric.tone}`}>{metric.value.length}</div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  {isHighRank ? (
                    <>
                      <strong className="text-amber-400">Visão de Comando:</strong> Você visualiza todos os relatórios e pode{' '}
                      <strong className="text-white">Aprovar</strong>, <strong className="text-white">Reprovar</strong> ou <strong className="text-white">Apagar</strong>.
                    </>
                  ) : (
                    <>
                      <strong className="text-blue-400">Acesso Restrito:</strong> Você visualiza apenas os relatórios enviados por você.
                    </>
                  )}
                </div>
                <input
                  type="search"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  placeholder="Buscar por local, policial, envolvido ou descrição..."
                  className="min-w-[220px] flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <select
                  value={reportFilterType}
                  onChange={(e) => setReportFilterType(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                >
                  <option value="TODOS">Todas as naturezas</option>
                  <option value="OCORRENCIA">Ocorrência</option>
                  <option value="ABORDAGEM">Abordagem</option>
                  <option value="PERSEGUICAO">Perseguição</option>
                  <option value="APREENSAO">Apreensão</option>
                  <option value="APOIO">Apoio</option>
                  <option value="OUTRO">Outro</option>
                </select>
                <select
                  value={reportFilterStatus}
                  onChange={(e) => setReportFilterStatus(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="PENDENTE">Pendentes</option>
                  <option value="APROVADO">Aprovados</option>
                  <option value="REPROVADO">Reprovados</option>
                </select>
              </div>

              {reports
                .filter((rep) => {
                  const canView =
                    isHighRank ||
                    (rep.author_nick || '').toLowerCase() === (currentUser?.roblox_nick || '').toLowerCase();
                  if (!canView) return false;

                  const status = rep.review_status || 'PENDENTE';
                  const matchesStatus = reportFilterStatus === 'TODOS' || status === reportFilterStatus;
                  const matchesType = reportFilterType === 'TODOS' || (rep.report_type || 'OCORRENCIA') === reportFilterType;
                  const query = reportSearch.trim().toLocaleLowerCase('pt-BR');
                  const searchable = [rep.location, rep.author_nick, rep.author_rank, rep.involved_officers, rep.involved_citizens, rep.description, rep.incident_code, rep.vtr_prefix, rep.actions_taken, rep.outcome, rep.report_type].join(' ').toLocaleLowerCase('pt-BR');
                  return matchesStatus && matchesType && (!query || searchable.includes(query));
                })
                .map((rep) => {
                  const status = rep.review_status || 'PENDENTE';
                  const isAuthor =
                    (rep.author_nick || '').toLowerCase() === (currentUser?.roblox_nick || '').toLowerCase();
                  const canDelete = isHighRank || isAuthor;

                  return (
                    <div key={rep.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-bold">
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
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">{({ OCORRENCIA: 'OCORRÊNCIA', ABORDAGEM: 'ABORDAGEM', PERSEGUICAO: 'PERSEGUIÇÃO', APREENSAO: 'APREENSÃO', APOIO: 'APOIO', OUTRO: 'OUTRO' })[rep.report_type] || 'OCORRÊNCIA'}</span>
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
                              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Apagar
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="rounded-lg bg-slate-950 border border-slate-800 p-2"><span className="text-slate-500">Viatura</span><div className="text-slate-200 font-semibold">{rep.vtr_prefix || 'Não informada'}</div></div>
                        <div className="rounded-lg bg-slate-950 border border-slate-800 p-2"><span className="text-slate-500">Código operacional</span><div className="text-slate-200 font-semibold">{rep.incident_code || 'Não informado'}</div></div>
                        <div className="rounded-lg bg-slate-950 border border-slate-800 p-2"><span className="text-slate-500">Policiais envolvidos</span><div className="text-slate-200">{rep.involved_officers || 'Não informado'}</div></div>
                        <div className="rounded-lg bg-slate-950 border border-slate-800 p-2"><span className="text-slate-500">Providências</span><div className="text-slate-200">{rep.actions_taken || 'Não informado'}</div></div>
                      </div>
                      <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap">
                        {rep.description}
                      </p>
                      {rep.evidence_image && (
                        <a href={rep.evidence_image} target="_blank" rel="noreferrer" className="block">
                          <img src={rep.evidence_image} alt="Evidência anexada à ocorrência" className="w-full max-h-72 object-contain rounded-lg border border-slate-700 bg-black" />
                        </a>
                      )}

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
                            placeholder="Parecer do Comando (opcional)..."
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

        {activeTab === 'codigo-penal' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-blue-400" />
                Calculadora Penal — Selecione os Artigos Aplicados
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
                            {art.bail ? 'Permite fiança' : 'Inafiançável'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <div className="font-bold text-amber-400">{art.months} meses</div>
                        <div className="text-emerald-400">${art.fine.toLocaleString()}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit space-y-4">
              <h3 className="text-base font-bold text-white">Resumo da Pena & Registro no Ponto</h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Artigos selecionados:</span>
                  <span className="font-mono font-extrabold text-white text-base">{penaltySummary.count}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Tempo de Prisão:</span>
                  <span className="font-mono font-extrabold text-amber-400 text-base">
                    {penaltySummary.totalMonths} meses
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Multa Total:</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-base">
                    ${penaltySummary.totalFine.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Situação de Fiança:</span>
                  <span className={`font-bold ${penaltySummary.hasNonBailable ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {penaltySummary.count === 0 ? '—' : penaltySummary.hasNonBailable ? 'INAFIANÇÁVEL' : 'AFIANÇÁVEL'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">
                    Passaporte, Nome ou Placa do Autuado
                  </label>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    activeShift
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {activeShift ? 'Ponto Ativo' : 'Ponto Fechado'}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Ex: PTN-1001, Nickolas Silva ou PTN-9X88"
                  value={fineTarget}
                  onChange={(e) => setFineTarget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <button
                  type="button"
                  disabled={penaltySummary.count === 0}
                  onClick={handleRegisterShiftFine}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold transition"
                >
                  Aplicar Multa e Registrar no Turno
                </button>
                {fineFeedback && (
                  <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5">
                    {fineFeedback}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedArticles([]);
                  setFineFeedback('');
                }}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Limpar Seleção
              </button>
            </div>
          </div>
        )}

        {activeTab === 'hierarquia' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-5">
              {isHighCommand && (
                <div className="bg-slate-900/95 border border-amber-500/30 rounded-2xl p-5 shadow-lg shadow-black/25">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-amber-400" />
                      Publicar Nota / Parametrização no Mural
                    </h3>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Comando
                    </span>
                  </div>
                  <form onSubmit={handleAddAnnouncement} className="space-y-2.5 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="Título (Ex: PARAMETRIZAÇÃO — RECRUTA...)"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-xl px-3.5 py-2.5 text-white focus:outline-none transition"
                    />
                    <textarea
                      rows={3}
                      required
                      placeholder="Texto oficial da publicação..."
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-xl p-3 text-white focus:outline-none transition"
                    />
                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition shadow-md shadow-amber-950/40"
                    >
                      Publicar no Mural
                    </button>
                  </form>
                </div>
              )}

              <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/35 rounded-2xl p-5 space-y-3.5 shadow-xl shadow-black/30">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/90 pb-3">
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                      <Megaphone className="w-4 h-4 text-amber-400" />
                    </span>
                    Mural de Avisos & Parametrizações
                  </h2>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-950 text-amber-300 border border-slate-800">
                    {announcements.length} {announcements.length === 1 ? 'nota' : 'notas'}
                  </span>
                </div>

                {announcements.length === 0 ? (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-400">
                    Nenhuma nota publicada no mural até o momento.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((a, idx) => (
                      <article
                        key={a.id}
                        className={`rounded-xl p-4 space-y-2 border transition ${
                          idx === 0
                            ? 'bg-slate-950/95 border-amber-500/40 shadow-md shadow-amber-950/20'
                            : 'bg-slate-950/75 border-slate-800/90 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-extrabold tracking-wide text-amber-400 uppercase">
                            {a.title}
                          </span>
                          <div className="flex items-center gap-2">
                            {idx === 0 && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                Recente
                              </span>
                            )}
                            {isHighCommand && (
                              <button
                                type="button"
                                onClick={() => handleDeleteAnnouncement(a)}
                                title="Apagar comunicado"
                                className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Apagar
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                          {a.content}
                        </p>
                        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2">
                          <span>
                            Por <strong className="text-slate-300">@{a.author_nick}</strong>
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {formatDateTime(a.created_at)}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-2.5 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/90 pb-3 mb-1">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </span>
                  Hierarquia Oficial — PM Capital Ville
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {RANKS.length} Postos
                </span>
              </div>

              {RANKS.map((r) => (
                <div
                  key={r.level}
                  className="bg-slate-950/90 hover:bg-slate-950 border border-slate-800/90 hover:border-blue-500/30 rounded-xl px-3.5 py-3 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white">
                      {6 - r.level}. {r.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/25 shrink-0">
                      Nível {r.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {isHighRank && reportToasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm space-y-2.5 pointer-events-none px-4 sm:px-0">
          {reportToasts.map((toast) => (
            <div
              key={toast.toastId}
              className="pointer-events-auto bg-slate-900/95 border border-amber-500/50 rounded-2xl p-4 shadow-2xl shadow-black/70 backdrop-blur-md space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-amber-300 animate-bounce" />
                  </span>
                  <div>
                    <div className="text-[11px] font-mono uppercase font-bold text-amber-300">
                      Novo Relatório Recebido
                    </div>
                    <div className="text-xs font-bold text-white">
                      @{toast.author_nick} • {toast.incident_code}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.toastId)}
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
                  <span>Desfecho: <strong className="text-emerald-400">{toast.outcome}</strong></span>
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
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
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
