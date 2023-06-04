import { useEffect, useRef, useState } from "react"

// . Esta función será invocada cuando ocurra un evento de dibujo en el lienzo
const useDraw = (
    onDraw: ({ ctx, prePoints, currentPoints }: OnDraw) => void
) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
// se utiliza para mantener un seguimiento del punto previo dibujado en el lienzo.
    const prePoint = useRef<null | Points>(null)
// que indica si el botón del mouse está presionado o no.
    const [isMouseDown, setIsMouseDown] = useState(false)

    const onMouseDown = () => setIsMouseDown(true)
// que se utiliza para limpiar el lienzo
    const handleClear = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
// maneja los eventos de dibujo en el lienzo.
    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            // Código del manejo del evento mousedown
            if (!isMouseDown) return

            const currentPoints = getCurrentPoints(e)

            const ctx = canvasRef.current?.getContext("2d")

            if (!currentPoints || !ctx) return

            onDraw({ ctx, currentPoints, prePoints: prePoint.current })
            prePoint.current = currentPoints
        }

        const getCurrentPoints = (e: MouseEvent) => {
            // Código para obtener las coordenadas actuales del evento
            const canvas = canvasRef.current

            if (!canvas) return

            const rect = canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            return { x, y }
        }

        const handleMouseUp = () => {
            // Código del manejo del evento mouseup
            setIsMouseDown(false)
            prePoint.current = null
        }

        canvasRef.current?.addEventListener("mousemove", handleMouseDown)
        window.addEventListener("mouseup", handleMouseUp)

        return () => {
            canvasRef.current?.removeEventListener("mousemove", handleMouseDown)
            window.removeEventListener("mouseup", handleMouseUp)
        }
    }, [onDraw])

    return { canvasRef, onMouseDown, handleClear }
}

export default useDraw
