import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WakaFarm - Connect Farmers & Buyers in Nigeria",
  description:
    "WakaFarm connects farmers and buyers across Nigeria, saving on transport costs with group shipping and local hubs.",
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <span>Text</span>
      </main>
    </div>
  );
}
