// A reusable utility for creating filter configurations based on page requirements
// This ensures consistency across all pages with filter functionality

export const createDefaultFilters = (pageType) => {
  const baseFilters = {
    // Core basic filters shared across most pages
    status: {
      key: 'status',
      label: 'Trạng thái',
      options: [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'Đang hoạt động', label: 'Đang hoạt động' },
        { value: 'Đã tắt', label: 'Đã tắt' },
        { value: 'Hết hạn', label: 'Hết hạn' },
      ],
    },

    // Common role filters used in account and role management
    role: {
      key: 'role',
      label: 'Vai trò',
      options: [
        { value: '', label: 'Tất cả vai trò' },
        { value: 'Admin', label: 'Admin' },
        { value: 'Manager', label: 'Manager' },
        { value: 'Cashier', label: 'Cashier' },
        { value: 'Barista', label: 'Barista' },
        { value: 'Staff', label: 'Staff' },
      ],
    },

    // Category filters used in products, recipes, and ingredients
    category: {
      key: 'category',
      label: 'Danh mục',
      options: [
        { value: '', label: 'Tất cả loại' },
        { value: 'Cà phê', label: 'Cà phê' },
        { value: 'Trà', label: 'Trà' },
        { value: 'Đá xay', label: 'Đá xay' },
        { value: 'Sinh tố', label: 'Sinh tố' },
        { value: 'Bánh', label: 'Bánh' },
        { value: 'Khác', label: 'Khác' },
      ],
    },

    // Type filters used in promotions and vouchers
    type: {
      key: 'type',
      label: 'Loại',
      options: [
        { value: '', label: 'Tất cả loại' },
        { value: 'percent', label: 'Phần trăm' },
        { value: 'fixed', label: 'Tiền mặt' },
      ],
    },

    // Unit filters for ingredients
    unit: {
      key: 'unit',
      label: 'Đơn vị',
      options: [
        { value: '', label: 'Tất cả đơn vị' },
        { value: 'Kg', label: 'Kg' },
        { value: 'Gram', label: 'Gram' },
        { value: 'Lít', label: 'Lít' },
        { value: 'Ml', label: 'Ml' },
      ],
    },

    // Status filters for specific modules
    activeStatus: {
      key: 'active',
      label: 'Đang hoạt động',
      options: [
        { value: '', label: 'Tất cả' },
        { value: 'true', label: 'Có' },
        { value: 'false', label: 'Không' },
      ],
    },
  };

  // Return page-specific filter configurations based on the page type
  switch (pageType) {
    // Page types will determine which filters are applicable
    case 'menu-products':
      return {
        searchTerm: { key: 'search', label: 'Tìm kiếm', type: 'text' },
        category: baseFilters.category,
        type: baseFilters.type,
      };

    case 'ingredients':
      return {
        searchTerm: { key: 'search', label: 'Tìm kiếm', type: 'text' },
        category: baseFilters.category,
        active: baseFilters.activeStatus,
      };

    case 'recipes':
      return {
        searchTerm: { key: 'search', label: 'Tìm kiếm', type: 'text' },
        category: baseFilters.category,
        type: baseFilters.type,
      };

    case 'vouchers':
      return {
        searchTerm: { key: 'search', label: 'Tìm kiếm', type: 'text' },
        status: baseFilters.status,
        type: baseFilters.type,
      };

    case 'accounts':
      return {
        searchTerm: { key: 'search', label: 'Tìm kiếm', type: 'text' },
        role: baseFilters.role,
        status: baseFilters.status,
      };

    case 'roles':
      return {
        searchTerm: { key: 'search', label: 'Tìm kiếm', type: 'text' },
        status: baseFilters.status,
      };

    case 'promotions':
      return {
        searchTerm: { key: 'search', label: 'Tìm kiếm', type: 'text' },
        status: baseFilters.status,
      };

    // Default configuration
    default:
      return {
        searchTerm: { key: 'search', label: 'Tìm kiếm', type: 'text' },
      };
  }
};

// Filter operator configurations
export const FILTER_OPERATORS = {
  // Default operator for each filter type
  text: { value: '', label: 'Bất kỳ', },
  select: { value: '', label: 'Tất cả', },
  status: { value: '', label: 'Tất cả', },
  category: { value: '', label: 'Tất cả', },
};