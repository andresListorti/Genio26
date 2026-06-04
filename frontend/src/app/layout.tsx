import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
  ),
  title: {
    default: "Genaro | Calzado Artesanal Masculino y Femenino",
    template: "%s | Genaro Calzado",
  },
  description:
    "Zapatería Genaro — Calzado artesanal en cuero genuino desde 1962. Zapatos, botas, mocasines y zapatillas para hombre y mujer. Envíos a todo el país.",
  keywords: [
    "zapatería",
    "calzado artesanal",
    "zapatos cuero",
    "botas cuero",
    "mocasines",
    "zapatillas cuero",
    "calzado hombre",
    "calzado mujer",
    "genaro",
    "zapatería argentina",
    "cuero genuino",
    "calzado premium",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Genaro Calzado",
    title: "Genaro | Calzado Artesanal Masculino y Femenino",
    description:
      "Calzado artesanal en cuero genuino desde 1962. Zapatos, botas, mocasines y zapatillas.",
    images: [
      {
        url: "/resources/Men.jpg",
        width: 1200,
        height: 900,
        alt: "Genaro — Calzado Artesanal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Genaro | Calzado Artesanal",
    description:
      "Calzado artesanal en cuero genuino desde 1962. Zapatos, botas, mocasines y zapatillas para hombre y mujer.",
    images: ["/resources/Men.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartSidebar />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
