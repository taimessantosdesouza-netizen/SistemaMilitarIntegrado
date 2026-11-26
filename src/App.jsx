import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Shield, Lock, LogOut, Radio, Users, Car, FileText, AlertTriangle,
  CheckCircle2, Clock, Search, Plus, Copy, Check, Award,
  UserCheck, KeyRound, Scale, Megaphone, Database,
  Activity, ShieldAlert, Folder, FolderOpen, Trash2, ChevronDown, ChevronUp,
  Bell, X, Volume2, ArrowLeft
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
