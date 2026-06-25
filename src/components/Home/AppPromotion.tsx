import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

export default function AppPromotion() {
  return (
    <div className="my-12 bg-blue-900 rounded-lg overflow-hidden relative">
      <div className="px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row items-center justify-between">
        <div className="max-w-lg mb-6 md:mb-0">
          <h2 className="text-white text-2xl md:text-3xl font-bold mb-3">
            Drive smart with our app
          </h2>
          <p className="text-blue-100 mb-6">
            Get exclusive deals, service updates, and more through our app. Download now for the best car buying and selling experience.
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="bg-white p-2 rounded-lg mb-2">
            <QrCode className="h-24 w-24 text-white" />
          </div>
          <span className="text-white text-sm">Scan to download</span>
        </div>
        
        <div className="absolute right-0 bottom-0 opacity-90">
          <img 
            src="https://images.pexels.com/photos/8127035/pexels-photo-8127035.jpeg" 
            alt="People with mobile phones" 
            className="h-48 md:h-60 w-auto object-cover rounded-tl-lg"
          />
        </div>
      </div>
    </div>
  );
}