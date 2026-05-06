import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { apiFetch } from "../lib/api";

type Notification = {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export const NotificationsPopover = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await apiFetch<Notification[]>("/notifications");
        setNotifications(data);
      } catch (e) {
        // ignore
      }
    };
    if (localStorage.getItem("accessToken")) {
      fetchNotifs();
      const intId = setInterval(fetchNotifs, 2000);
      return () => clearInterval(intId);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch(e) { }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-slate-600 hover:text-brand-600 transition-colors rounded-full hover:bg-slate-100"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full font-bold">{unreadCount} New</span>}
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => markAsRead(n.id, n.isRead)}
                  className={`p-3 rounded-xl mb-1 cursor-pointer transition-colors ${n.isRead ? "opacity-60 hover:bg-slate-50" : "bg-brand-50/50 hover:bg-brand-50 border border-brand-100/50"}`}
                >
                  <p className="text-sm font-medium text-slate-800">{n.message}</p>
                  <span className="text-xs text-slate-400 mt-1 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
