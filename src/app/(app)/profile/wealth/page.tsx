'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';
import styles from './wealth.module.css';

type ItemCategory =
  | 'income_active'
  | 'income_passive'
  | 'expense'
  | 'asset'
  | 'liability'
  | 'pension'
  | 'insurance';

interface WealthItem {
  id: string;
  user_id: string;
  category: ItemCategory;
  name: string;
  value: number;
  notes: string | null;
}

interface WealthMeta {
  id?: string;
  user_id: string;
  emergency_fund: number | null;
  will_last_updated: string | null;
}

function formatCurrency(value: number, currency: string): string {
  const abs = Math.abs(value);
  let formatted: string;
  if (abs >= 1000000) {
    formatted = `${(abs / 1000000).toFixed(1)}m`;
  } else if (abs >= 1000) {
    formatted = abs.toLocaleString('en-GB');
  } else {
    formatted = abs.toString();
  }
  return `${value < 0 ? '-' : ''}${currency}${formatted}`;
}

function formatWillDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export default function WealthDetailPage() {
  const [items, setItems] = useState<WealthItem[]>([]);
  const [meta, setMeta] = useState<WealthMeta | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Add item state
  const [addingCategory, setAddingCategory] = useState<ItemCategory | null>(null);
  const [addName, setAddName] = useState('');
  const [addValue, setAddValue] = useState('');

  // Edit item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemValue, setEditItemValue] = useState('');

  // Delete confirmation
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Edit meta state
  const [editingEF, setEditingEF] = useState(false);
  const [editEFValue, setEditEFValue] = useState('');
  const [editingWill, setEditingWill] = useState(false);
  const [editWillDate, setEditWillDate] = useState('');

  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async (uid: string) => {
    const supabase = createClient();
    const [{ data: itemsData }, { data: metaData }] = await Promise.all([
      supabase
        .from('wealth_snapshot_items')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: true }),
      supabase
        .from('wealth_snapshot')
        .select('*')
        .eq('user_id', uid)
        .single(),
    ]);

    setItems(itemsData ?? []);
    setMeta(metaData ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);
      await loadData(user.id);
    }
    init();
  }, [loadData]);

  const currency = profile?.currency || '\u00a3';

  // Filter items
  const incomeActive = items.filter(i => i.category === 'income_active');
  const incomePassive = items.filter(i => i.category === 'income_passive');
  const expenses = items.filter(i => i.category === 'expense');
  const assets = items.filter(i => i.category === 'asset');
  const liabilities = items.filter(i => i.category === 'liability');
  const pensions = items.filter(i => i.category === 'pension');
  const insurances = items.filter(i => i.category === 'insurance');

  // Totals
  const totalIncomeActive = incomeActive.reduce((s, i) => s + (i.value || 0), 0);
  const totalIncomePassive = incomePassive.reduce((s, i) => s + (i.value || 0), 0);
  const totalIncome = totalIncomeActive + totalIncomePassive;
  const totalExpenses = expenses.reduce((s, i) => s + (i.value || 0), 0);
  const netIncome = totalIncome - totalExpenses;
  const totalAssets = assets.reduce((s, i) => s + (i.value || 0), 0);
  const totalLiabilities = liabilities.reduce((s, i) => s + (i.value || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  const totalPensions = pensions.reduce((s, i) => s + (i.value || 0), 0);
  const emergencyFund = meta?.emergency_fund ?? 0;
  const emergencyMonths = totalExpenses > 0 ? Math.floor(emergencyFund / totalExpenses) : 0;

  // Section toggle
  function toggleSection(section: string) {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
    cancelAdd();
    setEditingItemId(null);
    setDeletingItemId(null);
  }

  function closeSection(section: string) {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.delete(section);
      return next;
    });
    cancelAdd();
    setEditingItemId(null);
    setDeletingItemId(null);
  }

  // Add item
  function cancelAdd() {
    setAddingCategory(null);
    setAddName('');
    setAddValue('');
  }

  async function handleAddItem() {
    if (!addingCategory || !addName.trim() || !userId) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('wealth_snapshot_items').insert({
      user_id: userId,
      category: addingCategory,
      name: addName.trim(),
      value: addValue ? parseFloat(addValue) : 0,
    });
    cancelAdd();
    setSaving(false);
    await loadData(userId);
  }

  // Edit item
  function startEditItem(item: WealthItem) {
    setEditingItemId(item.id);
    setEditItemName(item.name);
    setEditItemValue(item.value.toString());
    setDeletingItemId(null);
  }

  async function handleSaveEditItem() {
    if (!editingItemId || !editItemName.trim() || !userId) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('wealth_snapshot_items')
      .update({
        name: editItemName.trim(),
        value: editItemValue ? parseFloat(editItemValue) : 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingItemId);
    setEditingItemId(null);
    setSaving(false);
    await loadData(userId);
  }

  // Delete item
  async function handleDeleteItem(id: string) {
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('wealth_snapshot_items').delete().eq('id', id);
    setDeletingItemId(null);
    setSaving(false);
    await loadData(userId);
  }

  // Save emergency fund
  async function handleSaveEF() {
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('wealth_snapshot').upsert(
      {
        user_id: userId,
        emergency_fund: editEFValue ? parseFloat(editEFValue) : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    setEditingEF(false);
    setSaving(false);
    await loadData(userId);
  }

  // Save will
  async function handleSaveWill() {
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('wealth_snapshot').upsert(
      {
        user_id: userId,
        will_last_updated: editWillDate || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    setEditingWill(false);
    setSaving(false);
    await loadData(userId);
  }

  // Render a single item row
  function renderItem(item: WealthItem, freq?: string) {
    if (editingItemId === item.id) {
      return (
        <div key={item.id} className={styles.inlineForm}>
          <input
            className={styles.inlineInput}
            value={editItemName}
            onChange={(e) => setEditItemName(e.target.value)}
            placeholder="Name"
          />
          <input
            className={styles.inlineNumInput}
            type="number"
            value={editItemValue}
            onChange={(e) => setEditItemValue(e.target.value)}
            placeholder="0"
            step="any"
          />
          <button className={styles.inlineSaveBtn} onClick={handleSaveEditItem} disabled={saving}>
            Save
          </button>
          <button className={styles.inlineCancelBtn} onClick={() => setEditingItemId(null)}>
            Cancel
          </button>
        </div>
      );
    }

    if (deletingItemId === item.id) {
      return (
        <div key={item.id} className={styles.itemRow}>
          <div className={styles.confirmDelete}>
            <span className={styles.confirmText}>Delete {item.name}?</span>
            <button className={styles.confirmYes} onClick={() => handleDeleteItem(item.id)}>
              Yes
            </button>
            <button className={styles.confirmNo} onClick={() => setDeletingItemId(null)}>
              No
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={item.id} className={styles.itemRow} onClick={() => startEditItem(item)}>
        <span className={styles.itemName}>{item.name}</span>
        <div className={styles.itemActions}>
          <span className={styles.itemValue}>
            {formatCurrency(item.value, currency)}
            {freq && <span className={styles.itemFreq}>{freq}</span>}
          </span>
          <button
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              setDeletingItemId(item.id);
            }}
          >
            x
          </button>
        </div>
      </div>
    );
  }

  // Render inline add form
  function renderAddForm(category: ItemCategory) {
    if (addingCategory !== category) return null;
    return (
      <div className={styles.inlineForm}>
        <input
          className={styles.inlineInput}
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
          placeholder="Name"
          autoFocus
        />
        <input
          className={styles.inlineNumInput}
          type="number"
          value={addValue}
          onChange={(e) => setAddValue(e.target.value)}
          placeholder="0"
          step="any"
        />
        <button className={styles.inlineSaveBtn} onClick={handleAddItem} disabled={saving}>
          Save
        </button>
        <button className={styles.inlineCancelBtn} onClick={cancelAdd}>
          Cancel
        </button>
      </div>
    );
  }

  // Render collapsed category
  function renderCollapsedCategory(
    section: string,
    title: string,
    total: number,
    itemCount: number,
    subText?: string,
    freq?: string
  ) {
    return (
      <div className={styles.catBlock}>
        <div className={styles.catHeader}>
          <div className={styles.catLeft}>
            <span className={styles.catTitle}>{title}</span>
            <span className={styles.catSub}>
              {subText || `${itemCount} item${itemCount !== 1 ? 's' : ''}`}
            </span>
            <button className={styles.viewEditBtn} onClick={() => toggleSection(section)}>
              View / Edit
            </button>
          </div>
          <div className={styles.catRight}>
            <span className={styles.catValue}>
              {formatCurrency(total, currency)}
              {freq && <span className={styles.catFreq}>{freq}</span>}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Link href="/profile" className={styles.backLink}>
          {'\u2190'} Profile
        </Link>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/profile" className={styles.backLink}>
        {'\u2190'} Profile
      </Link>
      <h1 className={styles.pageTitle}>Wealth Snapshot</h1>

      {/* ══ INCOME ══ */}
      {!expandedSections.has('income') ? (
        renderCollapsedCategory(
          'income',
          'Income',
          totalIncome,
          incomeActive.length + incomePassive.length,
          `Active ${formatCurrency(totalIncomeActive, currency)}  |  Passive ${formatCurrency(totalIncomePassive, currency)}`,
          '/mo'
        )
      ) : (
        <div className={styles.expanded}>
          <div className={styles.expandedHeader}>
            <span className={styles.expandedTitle}>Income</span>
            <button className={styles.closeBtn} onClick={() => closeSection('income')}>
              Close
            </button>
          </div>

          {incomeActive.length > 0 && (
            <>
              <div className={styles.subCatLabel}>Active Income</div>
              <div className={styles.itemList}>
                {incomeActive.map(item => renderItem(item, '/mo'))}
              </div>
            </>
          )}
          {renderAddForm('income_active')}

          {incomePassive.length > 0 && (
            <>
              <div className={styles.subCatLabel}>Passive Income</div>
              <div className={styles.itemList}>
                {incomePassive.map(item => renderItem(item, '/mo'))}
              </div>
            </>
          )}
          {renderAddForm('income_passive')}

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className={styles.addBtn}
              onClick={() => { cancelAdd(); setAddingCategory('income_active'); }}
            >
              + Active
            </button>
            <button
              className={styles.addBtn}
              onClick={() => { cancelAdd(); setAddingCategory('income_passive'); }}
            >
              + Passive
            </button>
          </div>

          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total Income</span>
            <span className={styles.totalValue}>{formatCurrency(totalIncome, currency)}/mo</span>
          </div>
        </div>
      )}

      {/* ══ EXPENSES ══ */}
      {!expandedSections.has('expenses') ? (
        renderCollapsedCategory(
          'expenses',
          'Expenses',
          totalExpenses,
          expenses.length,
          undefined,
          '/mo'
        )
      ) : (
        <div className={styles.expanded}>
          <div className={styles.expandedHeader}>
            <span className={styles.expandedTitle}>Expenses</span>
            <button className={styles.closeBtn} onClick={() => closeSection('expenses')}>
              Close
            </button>
          </div>
          <div className={styles.itemList}>
            {expenses.map(item => renderItem(item, '/mo'))}
          </div>
          {renderAddForm('expense')}
          <button
            className={styles.addBtn}
            onClick={() => { cancelAdd(); setAddingCategory('expense'); }}
          >
            + Add
          </button>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total Expenses</span>
            <span className={styles.totalValue}>{formatCurrency(totalExpenses, currency)}/mo</span>
          </div>
        </div>
      )}

      {/* Net Income */}
      <div className={styles.netRow}>
        <span className={styles.netLabel}>Net Income</span>
        <span className={styles.netValue}>
          {formatCurrency(netIncome, currency)}
          <span className={styles.netFreq}>/mo</span>
        </span>
      </div>

      <div className={styles.divider} />

      {/* ══ ASSETS ══ */}
      {!expandedSections.has('assets') ? (
        renderCollapsedCategory('assets', 'Assets', totalAssets, assets.length)
      ) : (
        <div className={styles.expanded}>
          <div className={styles.expandedHeader}>
            <span className={styles.expandedTitle}>Assets</span>
            <button className={styles.closeBtn} onClick={() => closeSection('assets')}>
              Close
            </button>
          </div>
          <div className={styles.itemList}>
            {assets.map(item => renderItem(item))}
          </div>
          {renderAddForm('asset')}
          <button
            className={styles.addBtn}
            onClick={() => { cancelAdd(); setAddingCategory('asset'); }}
          >
            + Add
          </button>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total Assets</span>
            <span className={styles.totalValue}>{formatCurrency(totalAssets, currency)}</span>
          </div>
        </div>
      )}

      {/* ══ LIABILITIES ══ */}
      {!expandedSections.has('liabilities') ? (
        renderCollapsedCategory('liabilities', 'Liabilities', totalLiabilities, liabilities.length)
      ) : (
        <div className={styles.expanded}>
          <div className={styles.expandedHeader}>
            <span className={styles.expandedTitle}>Liabilities</span>
            <button className={styles.closeBtn} onClick={() => closeSection('liabilities')}>
              Close
            </button>
          </div>
          <div className={styles.itemList}>
            {liabilities.map(item => renderItem(item))}
          </div>
          {renderAddForm('liability')}
          <button
            className={styles.addBtn}
            onClick={() => { cancelAdd(); setAddingCategory('liability'); }}
          >
            + Add
          </button>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total Liabilities</span>
            <span className={styles.totalValue}>{formatCurrency(totalLiabilities, currency)}</span>
          </div>
        </div>
      )}

      {/* Net Worth */}
      <div className={styles.netRow}>
        <span className={styles.netLabel}>Net Worth</span>
        <span className={styles.netValue}>{formatCurrency(netWorth, currency)}</span>
      </div>

      <div className={styles.divider} />

      {/* ══ EMERGENCY FUND ══ */}
      <div className={styles.catBlock}>
        <div className={styles.catHeader}>
          <div className={styles.catLeft}>
            <span className={styles.catTitle}>Emergency Fund</span>
            {!editingEF && (
              <button
                className={styles.viewEditBtn}
                onClick={() => {
                  setEditEFValue(meta?.emergency_fund?.toString() ?? '');
                  setEditingEF(true);
                }}
              >
                Edit
              </button>
            )}
          </div>
          <div className={styles.catRight}>
            <span className={styles.catValue}>
              {emergencyFund ? formatCurrency(emergencyFund, currency) : '\u2014'}
            </span>
            {emergencyFund > 0 && totalExpenses > 0 && (
              <span className={styles.catSub}>{emergencyMonths} months</span>
            )}
          </div>
        </div>

        {editingEF && (
          <div className={styles.efEditRow}>
            <input
              className={styles.efInput}
              type="number"
              value={editEFValue}
              onChange={(e) => setEditEFValue(e.target.value)}
              placeholder="0"
              step="any"
              autoFocus
            />
            <button className={styles.inlineSaveBtn} onClick={handleSaveEF} disabled={saving}>
              Save
            </button>
            <button className={styles.inlineCancelBtn} onClick={() => setEditingEF(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ══ RETIREMENT ══ */}
      {!expandedSections.has('retirement') ? (
        <div className={styles.catBlock}>
          <div className={styles.catHeader}>
            <div className={styles.catLeft}>
              <span className={styles.catTitle}>Retirement</span>
              <span className={styles.catSub}>
                {pensions.length} item{pensions.length !== 1 ? 's' : ''}
              </span>
              <button className={styles.viewEditBtn} onClick={() => toggleSection('retirement')}>
                View / Edit
              </button>
            </div>
            <div className={styles.catRight}>
              <span className={styles.catValue}>{formatCurrency(totalPensions, currency)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.expanded}>
          <div className={styles.expandedHeader}>
            <span className={styles.expandedTitle}>Retirement</span>
            <button className={styles.closeBtn} onClick={() => closeSection('retirement')}>
              Close
            </button>
          </div>
          <div className={styles.itemList}>
            {pensions.map(item => renderItem(item))}
          </div>
          {renderAddForm('pension')}
          <button
            className={styles.addBtn}
            onClick={() => { cancelAdd(); setAddingCategory('pension'); }}
          >
            + Add
          </button>
          {pensions.length > 0 && (
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalValue}>{formatCurrency(totalPensions, currency)}</span>
            </div>
          )}
        </div>
      )}

      {/* ══ PROTECTION ══ */}
      {!expandedSections.has('protection') ? (
        <div className={styles.catBlock}>
          <div className={styles.catHeader}>
            <div className={styles.catLeft}>
              <span className={styles.catTitle}>Protection</span>
              <span className={styles.catSub}>
                {insurances.length} polic{insurances.length !== 1 ? 'ies' : 'y'}
              </span>
              <button className={styles.viewEditBtn} onClick={() => toggleSection('protection')}>
                View / Edit
              </button>
            </div>
            <div className={styles.catRight}>
              <span className={styles.catValue}>
                {insurances.length} polic{insurances.length !== 1 ? 'ies' : 'y'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.expanded}>
          <div className={styles.expandedHeader}>
            <span className={styles.expandedTitle}>Protection</span>
            <button className={styles.closeBtn} onClick={() => closeSection('protection')}>
              Close
            </button>
          </div>
          <div className={styles.itemList}>
            {insurances.map(item => renderItem(item))}
          </div>
          {renderAddForm('insurance')}
          <button
            className={styles.addBtn}
            onClick={() => { cancelAdd(); setAddingCategory('insurance'); }}
          >
            + Add
          </button>
        </div>
      )}

      {/* ══ WILL ══ */}
      <div className={styles.catBlock}>
        <div className={styles.catHeader}>
          <div className={styles.catLeft}>
            <span className={styles.catTitle}>Will</span>
            {!editingWill && (
              <button
                className={styles.viewEditBtn}
                onClick={() => {
                  setEditWillDate(meta?.will_last_updated ?? '');
                  setEditingWill(true);
                }}
              >
                Edit
              </button>
            )}
          </div>
          <div className={styles.catRight}>
            <span className={styles.metaValueSm}>
              Last: {formatWillDate(meta?.will_last_updated ?? null)}
            </span>
          </div>
        </div>

        {editingWill && (
          <div className={styles.willEditRow}>
            <input
              className={styles.dateInput}
              type="date"
              value={editWillDate}
              onChange={(e) => setEditWillDate(e.target.value)}
              autoFocus
            />
            <button className={styles.inlineSaveBtn} onClick={handleSaveWill} disabled={saving}>
              Save
            </button>
            <button className={styles.inlineCancelBtn} onClick={() => setEditingWill(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
