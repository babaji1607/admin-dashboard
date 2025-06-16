import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import { createEvent } from "../api/Events";
import { GLOBAL_URL } from "../../utils";

interface CalendarEvent extends EventInput {
  extendedProps?: {
    calendar: string;
    description?: string;
    imageUrl?: string;
    status?: string;
    created_at?: string;
  };
}

interface ApiEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  imageUrl: string;
  status: string;
  created_at: string;
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  // Fetch events from API
  const fetchEventsFromAPI = async (startDate: string, endDate: string): Promise<ApiEvent[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication token not found');
    const url = `${GLOBAL_URL}/events/all?start=${startDate}&end=${endDate}&limit=100&page=1`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
    const data = await response.json();
    return data;
  };

  // Convert API event to Calendar event format
  const convertApiEventToCalendarEvent = (apiEvent: ApiEvent): CalendarEvent => ({
    id: apiEvent.id,
    title: apiEvent.title,
    start: apiEvent.event_date.split('T')[0],
    allDay: true,
    extendedProps: {
      calendar: "Primary",
      description: apiEvent.description,
      imageUrl: apiEvent.imageUrl,
      status: apiEvent.status,
      created_at: apiEvent.created_at
    }
  });

  // Populate events
  const populateEvents = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Token is not available');
      return;
    }
    setIsLoadingEvents(true);
    setError(null);
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      const apiEvents = await fetchEventsFromAPI(startStr, endStr);
      const calendarEvents = apiEvents.map(convertApiEventToCalendarEvent);
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error instanceof Error ? error.message : 'Failed to load events');
      setEvents([
        {
          id: "1",
          title: "Event Conf.",
          start: new Date().toISOString().split("T")[0],
          extendedProps: { calendar: "Primary" },
        },
        {
          id: "2",
          title: "Meeting",
          start: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          extendedProps: { calendar: "Primary" },
        },
        {
          id: "3",
          title: "Workshop",
          start: new Date(Date.now() + 172800000).toISOString().split("T")[0],
          end: new Date(Date.now() + 259200000).toISOString().split("T")[0],
          extendedProps: { calendar: "Primary" },
        },
      ]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Refresh events when calendar view changes
  const handleDatesSet = async (dateInfo: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const startStr = dateInfo.start.toISOString().split('T')[0];
      const endStr = dateInfo.end.toISOString().split('T')[0];
      const apiEvents = await fetchEventsFromAPI(startStr, endStr);
      const calendarEvents = apiEvents.map(convertApiEventToCalendarEvent);
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error refreshing events:', error);
    }
  };

  useEffect(() => {
    populateEvents();
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventDate(selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventDate(event.start?.toISOString().split("T")[0] || "");
    setEventDescription(event.extendedProps?.description || "");
    openModal();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setEventImage(file);
  };

  const handleAddOrUpdateEvent = async () => {
    if (!eventTitle.trim()) {
      setError("Event title is required");
      return;
    }
    if (!eventDate) {
      setError("Event date is required");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (selectedEvent) {
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === selectedEvent.id
              ? {
                ...event,
                title: eventTitle,
                start: eventDate,
                extendedProps: {
                  ...event.extendedProps,
                  calendar: "Primary",
                  description: eventDescription
                },
              }
              : event
          )
        );
      } else {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('title', eventTitle);
        formData.append('event_date', eventDate);
        formData.append('description', eventDescription);
        formData.append('category', 'Primary');
        if (eventImage) formData.append('image', eventImage);
        createEvent(
          formData,
          token,
          (data) => {
            populateEvents();
            closeModal();
            resetModalFields();
            setIsLoading(false);
          },
          (errorData) => {
            setError(errorData.message || "Failed to create event");
            setIsLoading(false);
          }
        );
        return;
      }
      closeModal();
      resetModalFields();
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Delete event function
  const deleteEvent = async (eventId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${GLOBAL_URL}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to delete event: ${response.status} ${response.statusText}`);
      }
      populateEvents();
      closeModal();
      resetModalFields();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete event');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventDate("");
    setEventDescription("");
    setEventImage(null);
    setSelectedEvent(null);
    setError(null);
  };

  const renderEventContent = (eventInfo: any) => {
    const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
    return (
      <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}>
        <div className="fc-daygrid-event-dot"></div>
        <div className="fc-event-time">{eventInfo.timeText}</div>
        <div className="fc-event-title">{eventInfo.event.title}</div>
      </div>
    );
  };

  return (
    <>
      <PageMeta
        title="React.js Calendar Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Calendar Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Loading indicator for events */}
        {isLoadingEvents && (
          <div className="p-4 text-center">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading events...
            </div>
          </div>
        )}

        {/* Error display */}
        {error && !isLoading && !isLoadingEvents && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={populateEvents}
              className="mt-2 text-sm text-red-700 underline hover:text-red-900"
            >
              Try again
            </button>
          </div>
        )}

        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next addEventButton",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            datesSet={handleDatesSet}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            customButtons={{
              addEventButton: {
                text: "Add Event +",
                click: openModal,
              },
            }}
          />
        </div>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] p-6 lg:p-10 pt-12"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                {selectedEvent ? "Edit Event" : "Add Event"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Plan your next big moment: schedule or edit an event to stay on track
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mt-8">
              <div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Event Title *
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Description
                </label>
                <textarea
                  id="event-description"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  rows={3}
                  className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder="Enter event description..."
                />
              </div>

              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Image
                </label>
                <input
                  id="event-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Date *
                </label>
                <div className="relative">
                  <input
                    id="event-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={closeModal}
                type="button"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Close
              </button>
              <button
                onClick={handleAddOrUpdateEvent}
                type="button"
                disabled={isLoading}
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  selectedEvent ? "Update Changes" : "Add Event"
                )}
              </button>
              {/* NEW: Delete button, only shows when editing */}
              {selectedEvent && (
                <button
                  onClick={() => deleteEvent(selectedEvent.id as string)}
                  type="button"
                  disabled={isLoading}
                  className="btn btn-danger flex w-full justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                >
                  Delete Event
                </button>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Calendar;
