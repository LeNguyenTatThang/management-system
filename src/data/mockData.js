export const kpis = {
  revenue: { value: '25.840.000đ', change: '+12.5%', label: 'Compared with yesterday', isPositive: true },
  orders: { value: 186, change: '+8.2%', label: 'Compared with yesterday', isPositive: true },
  profit: { value: '8.420.000đ', change: '32.6%', label: 'Profit margin', isPositive: true },
  bestSeller: { value: 'Cà phê sữa', subValue: '128 ly', label: 'Top product' },
  lowStock: { value: 8, label: 'Cần nhập thêm' },
  processing: { value: 12, label: 'Currently processing' },
};

export const revenueData = [
  { name: 'T2', revenue: 12000000, orders: 85 },
  { name: 'T3', revenue: 15000000, orders: 95 },
  { name: 'T4', revenue: 18000000, orders: 120 },
  { name: 'T5', revenue: 14000000, orders: 90 },
  { name: 'T6', revenue: 22000000, orders: 150 },
  { name: 'T7', revenue: 28000000, orders: 190 },
  { name: 'CN', revenue: 25840000, orders: 186 },
];

export const bestSellers = [
  { id: 1, name: 'Cà phê sữa', quantity: 128, revenue: '3.200.000đ', ratio: '25%' },
  { id: 2, name: 'Bạc xỉu', quantity: 95, revenue: '2.850.000đ', ratio: '18%' },
  { id: 3, name: 'Trà đào', quantity: 82, revenue: '2.460.000đ', ratio: '15%' },
  { id: 4, name: 'Matcha latte', quantity: 64, revenue: '2.560.000đ', ratio: '12%' },
  { id: 5, name: 'Cà phê đen', quantity: 50, revenue: '1.000.000đ', ratio: '10%' },
];

export const inventoryWarnings = [
  { id: 1, name: 'Sữa đặc', stock: '2 hộp', status: 'Sắp hết' },
  { id: 2, name: 'Cà phê Robusta', stock: '1.2kg', status: 'Sắp hết' },
  { id: 3, name: 'Syrup đào', stock: '300ml', status: 'Sắp hết' },
];

export const mockThemes = [
  { id: 'TH01', name: 'Mặc định (Burgundy)', description: 'Theme mặc định của hệ thống với tông màu đỏ Burgundy đặc trưng.', preview: 'https://placehold.co/400x250/6c111e/ffffff?text=Burgundy', status: 'active' },
  { id: 'TH02', name: 'Xanh dương', description: 'Theme tông màu xanh dương hiện đại, phù hợp không gian trẻ trung.', preview: 'https://placehold.co/400x250/1e40af/ffffff?text=Blue', status: 'inactive' },
  { id: 'TH03', name: 'Xanh lá', description: 'Theme tông màu xanh lá thiên nhiên, thư giãn.', preview: 'https://placehold.co/400x250/166534/ffffff?text=Green', status: 'inactive' },
  { id: 'TH04', name: 'Tối (Dark)', description: 'Theme tối dành cho quán bar hoặc không gian ánh sáng yếu.', preview: 'https://placehold.co/400x250/1f2937/ffffff?text=Dark', status: 'inactive' },
];

export const mockVouchers = [
  { id: 'VC01', code: 'SALE10', name: 'Giảm 10K', type: 'fixed', value: 10000, minOrder: 0, maxDiscount: null, startDate: '01/07/2026', endDate: '31/07/2026', usageLimit: 100, usedCount: 23, status: 'active', description: 'Giảm 10.000đ cho đơn hàng bất kỳ.' },
  { id: 'VC02', code: 'SALE20', name: 'Giảm 10%', type: 'percent', value: 10, minOrder: 50000, maxDiscount: 20000, startDate: '01/07/2026', endDate: '31/07/2026', usageLimit: 50, usedCount: 12, status: 'active', description: 'Giảm 10% giá trị đơn hàng, tối đa 20.000đ.' },
  { id: 'VC03', code: 'WELCOME', name: 'Chào mừng', type: 'fixed', value: 15000, minOrder: 0, maxDiscount: null, startDate: '01/06/2026', endDate: '31/12/2026', usageLimit: 200, usedCount: 45, status: 'active', description: 'Giảm 15.000đ cho khách hàng mới.' },
  { id: 'VC04', code: 'SALE50K', name: 'Giảm 50K', type: 'fixed', value: 50000, minOrder: 200000, maxDiscount: null, startDate: '01/07/2026', endDate: '15/07/2026', usageLimit: 30, usedCount: 30, status: 'expired', description: 'Giảm 50.000đ cho đơn từ 200.000đ.' },
  { id: 'VC05', code: 'SUMMER', name: 'Mùa hè xanh', type: 'percent', value: 15, minOrder: 100000, maxDiscount: 30000, startDate: '01/06/2026', endDate: '31/08/2026', usageLimit: 100, usedCount: 67, status: 'active', description: 'Giảm 15% đơn từ 100.000đ, tối đa 30.000đ.' },
];

export const mockPromotions = [
  { id: 'KM01', name: 'HAPPY HOUR', description: 'Giảm giá cho khung giờ vàng 14:00-17:00', type: 'percent', value: 20, applyTo: 'category', categoryIds: ['Cà phê'], productIds: [], startDate: '01/07/2026', endDate: '31/07/2026', timeStart: '14:00', timeEnd: '17:00', status: 'active' },
  { id: 'KM02', name: 'Giảm trà sữa', description: 'Giảm giá đặc biệt cho trà sữa trân châu', type: 'fixed', value: 5000, applyTo: 'product', productIds: ['TS001'], categoryIds: [], startDate: '01/07/2026', endDate: '31/07/2026', timeStart: '', timeEnd: '', status: 'active' },
  { id: 'KM03', name: 'Khuyến mãi cà phê sữa', description: 'Giảm giá cho cà phê sữa mỗi buổi sáng', type: 'fixed', value: 3000, applyTo: 'product', productIds: ['CF001'], categoryIds: [], startDate: '01/07/2026', endDate: '31/07/2026', timeStart: '06:00', timeEnd: '10:00', status: 'inactive' },
];

export const products = [
  { id: 'CF001', name: 'Cà phê sữa', category: 'Cà phê', price: 25000, cost: 7640, profit: 17360, status: 'Đang bán', updatedAt: '22/07/2026', image: 'https://coffee.alexflipnote.dev/random?1', tags: ['Khẩu', 'Ống hút ngắn', 'Thìa ngắn'], size: '360ml', fc: '30.6%' },
  { id: 'CF002', name: 'Bạc xỉu', category: 'Cà phê', price: 30000, cost: 8500, profit: 21500, status: 'Đang bán', updatedAt: '21/07/2026', image: 'https://coffee.alexflipnote.dev/random?2', tags: ['Khẩu', 'Ống hút'], size: '360ml', fc: '28.3%' },
  { id: 'TR001', name: 'Trà đào cam sả', category: 'Trà', price: 40000, cost: 12000, profit: 28000, status: 'Đang bán', updatedAt: '20/07/2026', image: 'https://coffee.alexflipnote.dev/random?3', tags: ['Ống hút to'], size: '500ml', fc: '30.0%' },
  { id: 'TS001', name: 'Trà sữa trân châu', category: 'Trà sữa', price: 35000, cost: 10500, profit: 24500, status: 'Tạm ngưng', updatedAt: '19/07/2026', image: 'https://coffee.alexflipnote.dev/random?4', tags: ['Ống hút to', 'Trân châu'], size: '500ml', fc: '30.0%' },
];
