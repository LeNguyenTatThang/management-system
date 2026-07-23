import { useState, useEffect } from 'react';
import { useIngredient } from '../../contexts/IngredientContext';
import { X } from 'lucide-react';

export default function IngredientModal({ ingredient, onSave, onClose }) {
  const { ingredients } = useIngredient();
  const isEditing = !!ingredient;

  const [ingredientId, setIngredientId] = useState(ingredient?.ingredientId || '');
  const [amount, setAmount] = useState(ingredient?.amount || '');
  const [errors, setErrors] = useState({});

  const selectedIngredient = ingredients.find(i => i.id === ingredientId);
  const unit = selectedIngredient?.unit || '';

  useEffect(() => {
    if (ingredient) {
      setIngredientId(ingredient.ingredientId || '');
      setAmount(ingredient.amount || '');
    }
  }, [ingredient]);

  const validate = () => {
    const errs = {};
    if (!ingredientId) errs.ingredientId = 'Vui lòng chọn nguyên liệu';
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errs.amount = 'Định lượng phải lớn hơn 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      ingredientId,
      amount: Number(amount),
      note: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={onClose}>
      <div className="card animate-fade-slide-in w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 gap-4">
          <h3 className="font-bold text-lg truncate">{isEditing ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'}</h3>
          <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={onClose}>×</button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Tên NVL <span className="text-danger">*</span></label>
            <select className={`w-full modal-input ${errors.ingredientId ? 'border-danger' : ''}`}
              value={ingredientId} onChange={e => setIngredientId(e.target.value)}>
              <option value="">-- Chọn nguyên liệu --</option>
              {ingredients.filter(i => i.active).map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
            {errors.ingredientId && <p className="text-xs text-danger mt-1">{errors.ingredientId}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Định lượng <span className="text-danger">*</span></label>
            <div className="flex items-center gap-2">
              <input type="number" min="0" step="0.1" placeholder="Nhập định lượng..."
                className={`flex-1 modal-input ${errors.amount ? 'border-danger' : ''}`}
                value={amount} onChange={e => setAmount(e.target.value)} />
              <span className="text-sm font-semibold text-muted min-w-10 whitespace-nowrap">{unit || 'ĐV'}</span>
            </div>
            {errors.amount && <p className="text-xs text-danger mt-1">{errors.amount}</p>}
          </div>
          <div className="flex gap-3 mt-2">
            <button className="btn flex-1 modal-btn" onClick={onClose}>Hủy</button>
            <button className="btn btn-primary flex-1 modal-btn" onClick={handleSave}>
              {isEditing ? 'Lưu thay đổi' : 'Thêm nguyên liệu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
