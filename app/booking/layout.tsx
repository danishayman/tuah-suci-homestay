import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from 'next/font/google';
import "../globals.css";

const montserrat = Montserrat({
    subsets: ['latin'],
    variable: '--font-montserrat',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700'],
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
    display: 'swap',
    weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
    title: "Tempahan | Tuah Suci Homestay Kedah",
    description: "Tempah penginapan di Tuah Suci Homestay Kedah. Pilih tarikh, isi maklumat, dan buat pembayaran secara dalam talian.",
};

export default function BookingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={`${montserrat.variable} ${playfair.variable} font-sans`}>
            {children}
        </div>
    );
}
