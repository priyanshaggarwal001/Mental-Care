import React from "react";
import GAD7Module from "./GAD7Module";
import "./ScreeningModule.css";

export default function GAD7Page() {
  return (
    <div className="screening-bg">
      <div className="screening-card">
        <h1 className="screening-title">GAD-7 Screening (Anxiety)</h1>
        <GAD7Module />
      </div>
    </div>
  );
}
