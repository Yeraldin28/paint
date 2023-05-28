import React from 'react';
import { useEffect, useRef, useState } from "react"
import useDraw from "../../../hooks/useDraw"
import { CirclePicker } from "react-color"
import { io } from "socket.io-client"
import onDraw from "../../../utils/onDraw"
import getCanvasSize from "../../../utils/getCanvasSize"
import { UserContext } from "../../../components/ContextProvider"
import RoomMembers from "../../../components/RoomMembers"
import { useRouter } from "next/navigation"
import Link from "next/link"

// permite que la aplicación se conecte a diferentes servidores de socket dependiendo del entorno
const serverUrl =
    process.env.NODE_ENV === "production"
        ? "https://master--regal-hamster-4c449b.netlify.app"
        : "http://localhost:3001"

const socket = io(serverUrl)

interface ParamsProps {
    params: RoomProps
}

const Room = ({ params }: ParamsProps) => {
    // const { setUser, user } = useContext(UserContext)
    const roomId = params.id
    const [color, setColor] = useState("#000")
    const [size, setSize] = useState<5 | 7.5 | 10>(5)
    const [membersState, setMembersState] = useState<string[]>([])
    const membersRef = useRef<string[]>([])
    const router = useRouter()

    // se encarga de notificar sobre un dibujo en curso
    // y luego realizar el dibujo en el lienzo.
    const onCreate = ({ currentPoints, ctx, prePoints }: OnDraw) => {
        socket.emit("onDraw", { currentPoints, prePoints, color, size, roomId })

        onDraw({ currentPoints, ctx, prePoints, color, size })
    }

    // configurar el entorno de dibujo en el lienzo, incluyendo la obtención
    // del contexto del lienzo, la gestión de las dimensiones y el estado del lienzo.
    const { canvasRef, onMouseDown, handleClear } = useDraw(onCreate)
    const [canvasSize, setCanvasSize] = useState({ width: 500, height: 500 })

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d")

        const { height, width } = getCanvasSize()
        setCanvasSize({ height, width })

        //  para unirse a la sala
        socket.emit("join-room", { roomId })

        // para recibir la lista de miembros actuales
        socket.on("get-members", (name: string) => {
            socket.emit("receive-members", roomId, membersRef.current, name)
        })

        // actualizar la lista de miembros cuando se recibe una actualización
        socket.on("update-members", (members: string[], name: string) => {
            membersRef.current = [...members, name]
            setMembersState(membersRef.current)
        })

        // eliminar un miembro de la lista cuando se recibe una notificación
        socket.on("remove-member", (name: string) => {
            membersRef.current = membersRef.current.filter(
                (member) => member !== name
            )
            setMembersState(membersRef.current)
        })

        // enviar el estado actual del lienzo cuando se recibe una solicitud
        socket.on("get-state", () => {
            if (!canvasRef.current?.toDataURL()) return

            socket.emit("canvas-state", canvasRef.current.toDataURL(), roomId)
        })

        // Recibir el estado del lienzo desde el servidor y mostrarlo en el lienzo
        socket.on("canvas-state-from-server", (state: string) => {
            const img = new Image()
            img.src = state
            img.onload = () => {
                ctx?.drawImage(img, 0, 0)
            }
        })

        // Limpiar los listeners del socket cuando se desmonta el componente
        return () => {
            socket.off("get-state")
            socket.off("canvas-state-from-server")
            socket.off("get-members")
            socket.off("update-members")
            socket.off("remove-member")
        }
    }, [])

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d")

        // Escuchar eventos de dibujo y limpieza del lienzo desde el socket
        socket.on("onDraw", ({ currentPoints, prePoints, color, size }) => {
            if (!ctx) return

            onDraw({ currentPoints, ctx, prePoints, color, size })
        })

        socket.on("handleClear", handleClear)

        // Limpiar los listeners del socket cuando se desmonta el componente
        return () => {
            socket.off("onDraw")
            socket.off("handleClear")
        }
    }, [canvasRef])

    // Redireccionar a la página principal si no se ha proporcionado un nombre de usuario
    // if (!user.name) router.push("/")

    // Renderizado del componente
    return (
        <main
            style={{
                backgroundImage: "url(../bg.svg)",
                backgroundSize: "cover",
            }}
            className="min-h-screen py-10 "
        >
            {/*   Titulo    */}
            <Link href={"/"}>
                <h1 className="p-2 mx-auto text-3xl font-bold text-center text-white bg-black rounded-md md:text-5xl w-max">
                    pinturillo
                </h1>
            </Link>
            <h1 className="p-2 mx-auto mt-8 text-2xl font-bold text-center text-white bg-black rounded-md md:text-4xl w-max">
                Sala ID : {roomId}
            </h1>
            <div className="flex flex-col items-center justify-center mt-20 lg:flex-row gap-x-10 ">
                <div className="flex flex-col gap-4">
                    <div className="flex p-4 pt-2 bg-white border-2 border-black rounded-lg gap-x-6">
                        {/*        Color para elegir  */}
                        <div>
                            <h1 className="pb-3 text-xl text-center">
                                Elige Color
                            </h1>
                            <CirclePicker
                                color={color}
                                onChange={(e:any) => setColor(e.hex)}
                            />
                        </div>
                        {/*         Tamaño Picker     */}
                        <div>
                            <h1 className="pb-3 text-xl text-center">Tamaño</h1>
                            <div
                                style={{ color: color }}
                                className="flex flex-col items-center justify-center gap-y-5"
                            >
                                <ColorCircle
                                    style={"small"}
                                    size={size}
                                    setSize={setSize}
                                />
                                <ColorCircle
                                    style={"mid"}
                                    size={size}
                                    setSize={setSize}
                                />
                                <ColorCircle
                                    style={"large"}
                                    size={size}
                                    setSize={setSize}
                                />
                            </div>
                        </div>
                    </div>
                    {/* limpiar el lienzo */}
                    <button
                        onClick={() => socket.emit("handleClear", roomId)}
                        className="px-8 py-2 m-2 bg-white border-2 border-black rounded-md"
                    >
                        Limpiar
                    </button>
                </div>
                {/*         Lienzo de dibujo       */}
                <canvas
                    ref={canvasRef}
                    onMouseDown={onMouseDown}
                    className="bg-white border-4 border-black rounded-md"
                    width={canvasSize.width}
                    height={canvasSize.height}
                />
                <RoomMembers members={membersState} />
            </div>
        </main>
    )
}

export default Room

// Componente para representar un círculo de tamaño de pincel en la interfaz
const ColorCircle = ({ style, setSize, size }: ColorCicleProps) => {
    const circleSize = style == "small" ? 1 : style == "mid" ? 1.5 : 2.25
    const brushSize = style == "small" ? 5 : style == "mid" ? 7.5 : 10

    const handleSize = () => {
        setSize(brushSize)
    }

    return (
        <div
            onClick={handleSize}
            style={{ width: `${circleSize}rem`, height: `${circleSize}rem` }}
            className={` text-inherit rounded-full hover:scale-125 transition-all cursor-pointer
            ${size == brushSize ? "border-[3px] border-current" : "bg-current"}
            `}
        ></div>
    )
}
