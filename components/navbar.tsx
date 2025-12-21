"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { useStudents } from "@/providers/zustand";

export const Navbar = () => {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const handleClear = async () => {
    try {
      // Fetch all student ids first
      const { data: students, error: fetchError } = await supabase.from("students").select("id");
      if (fetchError) throw fetchError;

      const ids = (students || []).map((s: any) => s.id).filter(Boolean);
      if (ids.length === 0) {
        alert("No students to clear.");
        return;
      }

      const { data, error } = await supabase.from("students").delete().in("id", ids);
      if (error) throw error;

      // Clear local store so UI updates immediately
      useStudents.getState().setStudents([]);

      alert("All students cleared successfully!");
    } catch (error: any) {
      console.error("Error clearing students:", error);
      alert(error?.message || "Failed to clear students. See console for details.");
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Please enter a student name");
      return;
    }

    try {
      // Insert and get the created row back so UI can be updated immediately
      const { data, error } = await supabase
        .from("students")
        .insert([{ name: name.trim(), marks: [] }])
        .select("id, name, marks")
        .single();
      if (error) throw error;

      // Optimistically update client-side store so UI reflects addition immediately
      useStudents.getState().addStudent({ id: data.id, name: data.name, marks: data.marks || [] });

      setName("");
      setOpen(false);
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student. Please try again.");
    }
  };

  return (
    <div className="h-20 w-full shadow-md">
      <div className="h-full flex items-center justify-center gap-x-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-[300px] bg-gradient-to-r from-blue-400 via-pink-400 to-purple-400 font-bold text-black">
              <Plus className="h-5 w-5 mr-2" />
              <h1>Add Student</h1>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Student</DialogTitle>
              <DialogDescription>Fill in the student details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
              />
              <Button
                className="bg-blue-500 text-white w-full"
                onClick={handleSubmit}
                disabled={!name.trim()}
              >
                Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button className="bg-red-500 flex items-center justify-center" onClick={handleClear}>
          <Trash2 className="h-5 w-5 mr-2" />
        </Button>
      </div>
    </div>
  );
};