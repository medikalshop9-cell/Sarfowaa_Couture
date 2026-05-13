import { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import api from '../../lib/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, ChevronDown, Check } from 'lucide-react';

/* ── constants ── */
const STATUSES = ['pending_payment', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLES = {
  pending_payment: 'bg-yellow-500/15 text-yellow-300 border-yellow-400/25',
  pending:    'bg-amber-500/15  text-amber-400  border-amber-500/25',
  confirmed:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  processing: 'bg-blue-500/15   text-blue-400   border-blue-500/25',
  shipped:    'bg-purple-500/15 text-purple-400 border-purple-500/25',
  delivered:  'bg-green-500/15  text-green-400  border-green-500/25',
  cancelled:  'bg-red-500/15    text-red-400    border-red-500/25',
};

const STATUS_LABEL = {
  pending_payment: 'Awaiting Payment',
  pending:         'Pending',
  confirmed:       'Confirmed',
  processing:      'Processing',
  shipped:         'Shipped',
  delivered:       'Delivered',
  cancelled:       'Cancelled',
};

const fmt = (p) =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(p || 0);

const fmtDate = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ── Status badge ── */
function StatusBadge({ status }) {
  const s = status || 'pending';
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${STATUS_STYLES[s] || STATUS_STYLES.pending} whitespace-nowrap`}>
      {STATUS_LABEL[s] || s}
    </span>
  );
}

/* ── Sortable column header ── */
function SortHeader({ column, label }) {
  return (
    <button
      className="flex items-center gap-1 hover:text-white transition-colors"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ArrowUpDown size={13} className="text-white/30" />
    </button>
  );
}

/* ── Per-row actions dropdown ── */
function ActionsCell({ row, onStatusChange }) {
  const order = row.original;
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-[#1A1A1A] border border-[#C4973F]/20 rounded-lg shadow-2xl z-50 py-1">
          <p className="text-[10px] tracking-widest uppercase text-white/25 px-3 pt-2 pb-1">Update Status</p>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { onStatusChange(order.id, s); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs capitalize hover:bg-white/5 transition-colors ${
                order.status === s ? 'text-[#C4973F]' : 'text-white/60'
              }`}
            >
              {order.status === s ? <Check size={12} /> : <span className="w-3" />}
              {s}
            </button>
          ))}
          <div className="border-t border-white/5 mt-1 pt-1">
            <button
              onClick={() => { navigator.clipboard.writeText(order.id); toast.success('Order ID copied'); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              Copy Order ID
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Column visibility dropdown ── */
function ColumnsDropdown({ table }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-9 px-4 text-xs text-white/60 border border-white/15 rounded-lg hover:border-white/30 hover:text-white transition-colors"
      >
        Columns <ChevronDown size={13} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-[#1A1A1A] border border-[#C4973F]/20 rounded-lg shadow-2xl z-50 py-2">
          {table.getAllLeafColumns()
            .filter((col) => col.id !== 'select' && col.id !== 'actions')
            .map((col) => (
              <label
                key={col.id}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-white/60 hover:bg-white/5 cursor-pointer capitalize"
              >
                <input
                  type="checkbox"
                  checked={col.getIsVisible()}
                  onChange={col.getToggleVisibilityHandler()}
                  className="accent-[#C4973F] w-3.5 h-3.5 rounded"
                />
                {col.id.replace(/([A-Z])/g, ' $1')}
              </label>
            ))}
        </div>
      )}
    </div>
  );
}

