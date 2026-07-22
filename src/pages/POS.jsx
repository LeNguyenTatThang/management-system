import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

function AddParticle({ id }) {
  return (
    <motion.span
      key={id}
      className="pos-particle"
      initial={{ opacity: 1, y: 0, scale: 1.4, x: '-50%' }}
      animate={{ opacity: 0, y: -40, scale: 0.8 }}
      transition={{ duration: 0.6, ease: 'ease-out' }}
    >+1</motion.span>
  );
}

const cardVariants = {
  idle: { scale: 1, y: 0 },
  hover: { scale: 1, y: -3, boxShadow: 'var(--shadow-md)' },
  tap: { scale: 0.96 },
};

const badgeVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.2, 1],
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

const orderItemVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.28, ease: 'easeIn' } }
};

const checkVariants = {
  initial: { scale: 0, opacity: 0, rotate: -45 },
  animate: { scale: [0, 1.2, 1], opacity: 1, rotate: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

export default function POS() {
  const [order, setOrder]                 = useState([]);
  const [category, setCategory]           = useState('Tất cả');
  const [search, setSearch]               = useState('');
  const [payment, setPayment]             = useState('cash');
  const [particles, setParticles]         = useState({});
  const [paid, setPaid]                   = useState(false);
  const navigate = useNavigate();

  const addToOrder = useCallback((product) => {
    setOrder(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    const key = Date.now();
    setParticles(prev => ({ ...prev, [product.id]: key }));
    setTimeout(() => setParticles(prev => { const n = { ...prev }; delete n[product.id]; return n; }), 650);
  }, []);

  const removeItem = useCallback((id) => {
    setOrder(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = (id, delta) => {
    setOrder(prev => prev.flatMap(item => {
      if (item.id !== id) return [item];
      const newQ = item.quantity + delta;
      if (newQ <= 0) return [];
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
    <div className="pos-container">

      <div className="pos-left">

        <div className="pos-topbar">
          <button onClick={() => navigate('/dashboard')} className="pos-back-btn">
            <ArrowLeft size={16} /> Quay lại
          </button>

          <div className="pos-search-wrapper">
            <Search size={16} className="pos-search-icon" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm món..." className="pos-search-input" />
            {search && (
              <button onClick={() => setSearch('')} className="pos-search-clear"><X size={16} /></button>
            )}
          </div>

          <div className="pos-brand-badge">
            <Coffee size={16} className="text-primary" />
            <span className="pos-brand-text">DEZ LAB</span>
          </div>
        </div>

        <div className="pos-categories">
          {CATEGORIES.map(cat => (
            <button key={cat} className={`cat-btn ${category === cat ? 'cat-active' : 'cat-inactive'}`}
              onClick={() => setCategory(cat)}>{cat}</button>
          ))}
        </div>

        <div className="pos-grid">
          {filtered.map(p => {
            const inOrder = order.find(i => i.id === p.id);
            return (
              <motion.div
                key={p.id}
                className={`product-card card ${inOrder ? 'pos-product-selected' : ''}`}
                variants={cardVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                onClick={() => addToOrder(p)}
                animate={particles[p.id] ? { boxShadow: ['0 0 0 0 rgba(108,17,30,0.4)', '0 0 0 8px rgba(108,17,30,0)', '0 0 0 0 rgba(108,17,30,0)'] } : {}}
                transition={particles[p.id] ? { duration: 0.5 } : {}}
              >
                {particles[p.id] && <AddParticle id={particles[p.id]} />}
                {inOrder && (
                  <motion.div className="pos-product-badge"
                    variants={badgeVariants}
                    initial="initial"
                    animate="animate"
                  >{inOrder.quantity}</motion.div>
                )}
                <div className="pos-product-img" style={{ backgroundImage: `url(${p.image})` }}>
                  <span className="pos-product-category">{p.category}</span>
                </div>
                <div className="pos-product-info">
                  <div className="pos-product-name">{p.name}</div>
                  <div className="pos-product-price">{fmt(p.price)}</div>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <motion.div className="pos-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >Không tìm thấy món nào</motion.div>
          )}
        </div>
      </div>

      <div className="pos-order-panel">
        <div className="pos-order-header">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            <span className="pos-order-title">Đơn hiện tại</span>
          </div>
          {itemCount > 0 && (
            <motion.span className="pos-order-count"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >{itemCount} món</motion.span>
          )}
        </div>
        <div className="pos-order-meta">🪑 Bàn 12 &nbsp;•&nbsp; 🛍 Mang về</div>

        <div className="pos-order-items">
          <AnimatePresence mode="popLayout">
            {order.length === 0 ? (
              <motion.div key="empty" className="pos-order-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Receipt size={40} className="pos-order-empty-icon" />
                <div className="text-sm">Chưa có món nào</div>
                <div className="text-xs text-muted mt-1">Nhấn vào món để thêm vào đơn</div>
              </motion.div>
            ) : (
              order.map(item => (
                <motion.div
                  key={item.id}
                  className="pos-order-item"
                  variants={orderItemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                >
                  <div className="flex items-start justify-between mb-2 gap-1">
                    <span className="pos-order-item-name">{item.name}</span>
                    <span className="pos-order-item-price">{fmt(item.price * item.quantity)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button onClick={() => removeItem(item.id)} className="pos-order-delete">
                      <Trash2 size={13} /> Xóa
                    </button>
                    <div className="pos-qty-group">
                      <button className={`qty-btn ${item.quantity === 1 ? 'qty-btn-danger' : ''}`} onClick={() => updateQuantity(item.id, -1)}><Minus size={13} /></button>
                      <motion.span className="pos-qty-value"
                        key={item.quantity}
                        initial={{ y: -8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.12 }}
                      >{item.quantity}</motion.span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}><Plus size={13} /></button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="pos-order-footer">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Tạm tính</span><span className="font-semibold text-main">{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted mb-2">
            <span>Giảm giá</span><span className="font-semibold text-success">—</span>
          </div>
          <div className="pos-order-total">
            <span className="font-bold text-base">Tổng cộng</span>
            <span className="pos-order-total-amount">{fmt(subtotal)}</span>
          </div>

          <div className="pos-payment-grid">
            {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
              <motion.button key={id} className={`pay-btn ${payment === id ? 'active' : ''}`}
                onClick={() => setPayment(id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </motion.button>
            ))}
          </div>

          <motion.button onClick={handlePay} disabled={order.length === 0}
            className={`pos-pay-btn ${order.length === 0 ? 'pos-pay-disabled' : ''}`}
            whileHover={order.length > 0 ? { scale: 1.02 } : {}}
            whileTap={order.length > 0 ? { scale: 0.98 } : {}}
          >
            {paid ? (
              <motion.span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                initial="initial" animate="animate" variants={checkVariants}
              >
                <CheckCircle size={22} /> Thanh toán thành công!
              </motion.span>
            ) : (
              <>💳 Thanh toán {order.length > 0 ? fmt(subtotal) : ''}</>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
