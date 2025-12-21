"use client"
import React, { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Team1 } from "@/components/team1";
import { supabase } from "@/lib/supabaseClient";
import { useStudents, Student } from "@/providers/zustand";

const LeaderBoard = () => {
    const team1 = useStudents((s) => s.students);
    const setTeam1 = useStudents((s) => s.setStudents);
    const addStudent = useStudents((s) => s.addStudent);
    const updateStudent = useStudents((s) => s.updateStudent);
    const removeStudent = useStudents((s) => s.removeStudent);

    useEffect(() => {
        let mounted = true;

        const fetchStudents = async () => {
            const { data, error } = await supabase.from("students").select("id, name, marks");
            if (error) {
                console.error("Supabase error fetching students:", error);
                return;
            }

            const rows = (data || []).map((r: any) => ({ id: r.id, name: r.name, marks: r.marks || [] }));
            if (mounted) setTeam1(rows as Student[]);
        };

        fetchStudents();

        // Realtime subscription to keep UI in sync without manual refresh
        const channel = supabase
            .channel("public:students")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "students" },
                (payload) => {
                    if (!mounted) return;
                    const newRow = payload.new as any;
                    addStudent({ id: newRow.id, name: newRow.name, marks: newRow.marks || [] });
                }
            )
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "students" },
                (payload) => {
                    if (!mounted) return;
                    const updated = payload.new as any;
                    updateStudent({ id: updated.id, name: updated.name, marks: updated.marks || [] });
                }
            )
            .on(
                "postgres_changes",
                { event: "DELETE", schema: "public", table: "students" },
                (payload) => {
                    if (!mounted) return;
                    const oldRow = payload.old as any;
                    removeStudent(oldRow.id);
                }
            )
            .subscribe();

        return () => {
            mounted = false;
            try {
                channel.unsubscribe();
            } catch (e) {
                // ignore unsubscribe errors
            }
        };
    }, [addStudent, updateStudent, removeStudent, setTeam1]);

    return (
        <div className="flex flex-col h-full w-full">
            <div className="top-0">
                <Navbar />
            </div>
            <div className="w-full h-full">
                <div className="flex overflow-auto">
                    {team1?.map((student) => (
                        <Team1 key={student.id} id={student.id} name={student.name} marks={student.marks} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LeaderBoard;