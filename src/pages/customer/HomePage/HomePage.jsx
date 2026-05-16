import HeroBanner from "./components/HeroBanner";
import CategoryList from "./components/CategoryList";
import DealSection from "./components/DealSection";
import NewArrivalSection from "./components/NewArrivalSection";
import FeaturedShopSection from "./components/FeaturedShopSection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fbfae6] px-5 py-5 text-[#3f392f] md:px-10">
      <div className="mx-auto max-w-7xl">
        <HeroBanner />

        <CategoryList />

        <DealSection />

        <NewArrivalSection />

        <FeaturedShopSection />
      </div>
    </main>
  );
}
