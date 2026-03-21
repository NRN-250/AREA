import React from "react";
import TimerActionForm from "../components/area/TimerActionForm";

export default function TimerActionsPage() {
  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-sky-50 via-white to-purple-50 dark:from-[#111111] dark:to-[#111111] transition-colors duration-200">
      <TimerActionForm />
    </div>
  );
}
