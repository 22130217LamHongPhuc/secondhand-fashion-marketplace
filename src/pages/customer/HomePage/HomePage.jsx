import HeroBanner from "./components/HeroBanner";
import CategoryList from "./components/CategoryList";
import DealSection from "./components/DealSection";
import NewArrivalSection from "./components/NewArrivalSection";
import FeaturedShopSection from "./components/FeaturedShopSection";
import PromotionsSection from "./components/PromotionsSection";
import { useEffect, useState } from "react";
import { customerHomeService } from "@/services/customerHome";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [hotDeals, setHotDeals] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredShops, setFeaturedShops] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Fetch banners immediately and independently
    customerHomeService.getBanners()
      .then((data) => {
        if (isMounted) {
          setBanners(data ?? []);
          setBannersLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load banners", err);
        if (isMounted) {
          setBanners([]);
          setBannersLoading(false);
        }
      });

    const load = async () => {
      const [
        categoriesResult,
        hotDealsResult,
        newArrivalsResult,
        shopsResult,
        campaignsResult,
        couponsResult,
      ] = await Promise.allSettled([
        customerHomeService.getCategories(),
        customerHomeService.getHotDeals(),
        customerHomeService.getNewArrivals(),
        customerHomeService.getFeaturedShopsWeekly(),
        customerHomeService.getCampaigns(),
        customerHomeService.getCoupons(),
      ]);

      if (!isMounted) return;

      if (categoriesResult.status === "fulfilled") {
        setCategories(categoriesResult.value ?? []);
      } else {
        console.error("Failed to load categories", categoriesResult.reason);
        setCategories([]);
      }

      if (hotDealsResult.status === "fulfilled") {
        setHotDeals(hotDealsResult.value ?? []);
      } else {
        console.error("Failed to load hot deals", hotDealsResult.reason);
        setHotDeals([]);
      }

      if (newArrivalsResult.status === "fulfilled") {
        setNewArrivals(newArrivalsResult.value ?? []);
      } else {
        console.error("Failed to load new arrivals", newArrivalsResult.reason);
        setNewArrivals([]);
      }

      if (shopsResult.status === "fulfilled") {
        setFeaturedShops(shopsResult.value ?? []);
      } else {
        console.error("Failed to load featured shops", shopsResult.reason);
        setFeaturedShops([]);
      }

      if (campaignsResult.status === "fulfilled") {
        setCampaigns(campaignsResult.value ?? []);
      } else {
        console.error("Failed to load campaigns", campaignsResult.reason);
        setCampaigns([]);
      }

      if (couponsResult.status === "fulfilled") {
        setCoupons(couponsResult.value ?? []);
      } else {
        console.error("Failed to load coupons", couponsResult.reason);
        setCoupons([]);
      }



      setLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#fbfae6] px-5 py-5 text-[#3f392f] md:px-10">
      <div className="mx-auto max-w-7xl">
        <HeroBanner banners={banners} loading={bannersLoading} />

        <PromotionsSection campaigns={campaigns} coupons={coupons} loading={loading} />

        <CategoryList categories={categories} loading={loading} />

        <DealSection products={hotDeals} loading={loading} />

        <NewArrivalSection products={newArrivals} loading={loading} />

        <FeaturedShopSection shops={featuredShops} loading={loading} />
      </div>
    </main>
  );
}
