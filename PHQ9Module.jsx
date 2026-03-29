import React, { useState, useMemo } from "react";
import "./ScreeningModule.css"; // Reuse same CSS

const CHOICES = [
  { value: 0, label: "0 – Not at all" },
  { value: 1, label: "1 – Several days" },
  { value: 2, label: "2 – More than half the days" },
  { value: 3, label: "3 – Nearly every day" },
];

const PHQ9_ITEMS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking so slowly that others notice, or the opposite",
  "Thoughts that you would be better off dead or hurting yourself",
];

function phq9Severity(score) {
  if (score <= 4) return { level: "Minimal depression", color: "green" };
  if (score <= 9) return { level: "Mild depression", color: "goldenrod" };
  if (score <= 14) return { level: "Moderate depression", color: "orange" };
  if (score <= 19) return { level: "Moderately severe depression", color: "orangered" };
  return { level: "Severe depression", color: "red" };
}

export default function PHQ9Module() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(null);

  const score = useMemo(
    () => Object.values(answers).reduce((s, v) => s + (Number(v) || 0), 0),
    [answers]
  );

  const severity = useMemo(() => phq9Severity(score), [score]);

  function handleSelect(qIdx, value) {
    setAnswers((prev) => ({ ...prev, [qIdx]: Number(value) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted({ score, severity });
  }

  const progress = (Object.keys(answers).length / PHQ9_ITEMS.length) * 100;

  return (
    <div className="screening-card">
      {/* <h1 className="screening-title">PHQ-9 Screening</h1> */}

      {/* Progress bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {PHQ9_ITEMS.map((q, idx) => (
          <div key={idx}>
            <p className="question">{idx + 1}. {q}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {CHOICES.map((c) => (
                <label
                  key={c.value}
                  className={`answer-option ${answers[idx] === c.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={`q${idx}`}
                    value={c.value}
                    checked={answers[idx] === c.value}
                    onChange={(e) => handleSelect(idx, e.target.value)}
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="btn-submit"
          disabled={Object.keys(answers).length < PHQ9_ITEMS.length}
        >
          Submit Screening
        </button>
      </form>

      {/* Result */}
      {submitted && (
        <div className="result-card">
          <h2 className="result-title">Your Result</h2>
          <p className="result-score">Score: <strong>{submitted.score}/27</strong></p>
          <p className="result-level" style={{ color: submitted.severity.color }}>
            {submitted.severity.level}
          </p>
        </div>
      )}
    </div>
  );
}
