import { FaMap, FaUsers, FaGlobe, FaChartBar, FaLayerGroup, FaSearchLocation, FaDatabase, FaCog, FaRoute } from "react-icons/fa";

export default function DashboardAdmin() {
  return (
    <div className="bg-white text-blue-950 shadow-md rounded-lg p-6">
      <h1 className="text-3xl font-bold">🌍 Selamat Datang di Sistem Informasi Geografis</h1>
      <p className="mt-4 text-gray-800">
        Sistem Informasi Geografis (SIG) adalah platform canggih yang memungkinkan pengelolaan data spasial secara efektif.
        Dengan sistem ini, Anda dapat menganalisis lokasi, memetakan wilayah, serta mengoptimalkan pengambilan keputusan berbasis lokasi.
        SIG digunakan dalam berbagai bidang seperti tata ruang, transportasi, lingkungan, dan bisnis untuk mendapatkan wawasan strategis yang lebih baik.
      </p>

      <p className="mt-4 text-gray-800">
        Dengan SIG, Anda tidak hanya bisa melihat peta tetapi juga dapat melakukan analisis mendalam, mengelola lapisan data secara dinamis,
        dan mengembangkan strategi berbasis lokasi dengan efisiensi tinggi. Teknologi ini memungkinkan penyajian informasi geografis secara visual,
        sehingga mempermudah pemahaman data kompleks dengan cara yang lebih intuitif.
      </p>

      {/* Section Highlights */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <FeatureCard icon={FaMap} title="Peta Interaktif" color="bg-blue-800">
          Akses peta dengan fitur interaktif untuk melihat berbagai lokasi penting.
        </FeatureCard>

        <FeatureCard icon={FaUsers} title="Manajemen Data" color="bg-green-700">
          Kelola data geografis dengan antarmuka yang mudah digunakan.
        </FeatureCard>

        <FeatureCard icon={FaGlobe} title="Globalisasi" color="bg-yellow-600">
          Akses informasi peta dari berbagai belahan dunia.
        </FeatureCard>

        <FeatureCard icon={FaChartBar} title="Analisis Spasial" color="bg-red-600">
          Gunakan data geografis untuk analisis dan prediksi.
        </FeatureCard>

        <FeatureCard icon={FaLayerGroup} title="Layer Kustom" color="bg-purple-700">
          Tambahkan layer peta khusus untuk analisis mendalam.
        </FeatureCard>

        <FeatureCard icon={FaSearchLocation} title="Pencarian Lokasi" color="bg-pink-600">
          Cari lokasi dengan cepat dan mudah.
        </FeatureCard>

        <FeatureCard icon={FaDatabase} title="Database Terpusat" color="bg-teal-600">
          Kelola semua data geografis dalam satu tempat.
        </FeatureCard>

        <FeatureCard icon={FaRoute} title="Optimasi Rute" color="bg-indigo-700">
          Temukan jalur tercepat dan efisien untuk perjalanan atau distribusi.
        </FeatureCard>
      </div>

      {/* Call-to-Action Section */}
      <div className="mt-8 bg-blue-950 text-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-semibold">🚀 Maksimalkan Potensi SIG</h2>
        <p className="mt-2 text-lg">
          Gunakan fitur analisis dan manajemen SIG untuk meningkatkan efisiensi dan produktivitas dalam berbagai sektor.
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, color, children }) {
  return (
    <div className={`${color} text-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center transform transition duration-300 hover:scale-105`}>
      <Icon className="text-5xl mb-3" />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm">{children}</p>
    </div>
  );
}
