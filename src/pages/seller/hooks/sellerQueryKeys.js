export const sellerProductKeys = {
  all:      ['seller', 'products'],
  lists:    () => [...sellerProductKeys.all, 'list'],
  list:     (params) => [...sellerProductKeys.lists(), params],
  details:  () => [...sellerProductKeys.all, 'detail'],
  detail:   (id) => [...sellerProductKeys.details(), id],
};

export const sellerOrderKeys = {
  all:          ['seller', 'orders'],
  lists:        () => [...sellerOrderKeys.all, 'list'],
  list:         (params) => [...sellerOrderKeys.lists(), params],
  statuses:     () => [...sellerOrderKeys.all, 'status'],
  status:       (params) => [...sellerOrderKeys.statuses(), params],
  details:      () => [...sellerOrderKeys.all, 'detail'],
  detail:       (id) => [...sellerOrderKeys.details(), id],
  currentMonth: (params) => [...sellerOrderKeys.all, 'current-month', params],
};

export const sellerStatisticKeys = {
  all:       ['seller', 'statistics'],
  dashboard: (params) => [...sellerStatisticKeys.all, 'dashboard', params],
  analytics: (params) => [...sellerStatisticKeys.all, 'analytics', params],
};

export const sellerShopKeys = {
  all:     ['seller', 'shop'],
  profile: () => [...sellerShopKeys.all, 'profile'],
};
