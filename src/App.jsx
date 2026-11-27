import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Bell, X } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { INITIAL_OFFICERS } from './constants/officers';
import { INITIAL_CITIZENS } from './constants/citizens';
import { INITIAL_VEHICLES } from './constants/vehicles';
import { INITIAL_REPORTS } from './constants/reports';
import { INITIAL_DUTY_LOGS } from './constants/dutyLogs';
import { INITIAL_ANNOUNCEMENTS } from './constants/announcements';
import { PENAL_ARTICLES } from './constants/penalArticles';
import { RANKS } from './constants/ranks';
import { formatDateTime, formatDuration } from './utils/formatters';
import Login from './pages/Login';
import { createCroppedEvidence } from './utils/imageCropper';
import Header from './components/layout/Header';
import AltoComando from './pages/AltoComando';
import Dashboard from './pages/Dashboard';
import Infopen from './pages/Infopen';
import Renavam from './pages/Renavam';
import Relatorios from './pages/Relatorios';
import CodigoPenal from './pages/CodigoPenal';
import Hierarquia from './pages/Hierarquia';

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
          crime: `Multa/Autuação: ${art.code} — ${art.name} ($${(art.fine ?? 0).toLocaleString()})`,
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
      <Login
        loginIdentifier={loginIdentifier}
        setLoginIdentifier={setLoginIdentifier}
        loginPin={loginPin}
        setLoginPin={setLoginPin}
        loginError={loginError}
        onSubmit={handleLogin}
        onQuickFill={(id, pin) => {
          setLoginIdentifier(id);
          setLoginPin(pin);
        }}
        isSupabaseConfigured={isSupabaseConfigured}
      />
    );
  }

  const elapsedSeconds = activeShift
    ? Math.floor((nowTick - new Date(activeShift.started_at).getTime()) / 1000)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
  
<Header
  currentUser={currentUser}
  globalSearch={globalSearch}
  setGlobalSearch={setGlobalSearch}
  activeShift={activeShift}
  activeShiftFines={activeShiftFines}
  elapsedSeconds={elapsedSeconds}
  isHighRank={isHighRank}
  isHighCommand={isHighCommand}
  soundEnabled={soundEnabled}
  setSoundEnabled={setSoundEnabled}
  soundEnabledRef={soundEnabledRef}
  unlockAudioContext={unlockAudioContext}
  playNotificationSound={playNotificationSound}
  handleLogout={handleLogout}
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  activeShiftsAll={activeShiftsAll}
  pendingReportsCount={pendingReportsCount}
/>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        
{activeTab === 'comando' && isHighCommand && (
  <AltoComando
    currentUser={currentUser}
    activeShiftsAll={activeShiftsAll}
    officers={officers}
    pendingReportsCount={pendingReportsCount}
    isHighRank={isHighRank}
    cmdReportsFolderOpen={cmdReportsFolderOpen}
    setCmdReportsFolderOpen={setCmdReportsFolderOpen}
    reports={reports}
    cmdReportFilterStatus={cmdReportFilterStatus}
    setCmdReportFilterStatus={setCmdReportFilterStatus}
    copyDiscordFormat={copyDiscordFormat}
    formatReportForDiscord={formatReportForDiscord}
    copiedId={copiedId}
    handleDeleteReport={handleDeleteReport}
    cmdReviewNotesMap={cmdReviewNotesMap}
    setCmdReviewNotesMap={setCmdReviewNotesMap}
    handleReviewReport={handleReviewReport}
    handleAddOfficer={handleAddOfficer}
    newOfficer={newOfficer}
    setNewOfficer={setNewOfficer}
  />
)}
       
{activeTab === 'operacional' && (
  <Dashboard
    activeShift={activeShift}
    vtrPrefix={vtrPrefix}
    setVtrPrefix={setVtrPrefix}
    patrolArea={patrolArea}
    setPatrolArea={setPatrolArea}
    handleStartShift={handleStartShift}
    elapsedSeconds={elapsedSeconds}
    shiftSummary={shiftSummary}
    setShiftSummary={setShiftSummary}
    activeShiftFines={activeShiftFines}
    handleEndShift={handleEndShift}
    dutyLogs={dutyLogs}
    currentUser={currentUser}
    copyDiscordFormat={copyDiscordFormat}
    formatDutyForDiscord={formatDutyForDiscord}
    copiedId={copiedId}
    activeShiftsAll={activeShiftsAll}
    isHighCommand={isHighCommand}
    dutyFilterOfficer={dutyFilterOfficer}
    setDutyFilterOfficer={setDutyFilterOfficer}
    officers={officers}
    dutyFilterStatus={dutyFilterStatus}
    setDutyFilterStatus={setDutyFilterStatus}
    filteredDutyLogs={filteredDutyLogs}
    nowTick={nowTick}
  />
)}
    
{activeTab === 'infopen' && (
  <Infopen
    citizenSearch={citizenSearch}
    setCitizenSearch={setCitizenSearch}
    filteredCitizens={filteredCitizens}
    handleUpdateCitizenStatus={handleUpdateCitizenStatus}
    crimeInput={crimeInput}
    setCrimeInput={setCrimeInput}
    handleAddCrimeRecord={handleAddCrimeRecord}
    handleAddCitizen={handleAddCitizen}
    newCitizen={newCitizen}
    setNewCitizen={setNewCitizen}
  />
)}
        
{activeTab === 'veiculos' && (
  <Renavam
    vehicleSearch={vehicleSearch}
    setVehicleSearch={setVehicleSearch}
    filteredVehicles={filteredVehicles}
  />
)}
        
{activeTab === 'relatorios' && (
  <Relatorios
    handleAddReport={handleAddReport}
    newReport={newReport}
    setNewReport={setNewReport}
    reportImage={reportImage}
    setReportImage={setReportImage}
    reportImageName={reportImageName}
    setReportImageName={setReportImageName}
    cropZoom={cropZoom}
    setCropZoom={setCropZoom}
    reports={reports}
    isHighRank={isHighRank}
    currentUser={currentUser}
    reportSearch={reportSearch}
    setReportSearch={setReportSearch}
    reportFilterType={reportFilterType}
    setReportFilterType={setReportFilterType}
    reportFilterStatus={reportFilterStatus}
    setReportFilterStatus={setReportFilterStatus}
    copyDiscordFormat={copyDiscordFormat}
    formatReportForDiscord={formatReportForDiscord}
    copiedId={copiedId}
    handleDeleteReport={handleDeleteReport}
    reviewNotesMap={reviewNotesMap}
    setReviewNotesMap={setReviewNotesMap}
    handleReviewReport={handleReviewReport}
  />
)}
      
{activeTab === 'codigo-penal' && (
  <CodigoPenal
    selectedArticles={selectedArticles}
    setSelectedArticles={setSelectedArticles}
    penaltySummary={penaltySummary}
    activeShift={activeShift}
    fineTarget={fineTarget}
    setFineTarget={setFineTarget}
    handleRegisterShiftFine={handleRegisterShiftFine}
    fineFeedback={fineFeedback}
    setFineFeedback={setFineFeedback}
  />
)}
       
{activeTab === 'hierarquia' && (
  <Hierarquia
    isHighCommand={isHighCommand}
    handleAddAnnouncement={handleAddAnnouncement}
    newAnnouncement={newAnnouncement}
    setNewAnnouncement={setNewAnnouncement}
    announcements={announcements}
    handleDeleteAnnouncement={handleDeleteAnnouncement}
  />
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
