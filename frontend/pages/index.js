// import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";

import "leaflet/dist/leaflet.css";
import axios from "axios";
import { Toaster } from "sonner";

axios.defaults.withCredentials = true;

export default function Home() {
  return (
    <><div>
      <Header />
    </div><div>
        {/* Your other components */}
        <Toaster position="top-right" />
      </div></>
  );
}
