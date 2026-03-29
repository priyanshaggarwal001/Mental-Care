import React, { useState, useMemo } from "react";
import "./ScreeningModule.css"; // reuse the same CSS

const CHOICES = [
  { value: 0, label: "0 – Not at all" },
  { value: 1, label: "1 – Several days" },
  { value: 2, label: "2 – More than half the days" },
  { value: 3, label: "3 – Nearly every day" },
];

const GAD7_ITEMS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

function gad7Severity(score) {
  if (score <= 4) return { level: "Normal", color: "green" };
  if (score <= 9) return { level: "Mild anxiety", color: "goldenrod" };
  if (score <= 14) return { level: "Moderate anxiety", color: "orange" };
  return { level: "Severe anxiety", color: "red" };
}

export default function GAD7Module() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(null);

  const score = useMemo(
    () => Object.values(answers).reduce((s, v) => s + (Number(v) || 0), 0),
    [answers]
  );

  const severity = useMemo(() => gad7Severity(score), [score]);

  function handleSelect(qIdx, value) {
    setAnswers((prev) => ({ ...prev, [qIdx]: Number(value) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted({ score, severity });
  }

  const progress = (Object.keys(answers).length / GAD7_ITEMS.length) * 100;

  return (
    <div className="tool-container">
      {/* <h2 className="screening-title">GAD-7 Screening</h2> */}

      {/* Progress bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <form onSubmit={handleSubmit}>
        {GAD7_ITEMS.map((q, idx) => (
          <div key={idx}>
            <p className="question">{idx + 1}. {q}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {CHOICES.map((c) => (
                <label
                  key={c.value}
                  className={`answer-option ${
                    answers[idx] === c.value ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`gad7_q${idx}`}
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
          disabled={Object.keys(answers).length < GAD7_ITEMS.length}
        >
          Submit Screening
        </button>
      </form>

      {submitted && (
        <div className="result-card">
          <h3 className="result-title">Your Result</h3>
          <p className="result-score">
            Score: <strong>{submitted.score}/21</strong>
          </p>
          <p
            className="result-level"
            style={{ color: submitted.severity.color }}
          >
            {submitted.severity.level}
          </p>
        </div>
      )}
    </div>
  );
}