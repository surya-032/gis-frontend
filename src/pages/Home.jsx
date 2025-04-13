import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Map from "../components/Map";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const mapRef = useRef(null);

  const scrollToMap = () => {
    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("data-geospasial");
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-gray-100">
      {/* Navbar */}
      <Navbar scrollToMap={scrollToMap} />

      {/* Hero Section */}
      <div
        className="relative h-screen bg-cover bg-center flex items-center justify-center text-center"
        style={{ backgroundImage: "url('/background.jpg')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        <div className="relative z-10 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
            Sistem Informasi Geografis Bali
          </h1>
          <p className="text-lg text-gray-200 mt-4 max-w-xl mx-auto">
            Jelajahi peta interaktif dengan informasi geospasial yang akurat
          </p>
          <button
            onClick={scrollToMap}
            className="mt-6 px-6 py-3 rounded-lg text-lg bg-blue-950 text-white hover:bg-blue-800 transition duration-300 shadow-lg"
          >
            Lihat Peta
          </button>
        </div>
      </div>

      {/* Map Integration */}
      <div ref={mapRef} className="mt-10">
        <Map />
      </div>

      {/* Informasi Geospasial */}
      <section id="data-geospasial" className="py-20 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-blue-950 mb-6 animate-fade-in">
            🔍 Jenis Data Geospasial
          </h2>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-10">
            Data geospasial digunakan untuk merepresentasikan berbagai informasi lokasi di dunia nyata.
            Berikut adalah beberapa jenis data geospasial yang umum digunakan dalam sistem informasi geografis (SIG).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "📍 Data Vektor", description: "Representasi objek dunia nyata menggunakan titik, garis, dan poligon." },
              { title: "🛰️ Data Raster", description: "Data berbasis grid pixel yang merepresentasikan citra satelit dan elevasi." },
              { title: "🌎 Data Titik", description: "Menunjukkan lokasi spesifik seperti koordinat kota atau landmark." },
              { title: "🛤️ Data Garis", description: "Digunakan untuk fitur linier seperti jalan, sungai, dan jaringan listrik." },
              { title: "🗺️ Data Poligon", description: "Merepresentasikan area seperti batas wilayah administrasi atau zona pertanian." },
            ].map((item, index) => (
              <div
                key={index}
                className={`p-6 bg-white rounded-lg shadow-lg transform transition-all duration-700 ease-out hover:scale-105 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
              >
                <h3 className="text-2xl font-bold text-blue-950">{item.title}</h3>
                <p className="text-gray-700 mt-4">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
