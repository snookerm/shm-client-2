import { config } from '../config';

/**
 * Единый классификатор категорий услуг (single source of truth).
 * Используется и в Services.tsx, и в OrderServiceModal.tsx, чтобы группировка
 * не расходилась между списком услуг и окном заказа.
 *
 * ВАЖЕН ПОРЯДОК: правила mt_* и keenetic стоят ДО regex remna/marzban,
 * иначе mt_remna попадёт в proxy вместо mikrotik.
 */
export function normalizeCategory(category: string): string {
  if (!category) return 'other';

  const proxyCategories = new Set(config.PROXY_CATEGORY.split(',').filter(Boolean));
  const vpnCategories = new Set(config.VPN_CATEGORY.split(',').filter(Boolean));

  if (proxyCategories.has(category)) return 'proxy';
  if (vpnCategories.has(category)) return 'vpn';

  // snookerm: наши категории — ДО hardcoded regex (mt_remna не должен попасть в proxy)
  if (/^mt[-_]/i.test(category)) return 'mikrotik';
  if (/^keenetic/i.test(category)) return 'keenetic';

  if (/remna|remnawave|marzban|marz|mz/i.test(category)) return 'proxy';
  if (/^(vpn|wg|awg)/i.test(category)) return 'vpn';
  if (['web_tariff', 'web', 'mysql', 'mail', 'hosting'].includes(category)) return category;
  return 'other';
}

/**
 * Заголовок группы для нормализованной категории.
 * Приоритет: env-title (config.*_CATEGORY_TITLE) → i18n categories.<key> → ключ.
 */
export function categoryTitle(normalized: string, t: any): string {
  switch (normalized) {
    case 'vpn':
      return config.VPN_CATEGORY_TITLE || t('categories.vpn', 'vpn');
    case 'proxy':
      return config.PROXY_CATEGORY_TITLE || t('categories.proxy', 'proxy');
    case 'mikrotik':
      return config.MIKROTIK_CATEGORY_TITLE || t('categories.mikrotik', 'mikrotik');
    case 'keenetic':
      return config.KEENETIC_CATEGORY_TITLE || t('categories.keenetic', 'keenetic');
    default:
      return t(`categories.${normalized}`, normalized);
  }
}
