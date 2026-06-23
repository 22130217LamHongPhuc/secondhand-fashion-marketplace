const rawGhnBaseUrl =
  import.meta.env.VITE_GHN_BASE_URL ||
  "https://dev-online-gateway.ghn.vn/shiip/public-api";

const ghnBaseUrl = rawGhnBaseUrl.includes("/shiip/public-api")
  ? rawGhnBaseUrl.replace(/\/$/, "")
  : `${rawGhnBaseUrl.replace(/\/$/, "")}/shiip/public-api`;

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  ghnBaseUrl,
  ghnToken: import.meta.env.VITE_GHN_TOKEN || "db44e853-cc14-11ef-b1ed-769685acafa5",
  ghnShopId: import.meta.env.VITE_GHN_SHOP_ID || "2509459",
};
