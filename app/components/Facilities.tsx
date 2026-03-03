import Image from "next/image";

type FacilityProps = {
    title: string;
    description: string;
    imagePath: string;
    altText: string;
};

const Facility = ({ title, description, imagePath, altText }: FacilityProps) => {
    return (
        <div className="flex flex-col items-center p-3 sm:p-4 bg-white/90 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            <div className="relative w-full h-48 sm:h-56 md:h-70 mb-3 sm:mb-4 overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-[#F5EEDC]/50 flex items-center justify-center">
                    <p className="text-[#183B4E] text-sm font-medium">Image placeholder: {title}</p>
                </div>
                {/* Image component with hover effect */}
                {<Image
                    src={imagePath}
                    alt={altText}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 hover:scale-110"
                />}
            </div>
            <h3 className="text-lg sm:text-xl font-playfair font-semibold text-[#27548A] mb-1 sm:mb-2">{title}</h3>
            <p className="text-center text-[#183B4E] font-montserrat text-xs sm:text-sm">{description}</p>
        </div>
    );
};

export default function Facilities() {
    const facilitiesList = [
        {
            title: "Kolam Renang",
            description: "Nikmati masa santai berenang di kolam renang untuk dewasa dan kanak-kanak.",
            imagePath: "/facilities/kolam.jpg",
            altText: "Kolam renang peribadi yang bersih dengan air jernih di homestay keluarga Tuah Suci Kedah"
        },
        {
            title: "Dapur Memasak",
            description: "Dapur memasak yang lengkap beserta peti ais untuk memudahkan tetamu.",
            imagePath: "/facilities/dapur.jpg",
            altText: "Dapur lengkap dengan peralatan memasak moden dan kabinet besar di homestay Pokok Sena"
        },
        {
            title: "Kawasan Sawah Padi",
            description: "Nikmati pengalaman unik dengan pemandangan sawah padi yang menghijau di sekeliling homestay.",
            imagePath: "/facilities/padi.jpg",
            altText: "Pemandangan sawah padi hijau yang menawan di sekeliling homestay kampung Kedah"
        },
        {
            title: "Ruang Santai",
            description: "Ruang istirehat yang selesa untuk menikmati suasana kampung dan pemandangan kolam.",
            imagePath: "/facilities/santai.jpg",
            altText: "Ruang santai outdoor yang nyaman dengan pemandangan kolam di homestay mewah Kedah"
        },
        {
            title: "Kemudahan BBQ",
            description: "Ruang khas untuk aktiviti BBQ dengan kemudahan yang lengkap.",
            imagePath: "/facilities/bbq.jpg",
            altText: "Area BBQ lengkap dengan grill dan meja untuk keluarga di homestay Tuah Suci"
        },

    ];

    return (
        <section id="facilities" className="py-10 sm:py-16 px-4 sm:px-8 md:px-16 lg:px-24 bg-[#F5EEDC]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-playfair font-bold text-[#183B4E] mb-3 sm:mb-4">Kemudahan & Fasiliti</h2>
                    <p className="text-sm sm:text-base text-[#183B4E] font-montserrat max-w-2xl mx-auto font-bold">
                        Nikmati pelbagai kemudahan dan fasiliti yang disediakan untuk memastikan penginapan anda selesa dan menyeronokkan.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {facilitiesList.map((facility, index) => (
                        <Facility
                            key={index}
                            title={facility.title}
                            description={facility.description}
                            imagePath={facility.imagePath}
                            altText={facility.altText}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}