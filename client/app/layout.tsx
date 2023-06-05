"use client"

import ContextProvider from "../components/ContextProvider"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es" className="font-disp">
            {/* 
            La etiqueta <head /> contendrá los componentes devueltos por el componente head.tsx
            del padre más cercano.
            */}
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Cabin+Sketch:wght@400;700&display=swap"
                    rel="stylesheet"
                ></link>
            </head>
            <body style={{ background: 'linear-gradient(to bottom right, #581c87, #1e3a8a)' }}>
                 {/* Envuelve los hijos con el componente ContextProvider */}
                <ContextProvider>{children}</ContextProvider>
            </body>
        </html>
    )
}
