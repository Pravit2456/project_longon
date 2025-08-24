import { useEffect, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import { useUser } from "./UserContext";

// type-only imports
import type { EventInput } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";

type CalendarEventFromAPI = {
  id: number;
  title: string;
  activity_date: string;
};

export default function Calendartwo() {
  const { userId } = useUser();
  const [events, setEvents] = useState<EventInput[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [currentView, setCurrentView] = useState<"dayGridMonth" | "dayGridWeek">("dayGridMonth");

  useEffect(() => {
    if (!userId) return;
    axios
      .get<CalendarEventFromAPI[]>(`http://localhost:3000/api/calendar/${userId}`, {
        withCredentials: true,
      })
      .then((res) => {
        const loadedEvents: EventInput[] = res.data.map((event) => ({
          id: event.id.toString(),
          title: event.title,
          date: event.activity_date,
        }));
        setEvents(loadedEvents);
      })
      .catch((err) => console.error("โหลดข้อมูลผิดพลาด:", err));
  }, [userId]);

  const handleDateClick = (arg: DateClickArg) => setSelectedDate(arg.dateStr);

  const handleAddEvent = async () => {
    if (selectedDate && newEventTitle.trim() && userId) {
      try {
        type CreateEventResponse = { insertId: number };
        const response = await axios.post<CreateEventResponse>(
          "http://localhost:3000/api/calendar",
          {
            user_id: userId,
            title: newEventTitle,
            activity_date: selectedDate,
          },
          { withCredentials: true }
        );

        const newEventId = response.data.insertId.toString();
        setEvents([
          ...events,
          { id: newEventId, title: newEventTitle, date: selectedDate },
        ]);
      } catch (err) {
        console.error("บันทึกผิดพลาด:", err);
      }
    }
    setSelectedDate(null);
    setNewEventTitle("");
  };

  return (
    <div className="p-6 bg-[#f0fdfb] min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-teal-700 flex items-center">
        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 
                   1.1.9 2 2 2h14c1.1 0 2-.9 
                   2-2V6c0-1.1-.9-2-2-2zm0 
                   16H5V9h14v11zm0-13H5V6h14v1z" />
        </svg>
        ปฏิทินกิจกรรมเกษตร
      </h2>

      {/* ปุ่มเปลี่ยนมุมมอง */}
      <div className="mb-2 text-right">
        <button
          onClick={() => setCurrentView("dayGridMonth")}
          className={`px-4 py-1 text-sm rounded mr-2 ${
            currentView === "dayGridMonth"
              ? "bg-[#b2e1d9] text-teal-700"
              : "hover:bg-gray-200"
          }`}
        >
          Month
        </button>
        <button
          onClick={() => setCurrentView("dayGridWeek")}
          className={`px-4 py-1 text-sm rounded ${
            currentView === "dayGridWeek"
              ? "bg-[#b2e1d9] text-teal-700"
              : "hover:bg-gray-200"
          }`}
        >
          Week
        </button>
      </div>

      {/* FullCalendar */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView={currentView}
        locale={thLocale}
        events={events}
        dateClick={handleDateClick}
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        dayCellClassNames={() => "border-none bg-transparent text-center py-2"}
        dayCellContent={(arg) => {
          const dateStr = arg.date.toISOString().split("T")[0];
          const dayEvents = events.filter((e) => e.date === dateStr);
          const isMultiActivities = dayEvents.length > 1;

          return (
            <div className="flex flex-col items-center justify-center space-y-1">
              <span>{arg.dayNumberText}</span>
              {dayEvents.slice(0, 2).map((event, index) => (
                <span key={index} className="text-sm">
                  {event.title}
                </span>
              ))}
              {isMultiActivities && (
                <span className="text-xs text-gray-500">
                  {dayEvents.length} activities
                </span>
              )}
            </div>
          );
        }}
      />

      {/* Modal เพิ่มกิจกรรม */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-teal-700 mb-2">
              เพิ่มกิจกรรมในวันที่ {selectedDate}
            </h3>
            <input
              type="text"
              placeholder="เช่น 🌱 ปลูกลำไย"
              className="w-full border rounded px-4 py-2 mb-4"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedDate(null)}
                className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-1 rounded bg-teal-600 text-white hover:bg-teal-700"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
