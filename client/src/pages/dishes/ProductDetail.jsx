import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMenuProduct } from '../../contexts/MenuProductContext';
import { useAuth } from '../../contexts/AuthContext';
import PageContainer from '../../components/layout/PageContainer';
import { toast } from 'react-hot-toast';
import { UtensilsCrossed, Package } from 'lucide-react';

const STATUS_CONFIG = {
  active: { label: 'Đang bán', badge: 'badge-success' },
  inactive: { label: 'Ngừng bán', badge: 'badge-danger' },
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, removeProduct } = useMenuProduct();
  const { hasPermission } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getProductById(id);
      if (!data) {
        toast.error('Không tìm thấy món');
        navigate('/products');
        return;
      }
      setProduct(data);
      setLoading(false);
    })();
  }, [id, getProductById, navigate]);

  const handleDelete = async () => {
    if (!window.confirm(`Xóa món "${product.name}"?`)) return;
    try {
      await removeProduct(product.id);
      toast.success('Đã xóa món');
      navigate('/products');
    } catch (e) {
      toast.error(e.message || 'Không thể xóa');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted">Đang tải thông tin món...</p>
        </div>
      </PageContainer>
    );
  }

  if (!product) return null;

  const cfg = STATUS_CONFIG[product.status] || STATUS_CONFIG.active;

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Chi tiết món</h2>
          <div className="flex items-center gap-2">
            {hasPermission('product.product.update') && (
              <button className="btn btn-primary" onClick={() => navigate(`/products/${id}/edit`)}>
                Chỉnh sửa
              </button>
            )}
            {hasPermission('product.product.delete') && (
              <button className="btn btn-danger" onClick={handleDelete}>Xóa</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-xl bg-bg overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted"><UtensilsCrossed size={28} /></div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{product.name}</h3>
                  <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted block mb-1">Giá bán</span>
                  <span className="font-bold text-primary text-base">{product.price?.toLocaleString('vi-VN')}đ</span>
                </div>
                {product.costPrice && (
                  <div>
                    <span className="text-muted block mb-1">Giá vốn</span>
                    <span className="font-bold text-base">{product.costPrice?.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                {product.size && (
                  <div>
                    <span className="text-muted block mb-1">Kích thước</span>
                    <span className="font-bold text-base">{product.size}</span>
                  </div>
                )}
                {product.categoryName && (
                  <div>
                    <span className="text-muted block mb-1">Danh mục</span>
                    <span className="font-bold text-base">{product.categoryName}</span>
                  </div>
                )}
                {product.description && (
                  <div className="md:col-span-2">
                    <span className="text-muted block mb-1">Mô tả</span>
                    <span className="text-sm">{product.description}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package size={18} className="text-primary" />
                <span className="font-bold">Setups ({product.setups.length})</span>
              </div>
              {product.setups.length > 0 ? (
                <ul className="flex flex-col gap-1.5 text-sm">
                  {product.setups.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 p-2 bg-bg rounded-lg">
                      <span>{s.name}</span>
                      <span className="text-muted ml-auto">{s.price?.toLocaleString('vi-VN')}đ</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted text-sm">Chưa có setup</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
