import { Edit3, Trash2, UtensilsCrossed, ChefHat, Package } from 'lucide-react';

export default function RecipeCard({ item, product, onClick, onEdit, onDelete }) {
  const hasIngredients = item.ingredients && item.ingredients.length > 0;
  const instructions = item.instructions ? item.instructions.split('\n').filter(Boolean) : [];

  return (
    <div className="card flex flex-col min-w-0 cursor-pointer transition recipe-card-hover" onClick={onClick}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-20 h-20 rounded-lg bg-bg overflow-hidden flex-shrink-0">
          {item.image || product?.image ? (
            <img src={item.image || product?.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted"><UtensilsCrossed size={28} /></div>
          )}
        </div>
        <div className="min-w-0 flex-1 self-center">
          <div className="font-bold text-base break-words">{item.name}</div>
          {product && (
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {product.name && <span className="badge badge-neutral text-xs">{product.name}</span>}
            </div>
          )}
          {item.description && (
            <p className="text-xs text-muted mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>
        {product?.price && (
          <div className="flex-shrink-0 text-right self-center flex flex-col justify-center min-w-0" onClick={e => e.stopPropagation()}>
            <div className="text-xs text-muted">Giá bán</div>
            <div className="font-bold text-sm text-primary whitespace-nowrap">{product.price?.toLocaleString('vi-VN')}đ</div>
            {product.costPrice && (
              <>
                <div className="text-xs text-muted mt-1">Giá vốn</div>
                <div className="font-semibold text-xs whitespace-nowrap">{product.costPrice.toLocaleString('vi-VN')}đ</div>
              </>
            )}
          </div>
        )}
      </div>

      {instructions.length > 0 && (
        <div className="px-3 py-3 bg-rose-50 border-t border-b border-soft rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-primary mb-2">
            <ChefHat size={14} /> Cách làm
          </div>
          <ol className="list-decimal pl-4 text-xs text-main space-y-1">
            {instructions.map((step, i) => (
              <li key={i} className="break-words">{step}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="px-3 pt-2 pb-2 flex-1 min-w-0">
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
                    <td className="py-1.5 pr-2 break-words">{ing.ingredientName}</td>
                    <td className="text-right py-1.5 px-2 font-semibold whitespace-nowrap">{ing.quantity}</td>
                    <td className="py-1.5 px-2">{ing.unitSymbol || ing.unitName}</td>
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

      <div className="flex items-center justify-end gap-1 px-3 py-2 border-t border-soft bg-gray-50">
        <button className="p-1.5 text-muted hover-text-primary cursor-pointer" title="Chỉnh sửa" onClick={onEdit}><Edit3 size={15} /></button>
        <button className="p-1.5 text-muted hover-text-danger cursor-pointer" title="Xóa" onClick={onDelete}><Trash2 size={15} /></button>
      </div>
    </div>
  );
}
