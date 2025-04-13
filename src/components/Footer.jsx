export default function Footer() {
  return (
    <footer className="bg-blue-950 text-gray-300 py-6 mt-10">
      <div className="container mx-auto flex flex-col items-center justify-center text-center px-6">
        
        {/* Logo atau Brand */}
        <h2 className="text-2xl font-bold text-white hover:text-blue-800 transition duration-300">
          Sistem Informasi Geografis
        </h2>

        {/* Copyright */}
        <p className="text-sm mt-2">&copy; {new Date().getFullYear()}. All rights reserved.</p>

        {/* Slogan atau Tagline */}
        <p className="text-xs mt-1 italic opacity-80">
          "Membantu Anda menjelajahi dunia lebih mudah."
        </p>
      </div>
    </footer>
  );
}
