import HeroBanner from "./components/HeroBanner";
import CategoryList from "./components/CategoryList";
import DealSection from "./components/DealSection";
import NewArrivalSection from "./components/NewArrivalSection";
import FeaturedShopSection from "./components/FeaturedShopSection";
import { useEffect, useState } from "react";
import { customerHomeService } from "@/services/customerHome";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [hotDeals, setHotDeals] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredShops, setFeaturedShops] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const [categoriesResult, hotDealsResult, newArrivalsResult, shopsResult] =
        await Promise.allSettled([
          customerHomeService.getCategories(),
          customerHomeService.getHotDeals(),
          customerHomeService.getNewArrivals(),
          customerHomeService.getFeaturedShopsWeekly(),
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
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#fbfae6] px-5 py-5 text-[#3f392f] md:px-10">
      <div className="mx-auto max-w-7xl">
        <HeroBanner />

        <CategoryList categories={categories} />

        <DealSection products={hotDeals} />

        <NewArrivalSection products={newArrivals} />

        <FeaturedShopSection shops={featuredShops} />
      </div>
    </main>
  );
}
