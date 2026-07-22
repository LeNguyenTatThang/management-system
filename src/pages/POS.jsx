import { useState, useRef, useCallback } from 'react';
import { products } from '../data/mockData';
import { Search, Plus, Minus, Trash2, ArrowLeft, ShoppingBag, Coffee, Receipt, CreditCard, Banknote, Smartphone, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Tất cả', 'Cà phê', 'Trà', 'Trà sữa', 'Đá xay', 'Nước ép'];

const PAYMENT_METHODS = [
  { id: 'cash',     label: 'Tiền mặt',      icon: Banknote },
  { id: 'transfer', label: 'Chuyển khoản',  icon: Smartphone },
  { id: 'card',     label: 'Thẻ',           icon: CreditCard },
];

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

/* Floating "+1" particle that animates when adding an item */
function AddParticle({ id }) {
  return (
    <span
      key={id}
      style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        fontSize: 20, fontWeight: 800, color: 'var(--primary)',
        animation: 'floatUp 0.6s ease forwards',
        zIndex: 20,
      }}
    >+1</span>
  );
}

export default function POS() {
  const [order, setOrder]                 = useState([]);
  const [category, setCategory]           = useState('Tất cả');
  const [search, setSearch]               = useState('');
  const [payment, setPayment]             = useState('cash');
  const [particles, setParticles]         = useState({});   // { productId: animKey }
  const [removingIds, setRemovingIds]     = useState(new Set());
  const [paid, setPaid]                   = useState(false);
  const navigate = useNavigate();

  /* ---------- add with particle animation ---------- */
  const addToOrder = useCallback((product) => {
    setOrder(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    // spawn particle
    const key = Date.now();
    setParticles(prev => ({ ...prev, [product.id]: key }));
    setTimeout(() => setParticles(prev => { const n = { ...prev }; delete n[product.id]; return n; }), 650);
  }, []);

  /* ---------- remove with slide-out animation ---------- */
  const removeItem = useCallback((id) => {
    setRemovingIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      setOrder(prev => prev.filter(i => i.id !== id));
      setRemovingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }, 280);
  }, []);

  const updateQuantity = (id, delta) => {
    setOrder(prev => prev.flatMap(item => {
      if (item.id !== id) return [item];
      const newQ = item.quantity + delta;
      if (newQ <= 0) { removeItem(id); return [item]; }
      return [{ ...item, quantity: newQ }];
    }));
  };

  const handlePay = () => {
    setPaid(true);
    setTimeout(() => { setOrder([]); setPaid(false); }, 2200);
  };

  const subtotal  = order.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = order.reduce((s, i) => s + i.quantity, 0);

  const filtered = products.filter(p =>
    (category === 'Tất cả' || p.category === category) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)', overflow: 'hidden', fontFamily: 'var(--font-sans)' }}>

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.4); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-40px) scale(0.8); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0) scaleY(1); max-height: 120px; }
          to   { opacity: 0; transform: translateX(20px) scaleY(0); max-height: 0; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.92); opacity: 0; }
          70%  { transform: scale(1.04); }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes checkBounce {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes cardPulse {
          0%   { box-shadow: 0 0 0 0 rgba(108,17,30,0.4); }
          70%  { box-shadow: 0 0 0 8px rgba(108,17,30,0); }
          100% { box-shadow: 0 0 0 0 rgba(108,17,30,0); }
        }
        .product-card {
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          position: relative;
          overflow: hidden;
        }
        .product-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .product-card:active { transform: scale(0.96); }
        .product-card.added { animation: cardPulse 0.5s ease; }
        .order-item-enter { animation: slideIn 0.25s ease forwards; }
        .order-item-exit  { animation: slideOut 0.28s ease forwards; overflow: hidden; }
        .cat-btn { transition: all 0.18s ease; border: none; cursor: pointer; font-weight: 600; font-size: 0.82rem; padding: 7px 16px; border-radius: 20px; white-space: nowrap; }
        .pay-btn { transition: all 0.15s ease; border: 1.5px solid var(--border-color); border-radius: 10px; padding: 10px 8px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .pay-btn.active { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }
        .qty-btn { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; transition: background 0.12s; }
        .qty-btn:hover { background: rgba(108,17,30,0.1); color: var(--primary); }
      `}</style>

      {/* ─── LEFT: product grid ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 20 }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1.5px solid var(--border-color)', background: '#fff', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>

          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm món..."
              style={{ paddingLeft: 38, height: 42, width: '100%', borderRadius: 12, fontSize: 14 }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(108,17,30,0.07)', padding: '6px 14px', borderRadius: 12 }}>
            <Coffee size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 15 }}>DEZ LAB</span>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className="cat-btn"
              onClick={() => setCategory(cat)}
              style={{
                backgroundColor: category === cat ? 'var(--primary)' : '#fff',
                color: category === cat ? '#fff' : 'var(--text-secondary)',
                boxShadow: category === cat ? 'var(--shadow-primary)' : 'var(--shadow-sm)',
              }}
            >{cat}</button>
          ))}
        </div>

        {/* Product grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, overflowY: 'auto', paddingRight: 4, alignContent: 'start' }}>
          {filtered.map(p => {
            const inOrder = order.find(i => i.id === p.id);
            return (
              <div
                key={p.id}
                className={`product-card card ${particles[p.id] ? 'added' : ''}`}
                style={{ padding: 0, overflow: 'hidden', border: inOrder ? '2px solid var(--primary)' : '1.5px solid rgba(0,0,0,0.06)' }}
                onClick={() => addToOrder(p)}
              >
                {/* Particle */}
                {particles[p.id] && <AddParticle id={particles[p.id]} />}

                {/* Badge */}
                {inOrder && (
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, zIndex: 10, animation: 'popIn 0.2s ease' }}>
                    {inOrder.quantity}
                  </div>
                )}

                <div style={{ height: 110, backgroundImage: `url(${p.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  {/* Category chip */}
                  <span style={{ position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
                    {p.category}
                  </span>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary)' }}>{fmt(p.price)}</div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: 40, fontSize: 14 }}>
              Không tìm thấy món nào
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT: order panel ─── */}
      <div style={{ width: 340, background: '#fff', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-color)', height: '100%' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>Đơn hiện tại</span>
            </div>
            {itemCount > 0 && (
              <span style={{ backgroundColor: 'var(--primary)', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 800, padding: '2px 10px' }}>
                {itemCount} món
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>🪑 Bàn 12 &nbsp;•&nbsp; 🛍 Mang về</div>
        </div>

        {/* Order items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {order.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Receipt size={40} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <div style={{ fontSize: 13 }}>Chưa có món nào</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Nhấn vào món để thêm vào đơn</div>
            </div>
          ) : (
            order.map(item => (
              <div
                key={item.id}
                className={removingIds.has(item.id) ? 'order-item-exit' : 'order-item-enter'}
                style={{ backgroundColor: '#f8f5f0', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(108,17,30,0.08)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', flex: 1, marginRight: 6 }}>{item.name}</span>
                  <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{fmt(item.price * item.quantity)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}
                  >
                    <Trash2 size={13} /> Xóa
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1.5px solid var(--border-color)', borderRadius: 10, padding: 3 }}>
                    <button className="qty-btn" style={{ background: item.quantity === 1 ? 'rgba(239,68,68,0.08)' : 'transparent', color: item.quantity === 1 ? 'var(--danger)' : 'inherit' }} onClick={() => updateQuantity(item.id, -1)}>
                      <Minus size={13} />
                    </button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: summary + payment */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-soft)', backgroundColor: '#fafafa' }}>
          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>Tạm tính</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{fmt(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
            <span>Giảm giá</span>
            <span style={{ fontWeight: 600, color: 'var(--success)' }}>—</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingTop: 10, borderTop: '1px dashed var(--border-color)' }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Tổng cộng</span>
            <span style={{ fontWeight: 900, fontSize: 22, color: 'var(--primary)' }}>{fmt(subtotal)}</span>
          </div>

          {/* Payment method */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
            {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`pay-btn ${payment === id ? 'active' : ''}`} onClick={() => setPayment(id)}
                style={{ background: payment === id ? 'rgba(108,17,30,0.07)' : '#fff' }}>
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={order.length === 0}
            style={{
              width: '100%', height: 50, borderRadius: 14, border: 'none',
              backgroundColor: order.length === 0 ? '#e5e7eb' : 'var(--primary)',
              color: order.length === 0 ? 'var(--text-muted)' : '#fff',
              fontWeight: 800, fontSize: 16, cursor: order.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: order.length > 0 ? 'var(--shadow-primary)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {paid ? (
              <>
                <CheckCircle size={22} style={{ animation: 'checkBounce 0.4s ease' }} />
                Thanh toán thành công!
              </>
            ) : (
              <>💳 Thanh toán {order.length > 0 ? fmt(subtotal) : ''}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
