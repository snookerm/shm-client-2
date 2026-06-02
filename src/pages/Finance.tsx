import { useState, useEffect } from 'react';
import { Stack, Title, Tabs, Text, Center, Loader, Paper, Pagination, LoadingOverlay, ScrollArea, Group } from '@mantine/core';
import { IconCreditCard, IconReceipt, IconGift } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { userApi } from '../api/client';
import DataTable, { Column } from '../components/DataTable';
import { useStore } from '../store/useStore';

interface Payment {
  id: number;
  date: string;
  money: number;
  pay_system_id?: string;
}

interface Withdraw {
  withdraw_id: number;
  user_service_id: number;
  cost: number;
  total: number;
  months: number;
  qnt: number;
  withdraw_date: string;
  end_date: string;
}

const PER_PAGE = 10;

function formatPeriod(value: number, t: ReturnType<typeof useTranslation>['t']) {
  if (!value) return '---';
  const [m, rest = ''] = value.toString().split('.');
  const months = Number(m);
  const days = Number(rest.slice(0, 2) || 0);
  const hours = Number(rest.slice(2, 4) || 0);
  const parts: string[] = [];
  if (months) parts.push(`${months} ${t('common.months')}`);
  if (days) parts.push(`${days} ${t('common.days')}`);
  if (hours) parts.push(`${hours} ${t('common.hours')}`);
  return parts.join(' ');
}

