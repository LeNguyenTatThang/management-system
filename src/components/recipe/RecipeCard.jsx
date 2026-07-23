import { Edit3, Trash2, UtensilsCrossed, ChefHat, Package } from 'lucide-react';
import { useIngredient } from '../../contexts/IngredientContext';

export default function RecipeCard({ item, product, onClick, onEdit, onDelete }) {
  const { ingredients: allIngredients } = useIngredient();

  const getIngredientName = (id) => allIngredients.find(i => i.id === id)?.name || id;
  const getIngredientUnit = (id) => allIngredients.find(i => i.id === id)?.unit || '';

  const hasInstructions = item.instructions && item.instructions.length > 0;
  const hasIngredients = item.ingredients && item.ingredients.length > 0;

  const handleClick = () => {
    if (onClick) onClick();
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  return (
    <div className="card p-0 flex flex-col min-w-0 cursor-pointer transition recipe-card-hover" onClick={handleClick}>
      <div className="flex items-center gap-3 p-4 min-w-0">
        <div className="w-20 h-20 rounded-lg bg-bg overflow-hidden flex-shrink-0">
          {item.image ? (
            <img src={item.image} alt={item.productName || item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted"><UtensilsCrossed size={28} /></div>
          )}
        </div>
        <div className="min-w-0 flex-1 self-center">
          <div className="font-bold text-base break-words">{item.productName || item.name}</div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {item.category && <span className="badge badge-neutral text-xs">{item.category}</span>}
            {product?.size && <span className="badge badge-neutral text-xs">{product.size}</span>}
          </div>
          {product?.tags && product.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {product.tags.map((t, i) => (
                <span key={i} className="text-xs text-muted bg-gray-100 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>
        {(product?.price || item.price) && (
          <div className="flex-shrink-0 text-right self-center flex flex-col justify-center min-w-0" onClick={e => e.stopPropagation()}>
            <div className="text-xs text-muted">Giá bán</div>
            <div className="font-bold text-sm text-primary whitespace-nowrap">{(product?.price || item.price)?.toLocaleString('vi-VN')}đ</div>
            {product?.cost && (
              <>
                <div className="text-xs text-muted mt-1">Giá vốn</div>
                <div className="font-semibold text-xs whitespace-nowrap">{product.cost.toLocaleString('vi-VN')}đ</div>
              </>
            )}
            {product?.fc && (
              <div className="mt-1">
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-primary-light text-primary">{product.fc}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-rose-50 border-t border-b border-soft">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-primary mb-2">
          <ChefHat size={14} /> Cách làm
        </div>
        {hasInstructions ? (
          <ol className="list-decimal pl-4 text-xs text-main space-y-1">
            {item.instructions.map((step, i) => (
              <li key={i} className="break-words">{step}</li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-muted italic">Chưa có hướng dẫn.</p>
        )}
      </div>

      <div className="p-4 pt-3 flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-primary mb-2">
          <Package size={14} /> Nguyên liệu
        </div>
        {hasIngredients ? (
          <div className="w-full min-w-0">
            <table style={{ minWidth: 0 }} className="w-full text-xs">
              <thead>
                <tr className="text-muted">
                  <th className="text-left font-semibold py-1 pr-2" style={{width:'45%'}}>NVL</th>
                  <th className="text-right font-semibold py-1 px-2 whitespace-nowrap" style={{width:'55px'}}>Lượng</th>
                  <th className="text-left font-semibold py-1 px-2" style={{width:'40px'}}>ĐV</th>
                  <th className="text-left font-semibold py-1 pl-2">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {item.ingredients.map((ing, i) => (
                  <tr key={i} className="border-t border-soft">
                    <td className="py-1.5 pr-2 break-words">{getIngredientName(ing.ingredientId || ing.id)}</td>
                    <td className="text-right py-1.5 px-2 font-semibold whitespace-nowrap">{ing.amount}</td>
                    <td className="py-1.5 px-2">{getIngredientUnit(ing.ingredientId || ing.id)}</td>
                    <td className="py-1.5 pl-2 text-muted break-words">{ing.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted italic">Chưa có nguyên liệu.</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-1 px-4 py-2 border-t border-soft bg-gray-50">
        <button className="p-1.5 text-muted hover-text-primary cursor-pointer" title="Chỉnh sửa" onClick={handleEdit}><Edit3 size={15} /></button>
        <button className="p-1.5 text-muted hover-text-danger cursor-pointer" title="Xóa" onClick={handleDelete}><Trash2 size={15} /></button>
      </div>
    </div>
  );
}
