// ste código define un componente RoomMembers que
// renderiza una lista de miembros de una sala.
// Utiliza clases CSS para estilizar el contenedor
// y los elementos dentro de él. Los miembros se
// muestran como elementos <h1>.

import React from "react"

const RoomMembers = ({ members }: { members: string[] }) => {
    return (
        <div className="flex flex-col p-3 px-8 bg-white border-2 border-black rounded-md gap-y-2">
            <h1 className="text-3xl font-semibold capitalize">Miembros</h1>
            <div className="text-2xl">
                {members.map((member, i) => (
                    <h1 key={i} className="">
                        {member}
                    </h1>
                ))}
            </div>
        </div>
    )
}

export default RoomMembers
