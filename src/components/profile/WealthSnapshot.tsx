'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import styles from './WealthSnapshot.module.css';

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

interface Props {
  userId: string;
  currency: string;
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

export default function WealthSnapshot({ userId, currency }: Props) {
  const [items, setItems] = useState<WealthItem[]>([]);
  const [meta, setMeta] = useState<WealthMeta | null>(null);
  const [loading, setLoading] = useState(true);

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

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const [{ data: itemsData }, { data: metaData }] = await Promise.all([
      supabase
        .from('wealth_snapshot_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),
      supabase
        .from('wealth_snapshot')
        .select('*')
        .eq('user_id', userId)
        .single(),
    ]);

    setItems(itemsData ?? []);
    setMeta(metaData ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter items by category
  const incomeActive = items.filter((i) => i.category === 'income_active');
  const incomePassive = items.filter((i) => i.category === 'income_passive');
  const expenses = items.filter((i) => i.category === 'expense');
  const assets = items.filter((i) => i.category === 'asset');
  const liabilities = items.filter((i) => i.category === 'liability');
  const pensions = items.filter((i) => i.category === 'pension');
  const insurances = items.filter((i) => i.category === 'insurance');

  // Calculated totals
  const totalIncomeActive = incomeActive.reduce((sum, i) => sum + (i.value || 0), 0);
  const totalIncomePassive = incomePassive.reduce((sum, i) => sum + (i.value || 0), 0);
  const totalIncome = totalIncomeActive + totalIncomePassive;
  const totalExpenses = expenses.reduce((sum, i) => sum + (i.value || 0), 0);
  const netIncome = totalIncome - totalExpenses;
  const totalAssets = assets.reduce((sum, i) => sum + (i.value || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, i) => sum + (i.value || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  const totalPensions = pensions.reduce((sum, i) => sum + (i.value || 0), 0);
  const emergencyFund = meta?.emergency_fund ?? 0;
  const emergencyMonths = totalExpenses > 0 ? Math.floor(emergencyFund / totalExpenses) : 0;

  // Add item
  async function handleAddItem() {
    if (!addingCategory || !addName.trim()) return;
    setSaving(true);
    const supabase = createClient();

    await supabase.from('wealth_snapshot_items').insert({
      user_id: userId,
      category: addingCategory,
      name: addName.trim(),
      value: addValue ? parseFloat(addValue) : 0,
    });

    setAddingCategory(null);
    setAddName('');
    setAddValue('');
    setSaving(false);
    await loadData();
  }

  // Start editing an item
  function startEditItem(item: WealthItem) {
    setEditingItemId(item.id);
    setEditItemName(item.name);
    setEditItemValue(item.value.toString());
    setDeletingItemId(null);
  }

  // Save edited item
  async function handleSaveEditItem() {
    if (!editingItemId || !editItemName.trim()) return;
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
    await loadData();
  }

  // Delete item
  async function handleDeleteItem(id: string) {
    setSaving(true);
    const supabase = createClient();
    await supabase.from('wealth_snapshot_items').delete().eq('id', id);
    setDeletingItemId(null);
    setSaving(false);
    await loadData();
  }

  // Save emergency fund
  async function handleSaveEF() {
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
    await loadData();
  }

  // Save will date
  async function handleSaveWill() {
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
    await loadData();
  }

  function cancelAdd() {
    setAddingCategory(null);
    setAddName('');
    setAddValue('');
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

  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Wealth Snapshot</div>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Wealth Snapshot</div>

      {/* ══ INCOME ══ */}
      <div className={styles.catHeader}>
        <span className={styles.catTitle}>Income</span>
        <button
          className={styles.addBtn}
          onClick={() => {
            cancelAdd();
            setAddingCategory('income_active');
          }}
          title="Add income item"
        >
          +
        </button>
      </div>

      {incomeActive.length > 0 && (
        <>
          <div className={styles.subCatLabel}>Active Income</div>
          <div className={styles.itemList}>
            {incomeActive.map((item) => renderItem(item, '/mo'))}
          </div>
        </>
      )}

      {addingCategory === 'income_active' && renderAddForm('income_active')}

      {incomePassive.length > 0 && (
        <>
          <div className={styles.subCatLabel}>Passive Income</div>
          <div className={styles.itemList}>
            {incomePassive.map((item) => renderItem(item, '/mo'))}
          </div>
        </>
      )}

      {addingCategory === 'income_passive' && renderAddForm('income_passive')}

      {/* Offer both sub-categories when adding */}
      {addingCategory === 'income_active' && (
        <button
          className={styles.addBtn}
          style={{ marginTop: 4, fontSize: 10, width: 'auto', padding: '4px 8px', height: 'auto' }}
          onClick={() => setAddingCategory('income_passive')}
          title="Add passive income instead"
        >
          + Passive
        </button>
      )}

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total Income</span>
        <span className={styles.totalValue}>{formatCurrency(totalIncome, currency)}/mo</span>
      </div>

      {/* ══ EXPENSES ══ */}
      <div className={styles.catHeader}>
        <span className={styles.catTitle}>Expenses</span>
        <button
          className={styles.addBtn}
          onClick={() => {
            cancelAdd();
            setAddingCategory('expense');
          }}
          title="Add expense"
        >
          +
        </button>
      </div>

      <div className={styles.itemList}>
        {expenses.map((item) => renderItem(item, '/mo'))}
      </div>
      {renderAddForm('expense')}

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total Expenses</span>
        <span className={styles.totalValue}>{formatCurrency(totalExpenses, currency)}/mo</span>
      </div>

      {/* Net Income */}
      <div className={styles.netRow}>
        <span className={styles.netLabel}>Net Income</span>
        <span className={styles.netValue}>
          {formatCurrency(netIncome, currency)}/mo
          <span className={styles.netMeta}>calculated</span>
        </span>
      </div>

      <div className={styles.divider} />

      {/* ══ ASSETS ══ */}
      <div className={styles.catHeader}>
        <span className={styles.catTitle}>Assets</span>
        <button
          className={styles.addBtn}
          onClick={() => {
            cancelAdd();
            setAddingCategory('asset');
          }}
          title="Add asset"
        >
          +
        </button>
      </div>

      <div className={styles.itemList}>
        {assets.map((item) => renderItem(item))}
      </div>
      {renderAddForm('asset')}

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total Assets</span>
        <span className={styles.totalValue}>{formatCurrency(totalAssets, currency)}</span>
      </div>

      {/* ══ LIABILITIES ══ */}
      <div className={styles.catHeader}>
        <span className={styles.catTitle}>Liabilities</span>
        <button
          className={styles.addBtn}
          onClick={() => {
            cancelAdd();
            setAddingCategory('liability');
          }}
          title="Add liability"
        >
          +
        </button>
      </div>

      <div className={styles.itemList}>
        {liabilities.map((item) => renderItem(item))}
      </div>
      {renderAddForm('liability')}

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total Liabilities</span>
        <span className={styles.totalValue}>{formatCurrency(totalLiabilities, currency)}</span>
      </div>

      {/* Net Worth */}
      <div className={styles.netRow}>
        <span className={styles.netLabel}>Net Worth</span>
        <span className={styles.netValue}>
          {formatCurrency(netWorth, currency)}
          <span className={styles.netMeta}>calculated</span>
        </span>
      </div>

      <div className={styles.divider} />

      {/* ══ EMERGENCY FUND ══ */}
      <div className={styles.catHeader}>
        <span className={styles.catTitle}>Emergency Fund</span>
        {!editingEF && (
          <button
            className={styles.editBtn}
            onClick={() => {
              setEditEFValue(meta?.emergency_fund?.toString() ?? '');
              setEditingEF(true);
            }}
          >
            Edit
          </button>
        )}
      </div>

      {!editingEF ? (
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Balance</span>
          <div className={styles.metaRight}>
            <span className={styles.metaValue}>
              {emergencyFund ? formatCurrency(emergencyFund, currency) : '\u2014'}
            </span>
            {emergencyFund > 0 && totalExpenses > 0 && (
              <span className={styles.metaSub}>{emergencyMonths} months</span>
            )}
          </div>
        </div>
      ) : (
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

      {/* ══ RETIREMENT ══ */}
      <div className={styles.catHeader}>
        <span className={styles.catTitle}>Retirement</span>
        <button
          className={styles.addBtn}
          onClick={() => {
            cancelAdd();
            setAddingCategory('pension');
          }}
          title="Add pension"
        >
          +
        </button>
      </div>

      <div className={styles.itemList}>
        {pensions.map((item) => renderItem(item))}
      </div>
      {renderAddForm('pension')}

      {pensions.length > 0 && (
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalValue}>{formatCurrency(totalPensions, currency)}</span>
        </div>
      )}

      {/* ══ PROTECTION ══ */}
      <div className={styles.catHeader}>
        <span className={styles.catTitle}>Protection</span>
        <button
          className={styles.addBtn}
          onClick={() => {
            cancelAdd();
            setAddingCategory('insurance');
          }}
          title="Add insurance"
        >
          +
        </button>
      </div>

      <div className={styles.itemList}>
        {insurances.map((item) => renderItem(item))}
      </div>
      {renderAddForm('insurance')}

      {/* ══ WILL ══ */}
      <div className={styles.catHeader}>
        <span className={styles.catTitle}>Will</span>
        {!editingWill && (
          <button
            className={styles.editBtn}
            onClick={() => {
              setEditWillDate(meta?.will_last_updated ?? '');
              setEditingWill(true);
            }}
          >
            Edit
          </button>
        )}
      </div>

      {!editingWill ? (
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Last Updated</span>
          <span className={styles.metaValueSm}>
            {formatWillDate(meta?.will_last_updated ?? null)}
          </span>
        </div>
      ) : (
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
  );
}
