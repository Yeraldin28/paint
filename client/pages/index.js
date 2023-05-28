import React, { useEffect, useRef, useState } from "react";
import useDraw from "../hooks/useDraw";
import { CirclePicker } from "react-color";
import { io } from "socket.io-client";
import onDraw from "../utils/onDraw";
import getCanvasSize from "../utils/getCanvasSize";
import { UserContext } from "../components/ContextProvider";
import RoomMembers from "../components/RoomMembers";
import { useRouter } from "next/navigation";
import Link from "next/link";

const serverUrl =
  process.env.NODE_ENV === "production"
    ? "https://master--regal-hamster-4c449b.netlify.app"
    : "http://localhost:3001";

const socket = io(serverUrl);

const Room = ({ params }) => {
  const roomId = params.id;
  const [color, setColor] = useState("#000");
  const [size, setSize] = useState(5);
  const [membersState, setMembersState] = useState([]);
  const membersRef = useRef([]);
  const router = useRouter();

  const onCreate = ({ currentPoints, ctx, prePoints }) => {
    socket.emit("onDraw", { currentPoints, prePoints, color, size, roomId });

    onDraw({ currentPoints, ctx, prePoints, color, size });
  };

  const { canvasRef, onMouseDown, handleClear } = useDraw(onCreate);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 500 });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    const { height, width } = getCanvasSize();
    setCanvasSize({ height, width });

    socket.emit("join-room", { roomId });

    socket.on("get-members", (name) => {
      socket.emit("receive-members", roomId, membersRef.current, name);
    });

    socket.on("update-members", (members, name) => {
      membersRef.current = [...members, name];
      setMembersState(membersRef.current);
    });

    socket.on("remove-member", (name) => {
      membersRef.current = membersRef.current.filter(
        (member) => member !== name
      );
      setMembersState(membersRef.current);
    });

    socket.on("get-state", () => {
      if (!canvasRef.current?.toDataURL()) return;

      socket.emit("canvas-state", canvasRef.current.toDataURL(), roomId);
    });

    socket.on("canvas-state-from-server", (state) => {
      const img = new Image();
      img.src = state;
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
    });

    return () => {
      socket.off("get-state");
      socket.off("canvas-state-from-server");
      socket.off("get-members");
      socket.off("update-members");
      socket.off("remove-member");
    };
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    socket.on("onDraw", ({ currentPoints, prePoints, color, size }) => {
      if (!ctx) return;

      onDraw({ currentPoints, ctx, prePoints, color, size });
    });

    socket.on("handleClear", handleClear);

    return () => {
      socket.off("onDraw");
      socket.off("handleClear");
    };
  }, [canvasRef]);

  return (
    <main
      style={{
        backgroundImage: "url(../bg.svg)",
        backgroundSize: "cover",
      }}
      className="min-h-screen py-10 "
    >
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
            <div>
              <h1 className="pb-3 text-xl text-center">Elige Color</h1>
              <CirclePicker
                color={color}
                onChange={(e) => setColor(e.hex)}
              />
            </div>
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
          <button
            onClick={() => socket.emit("handleClear", roomId)}
            className="px-8 py-2 m-2 bg-white border-2 border-black rounded-md"
          >
            Limpiar
          </button>
        </div>
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
  );
};

export default Room;

const ColorCircle = ({ style, setSize, size }) => {
  const circleSize = style === "small" ? 1 : style === "mid" ? 1.5 : 2.25;
  const brushSize = style === "small" ? 5 : style === "mid" ? 7.5 : 10;

  const handleSize = () => {
    setSize(brushSize);
  };

  return (
    <div
      onClick={handleSize}
      style={{ width: `${circleSize}rem`, height: `${circleSize}rem` }}
      className={` text-inherit rounded-full hover:scale-125 transition-all cursor-pointer
      ${size === brushSize ? "border-[3px] border-current" : "bg-current"}
      `}
    ></div>
  );
};
