"use client"
import { useContext, useEffect, useRef, useState } from "react"
import useDraw from "../../../hooks/useDraw"
import { CirclePicker } from "react-color"
import { io } from "socket.io-client"
import onDraw from "../../../utils/onDraw"
import getCanvasSize from "../../../utils/getCanvasSize"
import { UserContext } from "../../../components/ContextProvider"
import RoomMembers from "../../../components/RoomMembers"
import { useRouter } from "next/navigation"
import Link from "next/link"
import 'bootstrap/dist/css/bootstrap.min.css';

const serverUrl =
    process.env.NODE_ENV === "production"
        ? "https://next-paint-io.onrender.com"
        : "http://localhost:3001"

// establece la URL del servidor al que se conectará el socket.io
const socket = io(serverUrl)

interface ParamsProps {
    params: RoomProps
}

const Room = ({ params }: ParamsProps) => {
    const { setUser, user } = useContext(UserContext)
    const roomId = params.id
    const [color, setColor] = useState("#000") // Estado para almacenar el color seleccionado
    const [size, setSize] = useState<5 | 7.5 | 10>(5) // Estado para almacenar el tamaño del pincel
    const [membersState, setMembersState] = useState<string[]>([]) // Estado para almacenar los miembros de la sala
    const membersRef = useRef<string[]>([]) // Referencia mutable para almacenar los miembros de la sala
    const router = useRouter()

    const onCreate = ({ currentPoints, ctx, prePoints }: OnDraw) => {
        // Envía los puntos de dibujo al servidor mediante el socket y llama a la función onDraw localmente
        socket.emit("onDraw", { currentPoints, prePoints, color, size, roomId })

        onDraw({ currentPoints, ctx, prePoints, color, size })
    }

    const { canvasRef, onMouseDown, handleClear } = useDraw(onCreate) // Lógica para dibujar en el lienzo
    const [canvasSize, setCanvasSize] = useState({ width: 500, height: 500 }) // Estado para almacenar el tamaño del lienzo

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d")

        const { height, width } = getCanvasSize()
        setCanvasSize({ height, width })

        socket.emit("join-room", { roomId }) // Se une a la sala especificada mediante el socket

        if (user.leader === user.name) {
            socket.emit("client-ready-leader", roomId, user.name)
        } else {
            socket.emit("client-ready", roomId, user.name)
        }
        socket.on("get-members", (name: string) => {
            // Recibe los miembros de la sala y los envía al servidor mediante el socket
            socket.emit("receive-members", roomId, membersRef.current, name)
        })

        socket.on("update-members", (members: string[], name: string) => {
            // Actualiza la lista de miembros de la sala y los muestra en la interfaz
            membersRef.current = [...members, name]
            setMembersState(membersRef.current)
        })

        socket.on("remove-member", (name: string) => {
            // Elimina a un miembro de la sala y actualiza la lista de miembros en la interfaz
            membersRef.current = membersRef.current.filter(
                (member) => member !== name
            )
            setMembersState(membersRef.current)
        })

        socket.on("get-state", () => {
            // Solicita el estado actual del lienzo al servidor y lo envía mediante el socket
            if (!canvasRef.current?.toDataURL()) return

            socket.emit("canvas-state", canvasRef.current.toDataURL(), roomId)
        })

        socket.on("canvas-state-from-server", (state: string) => {
            // Recibe el estado del lienzo desde el servidor y lo dibuja en el contexto del lienzo local
            const img = new Image()
            img.src = state
            img.onload = () => {
                ctx?.drawImage(img, 0, 0)
            }
        })

        return () => {
            // Limpia los eventos del socket al desmontar el componente
            socket.off("get-state")
            socket.off("canvas-state-from-server")
            socket.off("get-members")
            socket.off("update-members")
            socket.off("remove-member")
            socket.emit("exit", roomId, user.name)
        }
    }, [])

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d")

        socket.on("onDraw", ({ currentPoints, prePoints, color, size }) => {
            // Recibe eventos de dibujo desde el servidor y los dibuja en el contexto del lienzo local
            if (!ctx) return

            onDraw({ currentPoints, ctx, prePoints, color, size })
        })

        socket.on("handleClear", handleClear) // Recibe eventos de limpiar el lienzo desde el servidor

        return () => {
            // Limpia los eventos del socket al desmontar el componente
            socket.off("onDraw")
            socket.off("handleClear")
        }
    }, [canvasRef])

    return (
          <main className="min-h-screen py-10 bg-gradient-to-br from-purple-900 to-blue-900">
            <div className="container mx-auto">
              <div className="row ">
                <div className="col-lg-3  d-flex align-items-center justify-content-center ">
                  <RoomMembers members={membersState} />
                </div>
                <div className="col-lg-9">
                  <h1 className="p-2 mx-auto text-3xl font-bold text-center text-white md:text-5xl w-max font-sans">
                    Pinturillo
                  </h1>
                <h1 className="p-2 mx-auto text-3xl font-bold text-center text-white md:text-5xl w-max font-sans">
                  ID de la Sala: {roomId}
                </h1>
                <div className="d-flex flex-column align-items-center justify-content-center mt-8">
                  <div className="d-flex p-4 bg-black bg-opacity-50 border-2 border-black rounded-lg gap-3">
                    <div>
                      <h1 className="pb-3 text-xl text-center font-sans text-white">
                        Elija un color
                      </h1>
                      <CirclePicker
                        color={color}
                        onChange={(e:any) => setColor(e.hex)}
                      />
                    </div>
                    <div>
                      <h1 className="pb-3 text-xl text-center text-white font-sans">Tamaño</h1>
                      <div
                      style={{ color: color }}
                      className="flex p-4 d-flex justify-content-center  flex-col items-center justify-center gap-y-5"
                    >
                      <div className="p-3 mx-auto my-auto">
                        <ColorCircle
                        style={"small"}
                        size={size}
                        setSize={setSize}
                      />
                      </div>
                      
                      <div className="p-3 mx-auto my-auto">
                        <ColorCircle
                        style={"mid"}
                        size={size}
                        setSize={setSize}
                      />
                      </div>
                      <div className="p-3 mx-auto my-auto">
                      <ColorCircle
                        style={"large"}
                        size={size}
                        setSize={setSize}
                      />
                      </div>

                    </div>
                    </div>
                    <button
                      onClick={() => socket.emit("handleClear", roomId)}
                      className="btn btn-primary"
                    >
                      Limpiar
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    onMouseDown={onMouseDown}
                    className="bg-white border-4 border-black rounded-md mt-4"
                    width={canvasSize.width}
                    height={canvasSize.height}
                  />
                   <Link href={"/"}>
                   <button
                    className="btn btn-primary btn-lg btn-block mt-4"
                  >
                    Atras
                  </button>
                </Link>
                </div>
              </div>
            </div>
            </div>
                       
          </main>
        )
}

export default Room

const ColorCircle = ({ style, setSize, size }: ColorCicleProps) => {
    const circleSize = style === "small" ? 1 : style === "mid" ? 1.5 : 2.25
    const brushSize = style === "small" ? 5 : style === "mid" ? 7.5 : 10

    const handleSize = () => {
        setSize(brushSize)
    }

    return (
    <div
      onClick={handleSize}
      style={{ width: `${circleSize}rem`, height: `${circleSize}rem` }}
      className={`rounded-circle hover:scale-125 transition-all cursor-pointer ${size === brushSize ? "border-4 bg-gray border border-white" : "bg-white"}`}
    ></div>

    )
}
