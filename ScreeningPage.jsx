// import React, { useState } from "react";
// import PHQ9Module from "./PHQ9Module";
// import GAD7Module from "./GAD7Module";
// import "./ScreeningModule.css";

// export default function ScreeningPage() {
//   const [selectedTool, setSelectedTool] = useState("PHQ9");

//   return (
//     <div className="screening-bg">
//       <div className="screening-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
//         <h1 className="screening-title">Mental Health Screening</h1>

//         {/* Segmented Tabs */}
//         <div className="switch-group">
//           <button
//             className={`switch-btn ${selectedTool === "PHQ9" ? "active" : ""}`}
//             onClick={() => setSelectedTool("PHQ9")}
//           >
//             PHQ-9 (Depression)
//           </button>
//           <button
//             className={`switch-btn ${selectedTool === "GAD7" ? "active" : ""}`}
//             onClick={() => setSelectedTool("GAD7")}
//           >
//             GAD-7 (Anxiety)
//           </button>
//         </div>

//         <div style={{ marginTop: "1.5rem" }}>
//           {selectedTool === "PHQ9" ? <PHQ9Module /> : <GAD7Module />}
//         </div>
//       </div>
//     </div>
//   );
// }
