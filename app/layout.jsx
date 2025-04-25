import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import "@/styles/components/alerts.css"
import { LanguageProvider } from "@/contexts/language-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Montañita Adopta - Encuentra un amigo peludo",
  description:
    "Plataforma de adopción de animales en La Montañita Caquetá. Encuentra perros y gatos que buscan un hogar amoroso.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        {/* Bootstrap CSS */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Poppins:wght@300;400;600&display=swap"
          rel="stylesheet"
        />

        {/* Flatpickr */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css" />
      </head>
      <body className={inter.className}>
        <LanguageProvider>{children}</LanguageProvider>

        {/* Scripts esenciales */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* SweetAlert2 */}
        <Script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" strategy="lazyOnload" />

        {/* Flatpickr */}
        <Script src="https://cdn.jsdelivr.net/npm/flatpickr" strategy="afterInteractive" />

        {/* Script para resetear estilos */}
        <Script id="reset-styles">{`
          if (typeof window !== 'undefined') {
            function resetStyles() {
              document.body.classList.remove('contacto-specific');
            }
            window.addEventListener('load', resetStyles);
            if (typeof window.navigation !== 'undefined' && window.navigation.addEventListener) {
              window.navigation.addEventListener('navigate', resetStyles);
            }
          }
        `}</Script>

        {/* Configuración de SweetAlert */}
        <Script id="sweetalert-config" strategy="lazyOnload">{`
          if (typeof window !== 'undefined' && window.Swal) {
            window.Swal = window.Swal.mixin({
              customClass: {
                confirmButton: 'swal-confirm-button',
                cancelButton: 'swal-cancel-button',
                title: 'swal-title',
                content: 'swal-content'
              },
              buttonsStyling: true,
              confirmButtonColor: '#27b80b',
              cancelButtonColor: '#d33',
              focusConfirm: false,
              showClass: { popup: 'animate__animated animate__fadeIn faster' },
              hideClass: { popup: 'animate__animated animate__fadeOut faster' }
            });
          }
        `}</Script>
      </body>
    </html>
  )
}
