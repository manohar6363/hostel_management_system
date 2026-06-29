import React, { useState, useEffect } from 'react';
import StaffSidebar from '../components/StaffSidebar';
import '../CSS/dashboard.css';

const API = 'http://localhost:8080/api/fees';

const emptyForm = { studentId: '', amount: '', paymentDate: '' };

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showMarkPaid, setShowMarkPaid] = useState(false); // NEW

  const [form, setForm] = useState(emptyForm);
  const [selectedFee, setSelectedFee] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchFees = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setFees(data);
    } catch (err) {
      setError('Failed to load fees. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFees(); }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const buildPayload = () => ({
    student: { id: form.studentId },
    amount: parseFloat(form.amount),
    paymentDate: form.paymentDate,
  });

  const validate = () => {
    if (!form.studentId || isNaN(Number(form.studentId)))
      return 'Student ID must be a valid number.';
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0)
      return 'Amount must be a positive number.';
    return '';
  };

  // ── Add ──────────────────────────────────────────────────────────────────────
  const openAdd = () => { setForm(emptyForm); setFormError(''); setShowAdd(true); };

  const handleAdd = async () => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setSubmitting(true);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) throw new Error();
      setShowAdd(false);
      fetchFees();
    } catch {
      setFormError('Failed to add fee. Check your input and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const openEdit = (fee) => {
    setSelectedFee(fee);
    setForm({
      studentId: fee.student?.id ?? '',
      amount: fee.amount ?? '',
      paymentDate: fee.paymentDate ?? '',
    });
    setFormError('');
    setShowEdit(true);
  };

  const handleEdit = async () => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/${selectedFee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) throw new Error();
      setShowEdit(false);
      fetchFees();
    } catch {
      setFormError('Failed to update fee. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const openDelete = (fee) => { setSelectedFee(fee); setShowDelete(true); };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/${selectedFee.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setShowDelete(false);
      fetchFees();
    } catch {
      setFormError('Failed to delete fee. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Mark as Paid (NEW) ───────────────────────────────────────────────────────
  const openMarkPaid = (fee) => {
    console.log("Clicked fee =", fee);

    setSelectedFee(fee);
    setFormError('');
    setShowMarkPaid(true);
  };

  const handleMarkPaid = async () => {
    console.log("Selected Fee Object:", selectedFee);
    console.log("Selected Fee ID:", selectedFee?.id);

    const url = `${API}/${selectedFee.id}/pay`;
    console.log("PATCH URL =", url);

    setSubmitting(true);

    try {
      const res = await fetch(url, {
        method: "PATCH",
      });

      console.log("Status =", res.status);

      const text = await res.text();
      console.log("Response =", text);

      if (!res.ok) throw new Error(text);

      setShowMarkPaid(false);
      fetchFees();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div>
      <StaffSidebar>
        <h1 style={{ fontSize: '30px' }}>FEES</h1>

        <div style={styles.toolbar}>
          <button style={styles.addBtn} onClick={openAdd}>+ Add Fee</button>
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        {loading ? (
          <p style={styles.infoText}>Loading fees…</p>
        ) : fees.length === 0 ? (
          <p style={styles.infoText}>No fee records found.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Student ID</th>
                  <th style={styles.th}>Student Name</th>
                  <th style={styles.th}>Amount (₹)</th>
                  <th style={styles.th}>Payment Date</th>
                  <th style={styles.th}>Status</th>  {/* NEW */}
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee, idx) => (
                  <tr key={fee.id} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.td}>{fee.id}</td>
                    <td style={styles.td}>{fee.student?.id ?? '—'}</td>
                    <td style={styles.td}>{fee.student?.name ?? '—'}</td>
                    <td style={styles.td}>
                      {fee.amount != null
                        ? Number(fee.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                        : '—'}
                    </td>
                    <td style={styles.td}>{fee.paymentDate ?? '—'}</td>

                    {/* NEW: Status column */}
                    <td style={styles.td}>
                      <span style={fee.paid ? styles.badgePaid : styles.badgeUnpaid}>
                        {fee.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => openEdit(fee)}>Edit</button>
                      <button style={styles.deleteBtn} onClick={() => openDelete(fee)}>Delete</button>
                      {/* NEW: show only when unpaid */}
                      {!fee.paid && (
                        <button style={styles.paidBtn} onClick={() => openMarkPaid(fee)}>
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Add Modal ──────────────────────────────────────────────────────── */}
        {showAdd && (
          <Modal title="Add Fee" onClose={() => setShowAdd(false)}>
            <FeeForm form={form} onChange={handleChange} error={formError} />
            <ModalFooter
              onCancel={() => setShowAdd(false)}
              onConfirm={handleAdd}
              confirmLabel={submitting ? 'Saving…' : 'Save'}
              disabled={submitting}
            />
          </Modal>
        )}

        {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
        {showEdit && (
          <Modal title={`Edit Fee #${selectedFee?.id}`} onClose={() => setShowEdit(false)}>
            <FeeForm form={form} onChange={handleChange} error={formError} />
            <ModalFooter
              onCancel={() => setShowEdit(false)}
              onConfirm={handleEdit}
              confirmLabel={submitting ? 'Updating…' : 'Update'}
              disabled={submitting}
            />
          </Modal>
        )}

        {/* ── Delete Modal ───────────────────────────────────────────────────── */}
        {showDelete && (
          <Modal title="Confirm Delete" onClose={() => setShowDelete(false)}>
            <p style={{ marginBottom: '16px' }}>
              Are you sure you want to delete <strong>Fee #{selectedFee?.id}</strong>?
              This action cannot be undone.
            </p>
            {formError && <p style={styles.errorText}>{formError}</p>}
            <ModalFooter
              onCancel={() => setShowDelete(false)}
              onConfirm={handleDelete}
              confirmLabel={submitting ? 'Deleting…' : 'Delete'}
              confirmStyle={styles.deleteBtn}
              disabled={submitting}
            />
          </Modal>
        )}

        {/* ── Mark as Paid Modal (NEW) ───────────────────────────────────────── */}
        {showMarkPaid && (
          <Modal title="Confirm Payment" onClose={() => setShowMarkPaid(false)}>
            <p style={{ marginBottom: '16px' }}>
              Are you sure you want to mark <strong>Fee #{selectedFee?.id}</strong> as{' '}
              <strong>Paid</strong>? This action cannot be undone.
            </p>
            {formError && <p style={styles.errorText}>{formError}</p>}
            <ModalFooter
              onCancel={() => setShowMarkPaid(false)}
              onConfirm={handleMarkPaid}
              confirmLabel={submitting ? 'Updating…' : 'Yes, Mark as Paid'}
              confirmStyle={styles.paidBtn}
              disabled={submitting}
            />
          </Modal>
        )}

      </StaffSidebar>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const FeeForm = ({ form, onChange, error }) => (
  <div style={styles.formGrid}>
    <label style={styles.label}>Student ID *</label>
    <input
      style={styles.input}
      type="number"
      name="studentId"
      value={form.studentId}
      onChange={onChange}
      placeholder="e.g. 1"
      min="1"
    />

    <label style={styles.label}>Amount (₹) *</label>
    <input
      style={styles.input}
      type="number"
      name="amount"
      value={form.amount}
      onChange={onChange}
      placeholder="e.g. 5000.00"
      min="0"
      step="0.01"
    />

    <label style={styles.label}>Payment Date</label>
    <input
      style={styles.input}
      type="date"
      name="paymentDate"
      value={form.paymentDate}
      onChange={onChange}
    />

    {error && <p style={{ ...styles.errorText, gridColumn: '1 / -1' }}>{error}</p>}
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div style={styles.overlay}>
    <div style={styles.modal}>
      <div style={styles.modalHeader}>
        <h2 style={styles.modalTitle}>{title}</h2>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const ModalFooter = ({ onCancel, onConfirm, confirmLabel, confirmStyle, disabled }) => (
  <div style={styles.modalFooter}>
    <button style={styles.cancelBtn} onClick={onCancel} disabled={disabled}>Cancel</button>
    <button
      style={confirmStyle || styles.addBtn}
      onClick={onConfirm}
      disabled={disabled}
    >
      {confirmLabel}
    </button>
  </div>
);

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = {
  toolbar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '16px',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    backgroundColor: '#fff',
  },
  thead: {
    backgroundColor: '#2c3e50',
    color: '#fff',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '11px 16px',
    borderBottom: '1px solid #e8e8e8',
    color: '#333',
  },
  trEven: { backgroundColor: '#fff' },
  trOdd: { backgroundColor: '#f7f9fc' },

  // NEW: status badge styles
  badgePaid: {
    backgroundColor: '#e9f7ef',
    color: '#27ae60',
    padding: '3px 10px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '12px',
    display: 'inline-block',
  },
  badgeUnpaid: {
    backgroundColor: '#fdedec',
    color: '#e74c3c',
    padding: '3px 10px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '12px',
    display: 'inline-block',
  },

  addBtn: {
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },
  editBtn: {
    backgroundColor: '#2980b9',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '6px',
    fontSize: '13px',
  },
  deleteBtn: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  // NEW: Mark as Paid button
  paidBtn: {
    backgroundColor: '#f39c12',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginLeft: '6px',
    fontSize: '13px',
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: '#95a5a6',
    color: '#fff',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },

  // Modal
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '28px 32px',
    width: '420px',
    maxWidth: '95vw',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2c3e50',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#666',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '24px',
  },

  // Form
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '130px 1fr',
    gap: '12px 16px',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#444',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
  },

  errorText: {
    color: '#e74c3c',
    fontSize: '13px',
    margin: '4px 0 0',
  },
  infoText: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: '20px',
  },
};

export default Fees;