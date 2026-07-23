import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { products, mockVouchers, mockPromotions } from '../../data/mockData';
import { Search, Plus, Minus, Trash2, ArrowLeft, ShoppingBag, Coffee, Receipt, CreditCard, Banknote, Smartphone, X, CheckCircle, Tag, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormTextarea from '../../components/ui/FormTextarea';

const CATEGORIES = ['Tất cả', 'Cà phê', 'Trà', 'Trà sữa', 'Đá xay', 'Nước ép'];

const SIZES = [
  { key: 'small', label: 'Nhỏ', priceAdjust: -2000 },
  { key: 'medium', label: 'Vừa', priceAdjust: 0 },
  { key: 'large', label: 'Lớn', priceAdjust: 5000 },
];

const SWEETNESS_LEVELS = [
  { value: 0, label: '0%' },
  { value: 30, label: '30%' },
  { value: 50, label: '50%' },
  { value: 70, label: '70%' },
  { value: 100, label: '100%' },
];

const PAYMENT_METHODS = [
  { id: 'cash',     label: 'Tiền mặt',      icon: Banknote },
  { id: 'transfer', label: 'Chuyển khoản',  icon: Smartphone },
  { id: 'card',     label: 'Thẻ',           icon: CreditCard },
];

const activeVouchers = mockVouchers.filter(v => v.status === 'active');

let itemCounter = 0;
function nextId() {
  itemCounter += 1;
  return `oi_${Date.now()}_${itemCounter}`;
}

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
  const [order, setOrder] = useState([]);
  const [category, setCategory] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const [payment, setPayment] = useState('cash');
  const [particles, setParticles] = useState({});
  const [paid, setPaid] = useState(false);
  const [customizeProduct, setCustomizeProduct] = useState(null);
  const [customizeSize, setCustomizeSize] = useState('medium');
  const [customizeSweetness, setCustomizeSweetness] = useState(50);
  const [customizeNote, setCustomizeNote] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  const openCustomize = useCallback((product) => {
    setCustomizeProduct(product);
    setCustomizeSize('medium');
    setCustomizeSweetness(50);
    setCustomizeNote('');
  }, []);

  const closeCustomize = useCallback(() => {
    setCustomizeProduct(null);
  }, []);

  const addCustomizedItem = useCallback(() => {
    if (!customizeProduct) return;
    const sizeInfo = SIZES.find(s => s.key === customizeSize);
    const adjustedPrice = customizeProduct.price + (sizeInfo?.priceAdjust || 0);
    const activePromos = mockPromotions.filter(p =>
      p.status === 'active' &&
      (p.applyTo === 'product' ? p.productIds.includes(customizeProduct.id) : p.categoryIds.includes(customizeProduct.category))
    );
    const promo = activePromos.length > 0 ? { discount: activePromos[0].value, label: activePromos[0].name } : null;
    const item = {
      id: nextId(),
      productId: customizeProduct.id,
      name: customizeProduct.name,
      image: customizeProduct.image,
      category: customizeProduct.category,
      size: customizeSize,
      sizeLabel: sizeInfo?.label || 'Vừa',
      sweetness: customizeSweetness,
      note: customizeNote,
      quantity: 1,
      originalPrice: adjustedPrice,
      promotionDiscount: promo ? promo.discount : 0,
      promotionLabel: promo ? promo.label : null,
      finalPrice: adjustedPrice - (promo ? promo.discount : 0),
    };
    setOrder(prev => [...prev, item]);
    const key = Date.now();
    setParticles(prev => ({ ...prev, [customizeProduct.id]: key }));
    setTimeout(() => setParticles(prev => { const n = { ...prev }; delete n[customizeProduct.id]; return n; }), 650);
    setCustomizeProduct(null);
  }, [customizeProduct, customizeSize, customizeSweetness, customizeNote]);

  const removeItem = useCallback((id) => {
    setOrder(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id, delta) => {
    setOrder(prev => prev.flatMap(item => {
      if (item.id !== id) return [item];
      const newQ = item.quantity + delta;
      if (newQ <= 0) return [];
      return [{ ...item, quantity: newQ }];
    }));
  }, []);

  const applyCoupon = useCallback(() => {
    const code = couponCode.trim().toUpperCase();
    if (!code) { setCouponError('Vui lòng nhập mã giảm giá'); setAppliedCoupon(null); return; }
    const found = activeVouchers.find(c => c.code === code);
    if (!found) { setCouponError('Mã giảm giá không hợp lệ'); setAppliedCoupon(null); return; }
    const subtotal = order.reduce((s, i) => s + i.finalPrice * i.quantity, 0);
    if (subtotal < found.minOrder) {
      setCouponError(`Đơn tối thiểu ${fmt(found.minOrder)} để áp dụng mã này`);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(found);
    setCouponError('');
  }, [couponCode, order]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  }, []);

  const handlePay = () => {
    setPaid(true);
    setTimeout(() => { setOrder([]); setPaid(false); removeCoupon(); }, 2200);
  };

  const subtotal = order.reduce((s, i) => s + i.finalPrice * i.quantity, 0);
  const totalPromotionDiscount = order.reduce((s, i) => s + (i.promotionDiscount || 0) * i.quantity, 0);
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'fixed') {
      couponDiscount = appliedCoupon.value;
    } else if (appliedCoupon.type === 'percent') {
      couponDiscount = Math.round(subtotal * appliedCoupon.value / 100);
      if (appliedCoupon.maxDiscount) couponDiscount = Math.min(couponDiscount, appliedCoupon.maxDiscount);
    }
  }
  const grandTotal = Math.max(0, subtotal - couponDiscount);
  const itemCount = order.reduce((s, i) => s + i.quantity, 0);

  const filtered = products.filter(p =>
    (category === 'Tất cả' || p.category === category) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const sizeLabel = (key) => SIZES.find(s => s.key === key)?.label || key;
  const sweetnessLabel = (v) => `${v}%`;

  return (
    <div className="pos-container">

      {/* CUSTOMIZATION MODAL */}
      {customizeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={closeCustomize}>
          <div className="card animate-fade-slide-in w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-bg overflow-hidden flex-shrink-0">
                  {customizeProduct.image ? (
                    <img src={customizeProduct.image} alt={customizeProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted"><Coffee size={24} /></div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base truncate">{customizeProduct.name}</h3>
                  <p className="text-sm text-primary font-bold">{fmt(customizeProduct.price)}</p>
                </div>
              </div>
              <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={closeCustomize}>×</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Size</label>
                <div className="flex items-center gap-2">
                  {SIZES.map(s => {
                    const adjusted = customizeProduct.price + s.priceAdjust;
                    return (
                      <button key={s.key}
                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-semibold transition ${customizeSize === s.key ? 'border-primary bg-primary-light text-primary' : 'border-gray-200 text-muted hover-border-primary'}`}
                        onClick={() => setCustomizeSize(s.key)}
                      >
                        <div>{s.label}</div>
                        <div className="text-xs font-normal">{adjusted >= customizeProduct.price ? '+' : ''}{fmt(s.priceAdjust)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Độ ngọt</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {SWEETNESS_LEVELS.map(s => (
                    <button key={s.value}
                      className={`py-1.5 px-4 rounded-lg border text-sm font-semibold transition ${customizeSweetness === s.value ? 'border-primary bg-primary-light text-primary' : 'border-gray-200 text-muted hover-border-primary'}`}
                      onClick={() => setCustomizeSweetness(s.value)}
                    >{s.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Ghi chú thêm</label>
                <FormTextarea placeholder="Ít đá, không đá, thêm topping..."
                  rows={3}
                  value={customizeNote} onChange={e => setCustomizeNote(e.target.value)} />
              </div>
              <div className="flex gap-3 mt-2">
                <button className="btn flex-1 modal-btn" onClick={closeCustomize}>Hủy</button>
                <button className="btn btn-primary flex-1 modal-btn" onClick={addCustomizedItem}>Thêm vào đơn</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          {filtered.map(p => (
            <motion.div
              key={p.id}
              className="product-card card p-0 flex flex-col overflow-hidden rounded-xl"
              variants={cardVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              onClick={() => openCustomize(p)}
              animate={particles[p.id] ? { boxShadow: ['0 0 0 0 rgba(108,17,30,0.4)', '0 0 0 8px rgba(108,17,30,0)', '0 0 0 0 rgba(108,17,30,0)'] } : {}}
              transition={particles[p.id] ? { duration: 0.5 } : {}}
            >
              {particles[p.id] && <AddParticle id={particles[p.id]} />}
              <div className="relative w-full h-40 md:h-48 bg-bg overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted"><Coffee size={40} /></div>
                )}
                <span className="absolute bottom-2 left-2 badge badge-neutral text-xs bg-white/90">{p.category}</span>
              </div>
              <div className="p-3 flex flex-col gap-0.5">
                <div className="font-bold text-sm break-words leading-tight">{p.name}</div>
                <div className="font-bold text-base text-primary">{fmt(p.price)}</div>
              </div>
            </motion.div>
          ))}
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
                  <div className="flex items-start justify-between mb-1 gap-1">
                    <span className="pos-order-item-name text-sm">{item.name}</span>
                    <span className="pos-order-item-price text-sm">{fmt(item.finalPrice * item.quantity)}</span>
                  </div>
                  <div className="text-xs text-muted mb-2">
                    {item.sizeLabel && <div>Size: {item.sizeLabel}</div>}
                    <div className="mt-0.5">Đường: {sweetnessLabel(item.sweetness)}</div>
                    {item.note && <div className="mt-0.5">Ghi chú: {item.note}</div>}
                  </div>
                  {item.promotionDiscount > 0 && (
                    <div className="text-xs font-semibold text-success mb-2 flex items-center gap-1">
                      <Tag size={12} /> {item.promotionLabel || 'KM'}: -{fmt(item.promotionDiscount)}
                    </div>
                  )}
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
          {order.length > 0 && (
            <>
              <div className="mb-3">
                <label className="text-xs font-semibold text-muted mb-1.5 block">Mã giảm giá</label>
                <div className="flex items-center gap-2">
                  {appliedCoupon ? (
                    <div className="flex-1 flex items-center justify-between bg-success-light px-3 py-2 rounded-lg">
                      <div>
                        <span className="text-sm font-bold text-success">{appliedCoupon.code}</span>
                        <span className="text-xs text-muted ml-2">{appliedCoupon.description}</span>
                      </div>
                      <button className="text-muted hover-text-danger cursor-pointer" onClick={removeCoupon}><X size={16} /></button>
                    </div>
                  ) : (
                    <>
                      <input type="text" placeholder="Nhập mã giảm giá" className="flex-1 h-36px text-sm"
                        value={couponCode} onChange={e => setCouponCode(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyCoupon()} />
                      <button className="btn btn-primary text-xs h-36px px-3 whitespace-nowrap" onClick={applyCoupon}>Áp dụng</button>
                    </>
                  )}
                </div>
                {couponError && <p className="text-xs text-danger mt-1">{couponError}</p>}
              </div>

              <div className="text-xs mb-2">
                <div className="flex justify-between text-muted">
                  <span>Tạm tính</span><span className="font-semibold text-main">{fmt(subtotal)}</span>
                </div>
                {totalPromotionDiscount > 0 && (
                  <div className="flex justify-between text-muted mt-1">
                    <span>Giảm giá khuyến mãi</span><span className="font-semibold text-success">-{fmt(totalPromotionDiscount)}</span>
                  </div>
                )}
                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex justify-between text-muted mt-1">
                    <span>Mã giảm giá</span><span className="font-semibold text-success">-{fmt(couponDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="pos-order-total">
                <span className="font-bold text-base">Tổng cộng</span>
                <span className="pos-order-total-amount">{fmt(grandTotal)}</span>
              </div>
            </>
          )}

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
              <>💳 Thanh toán {order.length > 0 ? fmt(grandTotal) : ''}</>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
