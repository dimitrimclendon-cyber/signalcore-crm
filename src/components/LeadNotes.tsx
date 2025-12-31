import { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  User,
  Clock,
  Trash2,
  Edit2,
  MoreVertical,
  Check,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Note {
  id: string;
  lead_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

interface LeadNotesProps {
  leadId: string;
  currentUserId?: string;
  currentUserName?: string;
}

export default function LeadNotes({
  leadId,
  currentUserId = "anonymous",
  currentUserName = "You",
}: LeadNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetchNotes();
  }, [leadId]);

  async function fetchNotes() {
    setLoading(true);
    try {
      // For now, store notes in raw_data of the lead
      // In production, you'd have a separate notes table
      const { data, error } = await supabase
        .from("leads")
        .select("raw_data")
        .eq("id", leadId)
        .single();

      if (!error && data?.raw_data?.notes) {
        setNotes(data.raw_data.notes);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveNotes(updatedNotes: Note[]) {
    try {
      // Get current raw_data
      const { data: currentData } = await supabase
        .from("leads")
        .select("raw_data")
        .eq("id", leadId)
        .single();

      const rawData = currentData?.raw_data || {};
      rawData.notes = updatedNotes;

      await supabase
        .from("leads")
        .update({ raw_data: rawData })
        .eq("id", leadId);

      // Log activity
      await supabase.from("activities").insert([
        {
          lead_id: leadId,
          action: "note_added",
          details: "Note updated",
        },
      ]);
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);

    const note: Note = {
      id: Date.now().toString(),
      lead_id: leadId,
      user_id: currentUserId,
      user_name: currentUserName,
      content: newNote.trim(),
      created_at: new Date().toISOString(),
    };

    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    setNewNote("");

    await saveNotes(updatedNotes);
    setSubmitting(false);
  }

  async function handleUpdateNote(noteId: string) {
    if (!editContent.trim()) return;

    const updatedNotes = notes.map((n) =>
      n.id === noteId
        ? {
            ...n,
            content: editContent.trim(),
            updated_at: new Date().toISOString(),
          }
        : n
    );

    setNotes(updatedNotes);
    setEditingId(null);
    setEditContent("");

    await saveNotes(updatedNotes);
  }

  async function handleDeleteNote(noteId: string) {
    if (!confirm("Delete this note?")) return;

    const updatedNotes = notes.filter((n) => n.id !== noteId);
    setNotes(updatedNotes);

    await saveNotes(updatedNotes);
  }

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-pink-400" />
          Notes & Comments
          {notes.length > 0 && (
            <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">
              {notes.length}
            </span>
          )}
        </h3>
      </div>

      {/* Add Note Form */}
      <form
        onSubmit={handleAddNote}
        className="p-4 border-b border-slate-700/50"
      >
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {currentUserName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!newNote.trim() || submitting}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition text-sm"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Posting..." : "Post Note"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Notes List */}
      <div className="divide-y divide-slate-700/30 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notes yet. Add the first one!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-4 hover:bg-slate-700/20 transition group"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {note.user_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">
                        {note.user_name}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(note.created_at)}
                      </span>
                      {note.updated_at && (
                        <span className="text-xs text-slate-500">(edited)</span>
                      )}
                    </div>

                    {note.user_id === currentUserId && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => {
                            setEditingId(note.id);
                            setEditContent(note.content);
                          }}
                          className="p-1 text-slate-400 hover:text-white transition"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-slate-400 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId === note.id ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-pink-500 focus:outline-none resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleUpdateNote(note.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded text-xs"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditContent("");
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">
                      {note.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
