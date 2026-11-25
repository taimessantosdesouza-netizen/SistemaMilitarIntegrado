// Utilitários auxiliares do módulo de Bombeiros
export const CBM_CONFIG = {
  corpsName: 'Corpo de Bombeiros Militar de Pantanória',
  badgePrefix: 'BM-',
  themeColor: '#dc2626',
  storageUserKey: 'sigp_pantanoria_bm_user',
};

export function formatFirefighterBadge(number) {
  const clean = String(number ?? '').replace(/\D/g, '');
  return `${CBM_CONFIG.badgePrefix}${clean.padStart(3, '0')}`;
}
