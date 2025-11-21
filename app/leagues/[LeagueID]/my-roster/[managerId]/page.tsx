"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Types
interface MLETeam {
  id: string;
  name: string;
  leagueId: string;
  slug: string;
  logoPath: string;
  primaryColor: string;
  secondaryColor: string;
  weeklyStats: any | null;
}

interface RosterSlot {
  id: string;
  position: string;
  slotIndex: number;
  isLocked: boolean;
  fantasyPoints: number | null;
  mleTeam: MLETeam;
}

interface RosterData {
  fantasyTeam: {
    id: string;
    displayName: string;
    shortCode: string;
    ownerDisplayName: string;
  };
  league: {
    id: string;
    currentWeek: number;
    rosterConfig: {
      "2s": number;
      "3s": number;
      flx: number;
      be: number;
    };
  };
  week: number;
  rosterSlots: RosterSlot[];
}

// Draggable Roster Row Component
function DraggableRosterRow({
  slot,
  gameMode,
  onGameModeToggle,
  isEditable,
}: {
  slot: RosterSlot;
  gameMode: "2s" | "3s";
  onGameModeToggle: () => void;
  isEditable: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slot.id, disabled: slot.isLocked || !isEditable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: slot.isLocked || !isEditable ? "default" : "grab",
  };

  const isFlex = slot.position === "flx";
  const isBench = slot.position === "be";
  const canToggleMode = (isFlex || isBench) && !slot.isLocked && isEditable;

  const stats = slot.mleTeam.weeklyStats;

  return (
    <tr
      ref={setNodeRef}
      style={{
        ...style,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        backgroundColor: slot.position === "be" ? "rgba(255,255,255,0.02)" : "transparent",
      }}
      {...attributes}
      {...(slot.isLocked || !isEditable ? {} : listeners)}
    >
      {/* Drag Handle */}
      <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
        {!slot.isLocked && isEditable && (
          <span style={{ cursor: "grab", color: "var(--text-muted)", fontSize: "1.2rem" }}>
            ⋮⋮
          </span>
        )}
        {slot.isLocked && (
          <span style={{ color: "#ef4444", fontSize: "1rem" }} title="Locked">
            🔒
          </span>
        )}
      </td>

      {/* Game Mode Toggle */}
      <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
        {canToggleMode && (
          <button
            onClick={onGameModeToggle}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "4px",
              padding: "0.25rem 0.5rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--accent)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(242, 182, 50, 0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
            }
          >
            ⇄
          </button>
        )}
      </td>

      {/* Position */}
      <td
        style={{
          padding: "0.75rem 1rem",
          fontWeight: 700,
          fontSize: "0.9rem",
          color:
            slot.position === "be" ? "var(--text-muted)" : "var(--accent)",
        }}
      >
        {canToggleMode ? gameMode.toUpperCase() : slot.position.toUpperCase()}
      </td>

      {/* Team */}
      <td style={{ padding: "0.75rem 1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Image
            src={slot.mleTeam.logoPath}
            alt={slot.mleTeam.name}
            width={24}
            height={24}
            style={{ borderRadius: "4px" }}
          />
          <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
            {slot.mleTeam.leagueId} {slot.mleTeam.name}
          </span>
        </div>
      </td>

      {/* Score */}
      <td
        style={{
          padding: "0.75rem 1rem",
          textAlign: "center",
          fontWeight: 700,
          fontSize: "1rem",
          color: slot.fantasyPoints ? "var(--accent)" : "var(--text-muted)",
        }}
      >
        {slot.fantasyPoints?.toFixed(1) || "-"}
      </td>

      {/* Stats */}
      <td
        style={{
          padding: "0.75rem 1rem",
          textAlign: "right",
          fontSize: "0.9rem",
        }}
      >
        {stats?.sprocketRating?.toFixed(0) || "-"}
      </td>
      <td
        style={{
          padding: "0.75rem 1rem",
          textAlign: "right",
          color: "var(--text-muted)",
          fontSize: "0.9rem",
        }}
      >
        {stats?.goals || "-"}
      </td>
      <td
        style={{
          padding: "0.75rem 1rem",
          textAlign: "right",
          color: "var(--text-muted)",
          fontSize: "0.9rem",
        }}
      >
        {stats?.saves || "-"}
      </td>
      <td
        style={{
          padding: "0.75rem 1rem",
          textAlign: "right",
          color: "var(--text-muted)",
          fontSize: "0.9rem",
        }}
      >
        {stats?.assists || "-"}
      </td>
    </tr>
  );
}

export default function MyRosterPage() {
  const router = useRouter();
  const params = useParams();
  const leagueId = params.LeagueID as string;
  const teamId = params.managerId as string;

  const [rosterData, setRosterData] = useState<RosterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [activeTab, setActiveTab] = useState<"lineup" | "stats">("lineup");
  const [gameMode, setGameMode] = useState<"2s" | "3s">("2s");

  // Track game modes for flex and bench slots
  const [slotGameModes, setSlotGameModes] = useState<Record<string, "2s" | "3s">>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch roster data
  useEffect(() => {
    const fetchRoster = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/leagues/${leagueId}/rosters/${teamId}?week=${currentWeek}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch roster");
        }

        const data = await response.json();
        setRosterData(data);

        // Initialize game modes for flex and bench slots
        const modes: Record<string, "2s" | "3s"> = {};
        data.rosterSlots.forEach((slot: RosterSlot) => {
          if (slot.position === "flx" || slot.position === "be") {
            modes[slot.id] = "2s"; // Default to 2s
          }
        });
        setSlotGameModes(modes);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load roster");
      } finally {
        setLoading(false);
      }
    };

    fetchRoster();
  }, [leagueId, teamId, currentWeek]);

  // Update current week when roster data loads
  useEffect(() => {
    if (rosterData) {
      setCurrentWeek(rosterData.league.currentWeek);
    }
  }, [rosterData]);

  const handleScheduleClick = () => {
    router.push(
      `/leagues/${leagueId}/my-roster/${teamId}/schedule`
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !rosterData) {
      return;
    }

    const activeSlot = rosterData.rosterSlots.find((s) => s.id === active.id);
    const overSlot = rosterData.rosterSlots.find((s) => s.id === over.id);

    if (!activeSlot || !overSlot) return;

    // Don't allow dragging if either slot is locked
    if (activeSlot.isLocked || overSlot.isLocked) {
      alert("Cannot move locked roster slots");
      return;
    }

    // Optimistically update UI
    const newSlots = [...rosterData.rosterSlots];
    const activeIndex = newSlots.findIndex((s) => s.id === active.id);
    const overIndex = newSlots.findIndex((s) => s.id === over.id);
    const reorderedSlots = arrayMove(newSlots, activeIndex, overIndex);

    setRosterData({
      ...rosterData,
      rosterSlots: reorderedSlots,
    });

    // Make API call to update
    try {
      const response = await fetch(
        `/api/leagues/${leagueId}/rosters/${teamId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rosterSlotId: activeSlot.id,
            newPosition: overSlot.position,
            newSlotIndex: overSlot.slotIndex,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update roster");
      }

      // Refetch to get the updated state
      const updatedData = await response.json();
      setRosterData({
        ...rosterData,
        rosterSlots: updatedData.rosterSlots,
      });
    } catch (err) {
      console.error("Error updating roster:", err);
      alert("Failed to update roster. Please try again.");
      // Revert optimistic update
      setRosterData(rosterData);
    }
  };

  const toggleSlotGameMode = (slotId: string) => {
    setSlotGameModes((prev) => ({
      ...prev,
      [slotId]: prev[slotId] === "2s" ? "3s" : "2s",
    }));
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Loading roster...
        </div>
      </div>
    );
  }

  if (error || !rosterData) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#ef4444", fontSize: "1.1rem" }}>
          Error: {error || "Failed to load roster"}
        </div>
      </div>
    );
  }

  const isCurrentWeek = currentWeek === rosterData.league.currentWeek;
  const isPastWeek = currentWeek < rosterData.league.currentWeek;

  return (
    <>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1
          className="page-heading"
          style={{
            fontSize: "2.5rem",
            color: "var(--accent)",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Roster
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={handleScheduleClick}
            style={{
              backgroundColor: "var(--accent)",
              color: "#1a1a2e",
              padding: "0.5rem 1.5rem",
              borderRadius: "2rem",
              fontWeight: 700,
              fontSize: "1rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Schedule
          </button>
        </div>
      </div>

      {/* Team Overview Card */}
      <section
        className="card"
        style={{
          marginBottom: "1.5rem",
          padding: "1.5rem 2rem",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text-main)",
              marginBottom: "0.5rem",
              marginTop: 0,
            }}
          >
            {rosterData.fantasyTeam.displayName}{" "}
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "1rem",
                marginLeft: "0.5rem",
              }}
            >
              ({rosterData.fantasyTeam.shortCode})
            </span>
          </h2>
          <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            {rosterData.fantasyTeam.ownerDisplayName}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setActiveTab("lineup")}
          className={activeTab === "lineup" ? "btn btn-primary" : "btn btn-ghost"}
          style={{ fontSize: "1rem" }}
        >
          Lineup
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={activeTab === "stats" ? "btn btn-primary" : "btn btn-ghost"}
          style={{ fontSize: "1rem" }}
        >
          Stats
        </button>
      </div>

      {/* Lineup Tab */}
      {activeTab === "lineup" && (
        <section className="card">
          {/* Week Navigation and Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={() => setCurrentWeek((prev) => Math.max(1, prev - 1))}
                className="btn btn-ghost"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
                disabled={currentWeek === 1}
              >
                ◄ Week {currentWeek - 1}
              </button>
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--accent)",
                }}
              >
                Week {currentWeek}
              </span>
              <button
                onClick={() => setCurrentWeek((prev) => prev + 1)}
                className="btn btn-ghost"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
              >
                Week {currentWeek + 1} ►
              </button>
            </div>
            {!isPastWeek && (
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                {isPastWeek && (
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Past weeks are read-only
                  </span>
                )}
                {!isCurrentWeek && (
                  <span style={{ color: "#f59e0b", fontSize: "0.9rem" }}>
                    Future week
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Roster Table */}
          <div style={{ overflowX: "auto" }}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ padding: "0.75rem 0.5rem", width: "40px" }}></th>
                    <th style={{ padding: "0.75rem 0.5rem", width: "40px" }}></th>
                    <th
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      Slot
                    </th>
                    <th
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      Team
                    </th>
                    <th
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "center",
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      Score
                    </th>
                    <th
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      Rating
                    </th>
                    <th
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      Goals
                    </th>
                    <th
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      Saves
                    </th>
                    <th
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      Assists
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <SortableContext
                    items={rosterData.rosterSlots.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {rosterData.rosterSlots.map((slot) => (
                      <DraggableRosterRow
                        key={slot.id}
                        slot={slot}
                        gameMode={slotGameModes[slot.id] || "2s"}
                        onGameModeToggle={() => toggleSlotGameMode(slot.id)}
                        isEditable={isCurrentWeek}
                      />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>
          </div>
        </section>
      )}

      {/* Stats Tab - Similar to before but with real data */}
      {activeTab === "stats" && (
        <section className="card">
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            Stats view coming soon...
          </div>
        </section>
      )}
    </>
  );
}
