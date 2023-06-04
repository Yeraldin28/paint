// crea un contexto de usuario utilizando createContext en React.
// Luego, define un componente proveedor (ContextProvider) que establece
// y provee el estado user utilizando el hook useState.
// Otros componentes pueden consumir este contexto al envolver
// su contenido con el proveedor (<ContextProvider>).


import React, { createContext, ReactNode, useState } from "react"

export const UserContext = createContext({} as UserContext)

const ContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState({} as UserProps)

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

export default ContextProvider
