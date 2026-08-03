import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecipe } from '../../contexts/RecipeContext';
import { useAuth } from '../../contexts/AuthContext';
import PageContainer from '../../components/layout/PageContainer';
import { ChefHat, Package, ArrowLeft, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRecipeById, removeRecipe } = useRecipe();
  const { hasPermission } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getRecipeById(id);
      if (!data) {
        toast.error('Không tìm thấy công thức');
        navigate('/recipes');
        return;
      }
      setRecipe(data);
      setLoading(false);
    })();
  }, [id, getRecipeById, navigate]);

  const handleDelete = async () => {
    if (!window.confirm(`Xóa công thức "${recipe.name}"?`)) return;
    try {
      await removeRecipe(recipe.id);
      toast.success('Đã xóa công thức');
      navigate('/recipes');
    } catch (e) {
      toast.error(e.message || 'Không thể xóa');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted">Đang tải thông tin công thức...</p>
        </div>
      </PageContainer>
    );
  }

  if (!recipe) return null;

  const instructions = recipe.instructions ? recipe.instructions.split('\n').filter(Boolean) : [];

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button className="p-2 text-muted hover-text-primary cursor-pointer" onClick={() => navigate('/recipes')}>
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm text-muted">
                <span>QL Công thức</span>
                <span>/</span>
                <span className="text-main font-semibold truncate">Chi tiết công thức</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasPermission('product.recipe.update') && (
              <button className="btn btn-primary flex items-center gap-2" onClick={() => navigate(`/recipes/${id}/edit`)}>
                <Edit3 size={16} /> Chỉnh sửa
              </button>
            )}
            {hasPermission('product.recipe.delete') && (
              <button className="btn btn-danger flex items-center gap-2" onClick={handleDelete}>
                <Trash2 size={16} /> Xóa
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4">CÔNG THỨC THÀNH PHẦN NGUYÊN LIỆU</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-muted block mb-1">Tên công thức</span>
                  <span className="font-bold text-base">{recipe.name}</span>
                </div>
                {recipe.product && (
                  <div>
                    <span className="text-muted block mb-1">Món</span>
                    <span className="font-bold text-base">{recipe.product.name}</span>
                  </div>
                )}
                {recipe.description && (
                  <div className="md:col-span-2">
                    <span className="text-muted block mb-1">Mô tả</span>
                    <span className="text-sm">{recipe.description}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <ChefHat size={18} className="text-primary" />
                <span className="font-bold text-base uppercase">Cách làm</span>
              </div>
              {instructions.length > 0 ? (
                <div className="bg-rose-50 rounded-xl p-4 border border-soft">
                  <ol className="list-decimal pl-5 text-sm text-main space-y-2">
                    {instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              ) : (
                <p className="text-sm text-muted italic">Chưa có hướng dẫn.</p>
              )}
            </div>
          </div>

          <div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package size={18} className="text-primary" />
                <span className="font-bold">Nguyên liệu ({recipe.ingredients?.length || 0})</span>
              </div>
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {recipe.ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-bg rounded-lg text-sm">
                      <span className="font-medium">{ing.ingredientName}</span>
                      <span className="text-muted">{ing.quantity} {ing.unitSymbol || ing.unitName}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-sm">Chưa có nguyên liệu</p>
              )}
            </div>

            {recipe.product && (
              <div className="card p-4 mt-4">
                <div className="font-bold mb-2">Thông tin món</div>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Giá bán</span>
                    <span className="font-bold text-primary">{recipe.product.price?.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {recipe.product.costPrice && (
                    <div className="flex justify-between">
                      <span className="text-muted">Giá vốn</span>
                      <span className="font-semibold">{recipe.product.costPrice?.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
