/**
 * Pure Calendar Component
 *
 * A reusable, props-based calendar component in the style of Google Calendar.
 * This component is "pure" - it receives data via props and doesn't read from
 * external sources like Convex, making it easier to test and reuse.
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color?: string;
  onClick?: () => void;
}

interface CalendarProps {
  events: CalendarEvent[];
  date?: Date; // The date to display (defaults to today)
  view?: "day" | "week"; // View mode (defaults to week)
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export function Calendar({
  events,
  date = new Date(),
  view = "week",
  onDateChange,
  onEventClick,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(date);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange?.(today);
  };

  return (
    <div className="calendar-container">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />
      {view === "week" ? (
        <WeekView
          currentDate={currentDate}
          events={events}
          onEventClick={onEventClick}
        />
      ) : (
        <DayView
          currentDate={currentDate}
          events={events}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
}

interface CalendarHeaderProps {
  currentDate: Date;
  view: "day" | "week";
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

function CalendarHeader({
  currentDate,
  view,
  onPrevious,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  const formatTitle = () => {
    if (view === "day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
      const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();

      if (sameMonth && sameYear) {
        return `${weekStart.toLocaleDateString("en-US", { month: "long" })} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
      } else if (sameYear) {
        return `${weekStart.toLocaleDateString("en-US", { month: "short" })} ${weekStart.getDate()} - ${weekEnd.toLocaleDateString("en-US", { month: "short" })} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
      } else {
        return `${weekStart.toLocaleDateString("en-US", { month: "short", year: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
      }
    }
  };

  return (
    <div className="flex justify-between items-center mb-4 not-prose">
      <div className="flex items-center gap-2">
        <button onClick={onToday} className="btn btn-sm">
          Today
        </button>
        <div className="btn-group">
          <button onClick={onPrevious} className="btn btn-sm">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={onNext} className="btn btn-sm">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <h2 className="text-xl font-semibold">{formatTitle()}</h2>
      <div className="w-32"></div> {/* Spacer for symmetry */}
    </div>
  );
}

interface ViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

function WeekView({ currentDate, events, onEventClick }: ViewProps) {
  const weekStart = getWeekStart(currentDate);
  const days: Date[] = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    days.push(day);
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="calendar-week-view not-prose">
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b border-base-300">
        <div className="p-2 text-sm font-semibold"></div>
        {days.map((day, i) => {
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={i}
              className={`p-2 text-center text-sm ${isToday ? "text-primary font-bold" : "text-base-content/70"}`}
            >
              <div className="font-semibold">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div
                className={`text-xl ${isToday ? "bg-primary text-primary-content rounded-full w-8 h-8 mx-auto flex items-center justify-center" : ""}`}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="relative overflow-y-auto max-h-[600px]">
        <div className="grid grid-cols-8">
          {/* Hours column */}
          <div>
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-base-300 text-xs text-base-content/70 pr-2 text-right pt-1"
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="relative border-l border-base-300">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-base-300 hover:bg-base-200"
                ></div>
              ))}

              {/* Events overlay */}
              {events
                .filter((event) => isSameDay(event.startTime, day))
                .map((event) => {
                  const eventStart = event.startTime;
                  const eventEnd = event.endTime;
                  const startHour =
                    eventStart.getHours() + eventStart.getMinutes() / 60;
                  const duration =
                    (eventEnd.getTime() - eventStart.getTime()) /
                    (1000 * 60 * 60);

                  const top = startHour * 64; // 64px per hour (h-16)
                  const height = duration * 64;

                  return (
                    <div
                      key={event.id}
                      className="absolute left-1 right-1 rounded p-1 text-xs cursor-pointer overflow-hidden"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: event.color || "#3b82f6",
                        color: "white",
                      }}
                      onClick={() => {
                        event.onClick?.();
                        onEventClick?.(event);
                      }}
                    >
                      <div className="font-semibold truncate">{event.title}</div>
                      <div className="text-xs opacity-90">
                        {formatHour(eventStart.getHours())} -{" "}
                        {formatHour(eventEnd.getHours())}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DayView({ currentDate, events, onEventClick }: ViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEvents = events.filter((event) =>
    isSameDay(event.startTime, currentDate)
  );

  return (
    <div className="calendar-day-view not-prose">
      <div className="relative overflow-y-auto max-h-[600px]">
        <div className="grid grid-cols-2">
          {/* Hours column */}
          <div className="col-span-1">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-base-300 text-xs text-base-content/70 pr-2 text-right pt-1"
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="col-span-1 relative border-l border-base-300">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-base-300 hover:bg-base-200"
              ></div>
            ))}

            {/* Events overlay */}
            {dayEvents.map((event) => {
              const eventStart = event.startTime;
              const eventEnd = event.endTime;
              const startHour =
                eventStart.getHours() + eventStart.getMinutes() / 60;
              const duration =
                (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60);

              const top = startHour * 64; // 64px per hour (h-16)
              const height = duration * 64;

              return (
                <div
                  key={event.id}
                  className="absolute left-2 right-2 rounded p-2 cursor-pointer"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    backgroundColor: event.color || "#3b82f6",
                    color: "white",
                  }}
                  onClick={() => {
                    event.onClick?.();
                    onEventClick?.(event);
                  }}
                >
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-sm opacity-90">
                    {formatHour(eventStart.getHours())} -{" "}
                    {formatHour(eventEnd.getHours())}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Adjust to Sunday
  return new Date(d.setDate(diff));
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}
