'use client';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useCounterTeam1, useScoreTeam1, useStudents } from "@/providers/zustand";
import { useEffect } from "react";
import React from "react";

type Student = {
  id: string;
  name: string;
  marks: number[];
}

export const Team1 = ({ id, name, marks }: Student) => {
  const { counterTeam1, setCounterTeam1, increaseCounterTeam1 } = useCounterTeam1();
  const { scoreTeam1, setScoreTeam1, increaseScoreTeam1 } = useScoreTeam1();
  const totalNumberOfStudents = useStudents((s) => s.students.length);

  const arr = [...Array(totalNumberOfStudents)].map((_, i) => totalNumberOfStudents - i);

  useEffect(() => {
    if (counterTeam1 === totalNumberOfStudents) {
      setScoreTeam1(0);
    }
  }, [counterTeam1, totalNumberOfStudents, setScoreTeam1]);

  const increaseCounterByOne = () => {
    if (counterTeam1 == totalNumberOfStudents) {
      setCounterTeam1(1);
    } else {
      increaseCounterTeam1();
    }
  };

  const handleZero = async (id: string) => {
    const prev = marks;
    const newMarks = [...(prev || []), 0];

    // optimistic update
    useStudents.getState().updateStudent({ id, name, marks: newMarks });

    try {
      const { error } = await supabase.from("students").update({ marks: newMarks }).eq("id", id);
      if (error) throw error;
      increaseCounterByOne();
    } catch (error) {
      console.error("Error adding zero:", error);
      // rollback
      useStudents.getState().updateStudent({ id, name, marks: prev });
      alert("Failed to add zero. Please try again.");
    }
  };

  const handleMarks = async (id: string) => {
    const prev = marks;
    const newMarks = [...(prev || []), arr[scoreTeam1]];

    // optimistic update
    useStudents.getState().updateStudent({ id, name, marks: newMarks });

    try {
      const { error } = await supabase.from("students").update({ marks: newMarks }).eq("id", id);
      if (error) throw error;
      increaseScoreTeam1();
      increaseCounterByOne();
    } catch (error) {
      console.error("Error adding mark:", error);
      // rollback
      useStudents.getState().updateStudent({ id, name, marks: prev });
      alert("Failed to add mark. Please try again.");
    }
  };

  return (
    <div className="flex pt-2 p-2 h-full">
      <Card className="h-full bg-gray-300 w-[150px] shadow-md rounded-md p-0">
        <CardHeader className="border-b flex-col text-xl font-bold border-gray-800 flex items-center">
          {name}
          <div className="flex space-x-6 mt-2">
            <Button onClick={() => handleZero(id)} className="bg-red-500 rounded-lg">0</Button>
            <Button onClick={() => handleMarks(id)} className="bg-green-500 rounded-lg">
              <Plus className="h-1 w-1"/>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="bg-white h-full flex flex-col p-0 items-center justify-center">
          {marks.map((mark, i) => (
            <div className="flex h-8 w-full border-slate-300 border items-center justify-center" key={i}>{mark}</div>
          ))}
          <div className="h-11 font-bold bg-slate-200 w-full flex items-center justify-center border border-slate-600">
            Total: {marks.reduce((acc, curr) => acc + curr, 0)}
          </div>
        </CardContent>
      </Card>
    </div>

  );
};