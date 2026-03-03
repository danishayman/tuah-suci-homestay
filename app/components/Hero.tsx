import Image from "next/image";
import Link from "next/link";
import ScrollArrow from "./ScrollArrow";

export default function Hero() {
    return (
        <section className="relative h-screen overflow-hidden">
            {/* Hero Background Image */}
            <div className="absolute inset-0 z-0">
                {/* Mobile Background Image */}
                <Image
                    src="/hero-img-mobile.jpg"
                    alt="Tuah Suci Homestay Kedah - Homestay mewah dengan kolam renang dan pemandangan sawah padi di Pokok Sena"
                    fill
                    priority
                    className="object-cover object-center sm:hidden"
                />
                {/* Desktop Background Image */}
                <Image
                    src="/hero-image.jpg"
                    alt="Tuah Suci Homestay Kedah - Homestay mewah dengan kolam renang dan pemandangan sawah padi di Pokok Sena"
                    fill
                    priority
                    className="object-cover object-center hidden sm:block"
                />
                <div className="absolute inset-0 bg-black/45 sm:bg-black/35" /> {/* Better overlay balance for mobile */}
            </div>

            {/* Hero Content - Centered on Mobile, Left Aligned on Desktop */}
            <div className="relative z-10 flex h-screen px-4 sm:px-8 md:px-16 lg:px-24">
                <div className="flex flex-col justify-center w-full max-w-xl py-12 md:py-20 items-center sm:items-start text-center sm:text-left mx-auto sm:mx-0">
                    <div>
                        <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight text-shadow select-none cursor-default">
                            <span className="block relative overflow-visible pb-2 hover:text-[#F5EEDC] transition-colors duration-300 sm:whitespace-nowrap">Tuah Suci Homestay</span>
                            <span className="block text-[#DDA853] relative overflow-visible hover:text-white transition-colors duration-300 sm:whitespace-nowrap">Kedah Darul Aman</span>
                        </h1>
                    </div>

                    <div className="flex flex-wrap mt-4 md:mt-6 text-[#F5EEDC] font-semibold tracking-wide font-montserrat select-none cursor-default">
                        <p className="flex items-center text-sm sm:text-base">
                            <span className="mr-2 text-lg">•</span> 3 Bilik Tidur, 2 Bilik Air
                        </p>
                    </div>

                    <div className="flex flex-wrap mt-2 text-[#F5EEDC] font-semibold tracking-wide font-montserrat select-none cursor-default">
                        <p className="flex items-center text-sm sm:text-base">
                            <span className="mr-2 text-lg">•</span> Kolam Renang, Dapur Lengkap
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 md:mt-10 w-full sm:w-auto">
                        <Link
                            href="/booking"
                            className="font-montserrat px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold uppercase tracking-widest text-white bg-[#27548A] rounded-lg shadow-lg hover:bg-[#183B4E] transition-all duration-300 hover:translate-y-[-2px] active:translate-y-0 select-none w-full sm:w-auto text-center cursor-pointer z-10 touch-manipulation"
                            aria-label="Tempah Sekarang"
                            role="button"
                        >
                            Tempah Sekarang
                        </Link>
                    </div>

                    {/* Feature highlights */}
                    <div className="flex flex-wrap justify-center max-w-xl gap-2 sm:gap-3 md:gap-4 mt-8 sm:mt-10 md:mt-12">
                        {["Pemandangan Indah", "Kemudahan Moden", "Suasana Kampung"].map((feature) => (
                            <div key={feature} className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium tracking-wide bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300 font-montserrat select-none cursor-default">
                                {feature}
                            </div>
                        ))}
                    </div>

                    {/* Social Media Links */}
                    <div className="flex gap-4 mt-6 sm:mt-8 justify-center sm:justify-start">
                        <Link
                            href="https://www.facebook.com/share/1Jd9jnZjX6/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-3 bg-[#1877F2] backdrop-blur-sm rounded-full hover:bg-[#166FE5] transition-all duration-300 hover:translate-y-[-2px] active:translate-y-0"
                            aria-label="Facebook"
                        >
                            <svg className="w-5 h-5 text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </Link>

                        <Link
                            href="https://www.instagram.com/tuahsucihomestay"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-3 bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F56040] rounded-full hover:opacity-90 transition-all duration-300 hover:translate-y-[-2px] active:translate-y-0"
                            aria-label="Instagram"
                        >
                            <svg className="w-5 h-5 text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </Link>

                        <Link
                            href="https://www.tiktok.com/@tuahsucihomestay"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-3 bg-[#000000] backdrop-blur-sm rounded-full hover:bg-[#333333] transition-all duration-300 hover:translate-y-[-2px] active:translate-y-0"
                            aria-label="TikTok"
                        >
                            <svg className="w-5 h-5 text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Scroll Arrow Component */}
            <ScrollArrow targetId="gallery" />
        </section>
    );
} 