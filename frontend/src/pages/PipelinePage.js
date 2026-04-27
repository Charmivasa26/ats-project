import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { candidateAPI } from "../api";
import toast from "react-hot-toast";

const COLUMNS = [
  { id: "Applied",     label: "Applied",     color: "border-blue-500",    bg: "bg-blue-500/10" },
  { id: "Screened",    label: "Screened",    color: "border-yellow-500",  bg: "bg-yellow-500/10" },
  { id: "Shortlisted", label: "Shortlisted", color: "border-orange-500",  bg: "bg-orange-500/10" },
  { id: "Interview",   label: "Interview",   color: "border-purple-500",  bg: "bg-purple-500/10" },
  { id: "Selected",    label: "Selected",    color: "border-emerald-500", bg: "bg-emerald-500/10" },
  { id: "Rejected",    label: "Rejected",    color: "border-red-500",     bg: "bg-red-500/10" },
];

const PipelinePage = () => {
  const [board, setBoard] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAndOrganize = async () => {
    try {
      const { data } = await candidateAPI.getAll();
      const organized = {};
      COLUMNS.forEach(({ id }) => { organized[id] = []; });
      data.forEach((c) => {
        if (organized[c.status]) organized[c.status].push(c);
      });
      setBoard(organized);
    } catch {
      toast.error("Failed to load pipeline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAndOrganize(); }, []);

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcCol  = source.droppableId;
    const dstCol  = destination.droppableId;
    const srcItems = Array.from(board[srcCol]);
    const dstItems = srcCol === dstCol ? srcItems : Array.from(board[dstCol]);

    const [moved] = srcItems.splice(source.index, 1);
    dstItems.splice(destination.index, 0, { ...moved, status: dstCol });

    setBoard({
      ...board,
      [srcCol]: srcItems,
      [dstCol]: dstItems,
    });

    try {
      await candidateAPI.updateStatus(draggableId, { status: dstCol });
      toast.success(`Moved to ${dstCol}`);
    } catch {
      toast.error("Failed to update status");
      fetchAndOrganize(); // revert
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const total = Object.values(board).reduce((acc, col) => acc + col.length, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Candidate Pipeline</h1>
        <p className="page-sub">{total} candidates — drag cards to update status</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(({ id, label, color, bg }) => (
            <div key={id} className={`flex-shrink-0 w-60 rounded-xl border-t-4 ${color} bg-slate-800/60 border border-slate-700`}>
              {/* Column header */}
              <div className="flex items-center justify-between p-3 border-b border-slate-700">
                <span className="text-white font-semibold text-sm">{label}</span>
                <span className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">
                  {board[id]?.length || 0}
                </span>
              </div>

              {/* Cards */}
              <Droppable droppableId={id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-2 min-h-[200px] space-y-2 transition-colors duration-200 ${snapshot.isDraggingOver ? bg : ""}`}
                  >
                    {board[id]?.map((candidate, index) => (
                      <Draggable key={candidate._id} draggableId={candidate._id} index={index}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`bg-slate-800 border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all duration-150 shadow-sm
                              ${snap.isDragging
                                ? "border-blue-500 shadow-lg shadow-blue-500/20 rotate-1 scale-105"
                                : "border-slate-700 hover:border-slate-500"}`}
                          >
                            <p className="text-white font-semibold text-sm truncate">{candidate.name}</p>
                            <p className="text-slate-400 text-xs mt-0.5 truncate">{candidate.email}</p>
                            {candidate.jobId?.title && (
                              <p className="text-blue-400 text-xs mt-1.5 truncate">💼 {candidate.jobId.title}</p>
                            )}
                            {candidate.vendorId?.name && (
                              <p className="text-slate-500 text-xs mt-0.5 truncate">🏢 {candidate.vendorId.name}</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              {candidate.experience > 0 && (
                                <span className="text-slate-400 text-xs">{candidate.experience}y exp</span>
                              )}
                              {candidate.skillsTags?.length > 0 && (
                                <span className="bg-slate-700 text-slate-300 text-xs px-1.5 py-0.5 rounded truncate max-w-[90px]">
                                  {candidate.skillsTags[0]}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {!board[id]?.length && (
                      <div className="flex items-center justify-center h-20 text-slate-600 text-xs">
                        Drop here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default PipelinePage;
