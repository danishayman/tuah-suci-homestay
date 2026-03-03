import Image from "next/image";
import Link from "next/link";

type AttractionProps = {
    title: string;
    description: string;
    distance: string;
    imagePath: string;
    linkUrl?: string;
    altText: string;
};

const Attraction = ({ title, description, distance, imagePath, linkUrl, altText }: AttractionProps) => {
    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
            <div className="relative h-40 sm:h-48 w-full">
                <div className="absolute inset-0 bg-[#F5EEDC]/50 flex items-center justify-center">
                    <p className="text-[#183B4E] text-sm font-medium">Image placeholder: {title}</p>
                </div>
                {/*Image Placeholder*/}
                {<Image
                    src={imagePath}
                    alt={altText}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 hover:scale-110"
                />}
            </div>

            <div className="p-3 sm:p-4">
                <div className="mb-1.5 sm:mb-2">
                    <div className="flex justify-end mb-1">
                        <span className="text-xs bg-[#F5EEDC] text-[#183B4E] px-2 py-1 rounded-full font-montserrat font-medium whitespace-nowrap">
                            {distance}
                        </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-playfair font-semibold text-[#27548A] leading-tight">{title}</h3>
                </div>
                <p className="text-[#183B4E]/80 text-xs sm:text-sm font-montserrat mb-3 sm:mb-4">{description}</p>

                {linkUrl && (
                    <Link
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#27548A] text-sm font-semibold hover:text-[#183B4E] transition-colors duration-300 flex items-center"
                    >
                        Lihat di Maps
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default function NearbyAttractions() {
    const attractions = [
        {
            title: "Muzium Padi",
            description: "Menghormati warisan padi Malaysia dengan pameran interaktif mengenai penanaman dan pemprosesan padi.",
            distance: "15 min",
            imagePath: "/attractions/muzium-padi.jpg",
            linkUrl: "https://maps.app.goo.gl/UGVGLcRbS2Ke24A27",
            altText: "Muzium Padi Alor Setar - tempat menarik berhampiran homestay Kedah dengan pameran warisan padi Malaysia"
        },
        {
            title: "Menara Alor Setar",
            description: "Menara telekomunikasi dan pelancongan setinggi 165.5 meter dengan pemandangan panoramik bandar Alor Setar.",
            distance: "25 min",
            imagePath: "/attractions/menara-alor-setar.jpg",
            linkUrl: "https://maps.app.goo.gl/2nn1HfkReHJ1XbyF9",
            altText: "Menara Alor Setar 165.5 meter - landmark terkenal dekat homestay Pokok Sena dengan pemandangan panoramik"
        },
        {
            title: "Masjid Zahir",
            description: "Salah satu masjid tertua dan terindah di Malaysia dengan seni bina Islam yang menakjubkan.",
            distance: "25 min",
            imagePath: "/attractions/masjid-zahir.jpg",
            linkUrl: "https://maps.app.goo.gl/ePegdcqnQ2xLJ8i47",
            altText: "Masjid Zahir Alor Setar - masjid bersejarah dengan seni bina Islam indah berhampiran homestay Kedah"
        },
        {
            title: "Bukit Mak Cun",
            description: "Tempat menarik untuk hiking dan menikmati pemandangan indah dari puncak bukit.",
            distance: "50 min",
            imagePath: "/attractions/bukit-kokdiang.jpg",
            linkUrl: "https://maps.app.goo.gl/8WjugKsa97W741wZA",
            altText: "Bukit Mak Cun Kedah - destinasi hiking dengan pemandangan indah dekat homestay Tuah Suci"
        },
        {
            title: "Dataran Balai Besar",
            description: "Kawasan bersejarah dan pusat aktiviti budaya di jantung bandar Alor Setar.",
            distance: "25 min",
            imagePath: "/attractions/dataran-balai-besar.jpg",
            linkUrl: "https://maps.app.goo.gl/ChCUyENGBrDyH9To6",
            altText: "Dataran Balai Besar Alor Setar - kawasan bersejarah dan budaya dekat homestay Pokok Sena Kedah"
        },
        {
            title: "Pekan Rabu",
            description: "Pasar tradisional ikonik dengan pelbagai barangan tempatan, kraftangan dan makanan tradisional.",
            distance: "25 min",
            imagePath: "/attractions/pekan-rabu.jpg",
            linkUrl: "https://maps.app.goo.gl/PsTwarEm127RkoK36",
            altText: "Pekan Rabu Alor Setar - pasar tradisional dengan barangan tempatan dekat homestay keluarga Kedah"
        },
        {
            title: "Hospital Sultanah Bahiyah",
            description: "Hospital utama di Kedah dengan pelbagai kemudahan perubatan dan pakar.",
            distance: "5 min",
            imagePath: "/attractions/hospital-sultanah-bahiyah.jpg",
            linkUrl: "https://maps.app.goo.gl/PMANWERJTUxZqBzB9",
            altText: "Hospital Sultanah Bahiyah - hospital utama Kedah yang sangat dekat dengan homestay Tuah Suci"
        },
        {
            title: "Lapangan Terbang Sultan Abdul Halim",
            description: "Lapangan terbang utama di Kedah yang menghubungkan negeri ini dengan destinasi lain.",
            distance: "20 min",
            imagePath: "/attractions/lapangan-terbang.jpg",
            linkUrl: "https://maps.app.goo.gl/2tviEyF1njjzG73P9",
            altText: "Lapangan Terbang Sultan Abdul Halim - airport Kedah dengan akses mudah dari homestay Pokok Sena"
        },
        {
            title: "Aman Central Mall",
            description: "Pusat membeli-belah moden dengan pelbagai kedai, restoran dan hiburan.",
            distance: "20 min",
            imagePath: "/attractions/aman-central-mall.jpg",
            linkUrl: "https://maps.app.goo.gl/U9eDFwuWr8qg6ioW9",
            altText: "Aman Central Mall Alor Setar - pusat shopping moden dengan akses mudah dari homestay Kedah"
        }
    
        
    ];

    return (
        <section id="nearby" className="py-10 sm:py-16 px-4 sm:px-8 md:px-16 lg:px-24 bg-[#F5EEDC]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-playfair font-bold text-[#183B4E] mb-3 sm:mb-4">Kawasan Sekitar</h2>
                    <p className="text-sm sm:text-base text-[#183B4E] font-montserrat max-w-2xl mx-auto font-bold">
                        Jelajahi tempat menarik berhampiran Pokok Sena dan Alor Setar yang boleh dilawati semasa menginap di Tuah Suci Homestay.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {attractions.map((attraction, index) => (
                        <Attraction
                            key={index}
                            title={attraction.title}
                            description={attraction.description}
                            distance={attraction.distance}
                            imagePath={attraction.imagePath}
                            linkUrl={attraction.linkUrl}
                            altText={attraction.altText}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
} 