export default function Finance() {
  const { t, i18n } = useTranslation();
  const user = useStore((s) => s.user);
  const [tab, setTab] = useState<string | null>('payments');

  // --- Платежи ---
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payLoaded, setPayLoaded] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [payPage, setPayPage] = useState(1);
  const [payTotal, setPayTotal] = useState(0);
  const [paySort, setPaySort] = useState<{ field: string; dir: 'asc' | 'desc' }>({ field: '', dir: 'asc' });

  const fetchPayments = async (p: number, field?: string, dir?: 'asc' | 'desc') => {
    setPayLoading(true);
    try {
      const response = await userApi.getPayments({
        limit: PER_PAGE,
        offset: (p - 1) * PER_PAGE,
        ...(field ? { sort_field: field, sort_direction: dir || 'asc' } : {}),
        filter: { money: { '>': 0 } },
      });
      setPayments(response.data.data || []);
      if (typeof response.data.items === 'number') setPayTotal(response.data.items);
    } catch {
    } finally {
      setPayLoading(false);
      setPayLoaded(true);
    }
  };

  useEffect(() => {
    if (tab === 'payments' && !payLoaded) fetchPayments(1);
  }, [tab, payLoaded]);

  useEffect(() => {
    if (payLoaded) fetchPayments(payPage, paySort.field, paySort.dir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payPage, paySort.field, paySort.dir]);

  const payColumns: Column<Payment>[] = [
    {
      title: t('payments.date'),
      accessor: (p) => (p.date ? new Date(p.date).toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US') : '-'),
      sortable: true,
      sortKey: 'date',
    },
    { title: t('payments.paymentSystem'), accessor: 'pay_system_id' },
    {
      title: t('payments.amount'),
      accessor: (p) => (
        <Text size="sm" fw={500} c={p.money > 0 ? 'green' : 'red'}>
          {p.money > 0 ? '+' : ''}{p.money} {t('common.currency')}
        </Text>
      ),
      align: 'right',
      sortable: true,
      sortKey: 'money',
    },
  ];

  // --- Списания ---
  const [withdrawals, setWithdrawals] = useState<Withdraw[]>([]);
  const [wdLoaded, setWdLoaded] = useState(false);
  const [wdLoading, setWdLoading] = useState(false);
  const [wdPage, setWdPage] = useState(1);
  const [wdTotal, setWdTotal] = useState(0);
  const [wdSort, setWdSort] = useState<{ field: string; dir: 'asc' | 'desc' }>({ field: '', dir: 'asc' });

  const fetchWithdrawals = async (p: number, field?: string, dir?: 'asc' | 'desc') => {
    setWdLoading(true);
    try {
      const response = await userApi.getWithdrawals({
        limit: PER_PAGE,
        offset: (p - 1) * PER_PAGE,
        ...(field ? { sort_field: field, sort_direction: dir || 'asc' } : {}),
        filter: { total: { '!=': 0 } },
      });
      setWithdrawals(response.data.data || []);
      if (typeof response.data.items === 'number') setWdTotal(response.data.items);
    } catch {
    } finally {
      setWdLoading(false);
      setWdLoaded(true);
    }
  };

  useEffect(() => {
    if (tab === 'withdrawals' && !wdLoaded) fetchWithdrawals(1);
  }, [tab, wdLoaded]);

  useEffect(() => {
    if (wdLoaded) fetchWithdrawals(wdPage, wdSort.field, wdSort.dir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wdPage, wdSort.field, wdSort.dir]);

  const wdColumns: Column<Withdraw>[] = [
    {
      title: t('withdrawals.withdrawDate'),
      accessor: (w) => (w.withdraw_date ? new Date(w.withdraw_date).toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US') : '-'),
      sortable: true,
      sortKey: 'withdraw_date',
    },
    {
      title: t('withdrawals.endDate'),
      accessor: (w) => (w.end_date ? new Date(w.end_date).toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US') : '-'),
      sortable: true,
      sortKey: 'end_date',
    },
    {
      title: t('services.cost'),
      accessor: (w) => <Text size="sm">{w.cost} {t('common.currency')}</Text>,
      sortable: true,
      sortKey: 'cost',
    },
    {
      title: t('withdrawals.total'),
      accessor: (w) => (
        <Text size="sm" fw={500} c="red" style={{ whiteSpace: 'nowrap' }}>
          {w.total && w.total > 0 ? '-' : ''}{w.total} {t('common.currency')}
        </Text>
      ),
      sortable: true,
      sortKey: 'total',
    },
    {
      title: t('order.period'),
      accessor: (w) => (
        <Text size="sm" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {formatPeriod(w.months, t)}{w.qnt && w.qnt > 1 ? ` × ${w.qnt}` : ''}
        </Text>
      ),
      sortable: true,
      sortKey: 'months',
      width: 160,
    },
  ];

  const payTotalPages = Math.ceil(payTotal / PER_PAGE);
  const wdTotalPages = Math.ceil(wdTotal / PER_PAGE);

  return (
    <Stack gap="lg">
      <Title order={2}>{t('nav.finance')}</Title>

      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="payments" leftSection={<IconCreditCard size={16} />}>{t('nav.payments')}</Tabs.Tab>
          <Tabs.Tab value="withdrawals" leftSection={<IconReceipt size={16} />}>{t('nav.withdrawals')}</Tabs.Tab>
          <Tabs.Tab value="bonus" leftSection={<IconGift size={16} />}>{t('profile.bonus')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="payments" pt="md">
          {!payLoaded ? (
            <Center h={160}><Loader size="lg" /></Center>
          ) : payments.length === 0 ? (
            <Paper p="xl" radius="md"><Center><Text c="dimmed">{t('payments.historyEmpty')}</Text></Center></Paper>
          ) : (
            <Stack gap="md">
              <Paper withBorder radius="md" style={{ overflow: 'hidden', position: 'relative' }}>
                <LoadingOverlay visible={payLoading} overlayProps={{ blur: 1 }} />
                <ScrollArea>
                  <DataTable
                    data={payments}
                    columns={payColumns}
                    sortField={paySort.field}
                    sortDirection={paySort.dir}
                    onSort={(field, dir) => { setPaySort({ field, dir }); setPayPage(1); }}
                  />
                </ScrollArea>
              </Paper>
              {payTotalPages > 1 && <Center><Pagination total={payTotalPages} value={payPage} onChange={setPayPage} /></Center>}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="withdrawals" pt="md">
          {!wdLoaded ? (
            <Center h={160}><Loader size="lg" /></Center>
          ) : withdrawals.length === 0 ? (
            <Paper p="xl" radius="md"><Center><Text c="dimmed">{t('withdrawals.historyEmpty')}</Text></Center></Paper>
          ) : (
            <Stack gap="md">
              <Paper withBorder radius="md" style={{ overflow: 'hidden', position: 'relative' }}>
                <LoadingOverlay visible={wdLoading} overlayProps={{ blur: 1 }} />
                <ScrollArea>
                  <DataTable
                    data={withdrawals}
                    columns={wdColumns}
                    sortField={wdSort.field}
                    sortDirection={wdSort.dir}
                    onSort={(field, dir) => { setWdSort({ field, dir }); setWdPage(1); }}
                  />
                </ScrollArea>
              </Paper>
              {wdTotalPages > 1 && <Center><Pagination total={wdTotalPages} value={wdPage} onChange={setWdPage} /></Center>}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="bonus" pt="md">
          <Paper withBorder radius="md" p="lg">
            <Group justify="space-between" align="center">
              <Group gap="xs"><IconGift size={22} color="#37b24d" /><Text fw={500}>{t('profile.bonus')}</Text></Group>
              <Text size="xl" fw={700} c="teal">{user?.bonus ?? 0} {t('common.currency')}</Text>
            </Group>
            <Text size="xs" c="dimmed" mt="sm">{t('finance.bonusHint', 'Бонусы списываются автоматически при оплате услуг. История начислений — скоро.')}</Text>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
