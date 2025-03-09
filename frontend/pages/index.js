// import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

import "leaflet/dist/leaflet.css";
import axios from "axios";
import { Toaster } from "sonner";
import Header from "./webcomponents/Header";
import Homepage from "./webcomponents/Homepage";
import Footer from "./webcomponents/Footer";

axios.defaults.withCredentials = true;

export default function Home() {
  return (
    <><div className="sticky top-0 z-50 bg-white shadow-md">
      <Header/>
    </div><Homepage/>
    <Footer/></>
  );
}
