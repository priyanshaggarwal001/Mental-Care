import React from "react";
import PHQ9Module from "./PHQ9Module";
import "./ScreeningModule.css";

export default function PHQ9Page() {
  return (
    <div className="screening-bg">
      <div className="screening-card">
        <h1 className="screening-title">PHQ-9 Screening (Depression)</h1>
        <PHQ9Module />
      </div>
    </div>
  );
}