/* ── Main page ── */
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q,
      (snap) => { setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const columns = [
    {
      id: 'select',
      size: 40,
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <input
          type="checkbox"
          className="accent-[#C4973F] w-3.5 h-3.5 cursor-pointer"
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => el && (el.indeterminate = table.getIsSomePageRowsSelected())}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="accent-[#C4973F] w-3.5 h-3.5 cursor-pointer"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      id: 'email',
      accessorFn: (row) => row.customer?.email || '',
      header: ({ column }) => <SortHeader column={column} label="Email" />,
      cell: ({ getValue }) => <span className="text-white/80 text-sm">{getValue() || '—'}</span>,
    },
    {
      id: 'customer',
      accessorFn: (row) => `${row.customer?.firstName || ''} ${row.customer?.lastName || ''}`.trim(),
      header: ({ column }) => <SortHeader column={column} label="Customer" />,
      cell: ({ getValue }) => <span className="text-white/60 text-sm">{getValue() || '—'}</span>,
    },
    {
      accessorKey: 'total',
      header: ({ column }) => (
        <div className="text-right"><SortHeader column={column} label="Amount" /></div>
      ),
      cell: ({ getValue }) => (
        <div className="text-right font-semibold text-[#C4973F] text-sm">{fmt(getValue())}</div>
      ),
    },
    {
      id: 'date',
      accessorFn: (row) => row.createdAt,
      header: ({ column }) => <SortHeader column={column} label="Date" />,
      cell: ({ getValue }) => <span className="text-white/35 text-xs">{fmtDate(getValue())}</span>,
      sortingFn: (a, b) =>
        (a.original.createdAt?.seconds || 0) - (b.original.createdAt?.seconds || 0),
    },
    {
      id: 'orderId',
      accessorFn: (row) => row.orderRef || row.id,
      header: 'Reference',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-[#C4973F]/70 font-mono text-xs">
          {row.original.orderRef || '#' + String(row.original.id).slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      id: 'actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => <ActionsCell row={row} onStatusChange={updateStatus} />,
    },
  ];

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting, columnVisibility, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true,
    globalFilterFn: (row, _colId, value) => {
      const v = value.toLowerCase();
      const email = (row.original.customer?.email || '').toLowerCase();
      const name = `${row.original.customer?.firstName || ''} ${row.original.customer?.lastName || ''}`.toLowerCase();
      return email.includes(v) || name.includes(v) || row.original.id.includes(v);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (loading) return <Loader />;

  const selectedCount = Object.keys(rowSelection).length;
  const totalFiltered = table.getFilteredRowModel().rows.length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A] font-['Playfair_Display']">
          Orders <span className="text-white/25 text-lg font-normal ml-1">({orders.length})</span>
        </h1>

        {/* Status filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['', ...STATUSES].map((s) => {
            const col = table.getColumn('status');
            const active = (col?.getFilterValue() || '') === s;
            return (
              <button
                key={s || 'all'}
                onClick={() => col?.setFilterValue(s || undefined)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize border transition-colors ${
                  active
                    ? 'bg-[#C4973F] text-black border-[#C4973F]'
                    : 'border-white/10 text-white/35 hover:border-white/25 hover:text-white/70'
                }`}
              >
                {s || 'All'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Filter emails..."
          className="h-9 px-4 bg-[#1A1A1A] border border-white/10 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#C4973F]/50 w-72 transition-colors"
        />
        <ColumnsDropdown table={table} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/8 bg-[#111]">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-white/8">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3.5 text-[11px] tracking-[0.14em] uppercase text-white/35 font-semibold whitespace-nowrap"
                    style={{ width: header.column.columnDef.size }}
                  >
                    {!header.isPlaceholder &&
                      flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-white/5 transition-colors ${
                    row.getIsSelected() ? 'bg-[#C4973F]/6' : 'hover:bg-white/3'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-white/25 text-sm">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-white/30">
          {selectedCount} of {totalFiltered} row(s) selected.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-1.5 rounded-lg text-xs border border-white/12 text-white/55 hover:text-white hover:border-white/28 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-white/25 px-1">
            {table.getState().pagination.pageIndex + 1} / {Math.max(1, table.getPageCount())}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-1.5 rounded-lg text-xs border border-white/12 text-white/55 hover:text-white hover:border-white/28 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
