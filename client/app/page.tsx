"use client"
import { useContext, useEffect, useState } from "react"
import { customAlphabet } from "nanoid"
import { UserContext } from "../components/ContextProvider"
import { useRouter } from "next/navigation"

export default function Home() {
  // Genera una función personalizada para generar IDs únicos
  const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 4)

  // Obtiene el usuario y la función para establecer el usuario del contexto
  const { user, setUser } = useContext(UserContext)

  // Estado para almacenar el nombre del usuario
  const [name, setName] = useState("")

  // Estado para almacenar el ID de unirse a una sala existente
  const [joinId, setJoinId] = useState("")

  // Estado para indicar si hay un error en el nombre
  const [nameError, setNameError] = useState(false)

  // Estado para indicar si hay un error en el ID de la sala
  const [joinIdError, setJoinIdError] = useState(false)

  // Obtiene el objeto de enrutamiento de Next.js
  const router = useRouter()

  // Maneja la creación de una sala
  const handleCreateRoom = () => {
    if (!name) return setNameError(true) // Verifica si no se ha ingresado un nombre
    setNameError(false) // Reinicia el estado de error de nombre
    const roomId = nanoid() // Genera un ID de sala único
    setUser({ name, roomId, members: [], leader: name }) // Establece el usuario en el contexto
    router.push(`/room/${roomId}`) // Redirige al usuario a la página de la sala
  }

  // Maneja la unión a una sala existente
  const handleJoinRoom = () => {
    if (!name) return setNameError(true) // Verifica si no se ha ingresado un nombre
    setNameError(false) // Reinicia el estado de error de nombre
    if (!joinId || joinId.length > 4) return setJoinIdError(true) // Verifica si el ID de la sala es válido
    setJoinIdError(false) // Reinicia el estado de error de ID de la sala
    setUser({ name, roomId: joinId, members: [], leader: "" }) // Establece el usuario en el contexto con el ID de la sala
    router.push(`/room/${joinId}`) // Redirige al usuario a la página de la sala
  }

  return (
    <main className="min-h-screen py-10 bg-gradient-to-br from-purple-900 to-blue-900">
      {/* Título */}
      <h1 className="p-2 mx-auto text-3xl font-bold text-center text-white md:text-5xl w-max font-sans" >
                Pinturillo
        </h1>
      <div className="flex flex-col p-6 mx-auto mt-20 rounded-lg borer-2 glass md:p-10 gap-y-6 w-max ">
        <input
          type="text"
          placeholder="Nombre *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 text-lg border-2 border-black rounded-md w-60 md:w-80 outline-0 btn-shadow font-sans "
        />
        {nameError && <p className="text-red-600">Ingresa un nombre</p>}
        <input
          type="text"
          placeholder="ID de la sala"
          value={joinId}
          onChange={(e) => setJoinId(e.target.value.toUpperCase())}
          className="p-2 text-lg border-2 border-black rounded-md w-60 md:w-80 outline-0 btn-shadow font-sans"
        />
        {joinIdError && (
          <p className="text-red-600">Ingresa un ID de sala válido</p>
        )}

        <button
          onClick={handleJoinRoom}
          className="block w-full p-2 mx-auto text-2xl font-sans text-center text-white transition-all bg-blue-500 rounded-md md:text-3xl btn-shadow hover:scale-105 active:scale-90"
        >
          Unirse a la sala
        </button>
        <button
          onClick={handleCreateRoom}
          className="block w-full p-2 mx-auto text-2xl font-sans text-center text-white transition-all rounded-md bg-emerald-500 md:text-3xl btn-shadow hover:scale-105 active:scale-90"
        >
          Crear sala
        </button>
      </div>
    </main>
  )
}
