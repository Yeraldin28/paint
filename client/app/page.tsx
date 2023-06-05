"use client"
import { useContext, useEffect, useState } from "react"
import { customAlphabet } from "nanoid"
import { UserContext } from "../components/ContextProvider"
import { useRouter } from "next/navigation"
import 'bootstrap/dist/css/bootstrap.min.css';


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
    <main className="d-flex align-items-center justify-content-center min-vh-100 bg-gradient" >
    {/* Título */}
    <div className="d-flex flex-column p-6 mx-auto mt-20 rounded-lg border-2 glass md:p-10 gap-4 w-max bg-black bg-opacity-50 p-4">
    <h1 className="text-center text-white mb-4">Pinturillo</h1>
      <input
        type="text"
        placeholder="Nombre *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-2 form-control rounded-md w-60 md:w-80"
      />
      {nameError && <p className="text-white">Ingresa un nombre</p>}
      <input
        type="text"
        placeholder="ID de la sala"
        value={joinId}
        onChange={(e) => setJoinId(e.target.value.toUpperCase())}
        className="p-2 form-control rounded-md w-60 md:w-80"
      />
      {joinIdError && (
      <p className="text-white">Ingresa un ID de sala válido</p>
        )}

      <button
        onClick={handleJoinRoom}
        className="btn btn-primary btn-lg btn-block mt-4"
      >
        Unirse a la sala
      </button>
      <button
        onClick={handleCreateRoom}
        className="btn btn-success btn-lg btn-block"
      >
        Crear sala
      </button>
    </div>
  </main>
  )
}
