import { useState } from "react";

function App() {

  // =========================
  // AUTH STATES
  // =========================

  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loggedInUser, setLoggedInUser] = useState("");

  // =========================
  // ATS STATES
  // =========================

  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const [jobDescription, setJobDescription] = useState("");

  const [atsScore, setAtsScore] = useState(null);

  const [suggestions, setSuggestions] = useState([]);

  // =========================
  // INTERVIEW STATES
  // =========================

  const [role, setRole] = useState("");

  const [skills, setSkills] = useState("");

  const [questions, setQuestions] = useState([]);

  // =========================
  // TIMESHEET STATES
  // =========================

  const [work, setWork] = useState("");

  const [timesheet, setTimesheet] = useState("");

  // =========================
  // REGISTER
  // =========================

  const registerUser = async () => {

    const response = await fetch(
      "http://127.0.0.1:5000/register",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username,
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    alert(data.message);
  };

  // =========================
  // LOGIN
  // =========================

  const loginUser = async () => {

    const response = await fetch(
      "http://127.0.0.1:5000/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (data.token) {

      localStorage.setItem(
        "token",
        data.token
      );

      setLoggedInUser(data.username);

      alert("Login Successful");

    } else {

      alert(data.message);
    }
  };

  // =========================
  // PDF RESUME UPLOAD
  // =========================

  const uploadResume = async (file) => {

    const formData = new FormData();

    formData.append("resume", file);

    const response = await fetch(
      "http://127.0.0.1:5000/upload-resume",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    setResumeText(data.resume_text);
  };

  // =========================
  // ANALYZE RESUME
  // =========================

  const analyzeResume = async () => {

    const response = await fetch(
      "http://127.0.0.1:5000/analyze",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      }
    );

    const data = await response.json();

    setAtsScore(data.ats_score);

    setSuggestions(data.suggestions);
  };

  // =========================
  // GENERATE QUESTIONS
  // =========================

  const generateQuestions = async () => {

    const response = await fetch(
      "http://127.0.0.1:5000/generate-questions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          role,
          skills,
        }),
      }
    );

    const data = await response.json();

    setQuestions(data.questions);
  };

  // =========================
  // GENERATE TIMESHEET
  // =========================

  const generateTimesheet = async () => {

    const response = await fetch(
      "http://127.0.0.1:5000/generate-timesheet",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          work,
        }),
      }
    );

    const data = await response.json();

    setTimesheet(data.timesheet);
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navbar */}

      <nav className="flex items-center justify-between px-10 py-6 border-b border-gray-800">

        <h1 className="text-3xl font-bold text-blue-500">
          Nexivio AI 🚀
        </h1>

        {loggedInUser ? (

          <div className="bg-green-600 px-5 py-2 rounded-lg">
            {loggedInUser}
          </div>

        ) : (

          <button className="bg-blue-600 px-5 py-2 rounded-lg">
            Login
          </button>

        )}

      </nav>

      {/* AUTH SECTION */}

      {!loggedInUser && (

        <section className="max-w-md mx-auto mt-16 bg-gray-900 border border-gray-800 rounded-2xl p-8">

          <h2 className="text-3xl font-bold text-center mb-8">

            {isLogin ? "Login" : "Register"}

          </h2>

          {!isLogin && (

            <input
              type="text"
              placeholder="Username"
              className="w-full bg-gray-800 p-4 rounded-lg mb-4"

              value={username}

              onChange={(e) =>
                setUsername(e.target.value)
              }
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full bg-gray-800 p-4 rounded-lg mb-4"

            value={email}

            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full bg-gray-800 p-4 rounded-lg mb-6"

            value={password}

            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            onClick={
              isLogin
                ? loginUser
                : registerUser
            }

            className="w-full bg-blue-600 py-4 rounded-xl hover:bg-blue-700 text-lg font-semibold"
          >

            {isLogin ? "Login" : "Register"}

          </button>

          <p className="text-center text-gray-400 mt-6">

            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              className="text-blue-400 ml-2"

              onClick={() =>
                setIsLogin(!isLogin)
              }
            >

              {isLogin
                ? "Register"
                : "Login"}

            </button>

          </p>

        </section>
      )}

      {/* MAIN DASHBOARD */}

      {loggedInUser && (

        <>
          {/* Hero */}

          <section className="text-center py-16 px-6">

            <h1 className="text-5xl font-bold">
              AI Career Assistant
            </h1>

            <p className="text-gray-400 mt-4 text-lg">
              ATS Resume Analysis + AI Interview Prep + AI Timesheets
            </p>

          </section>

          {/* ATS Analyzer */}

          <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 px-6 pb-20">

            {/* ATS Input */}

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

              <h2 className="text-2xl font-bold text-blue-400 mb-6">
                Resume ATS Analyzer
              </h2>

              <input
                type="file"
                accept=".pdf"
                className="w-full bg-gray-800 p-4 rounded-lg"

                onChange={(e) => {

                  const file = e.target.files[0];

                  setResumeFile(file);

                  uploadResume(file);
                }}
              />

              <textarea
                placeholder="Extracted Resume Text..."
                className="w-full mt-6 bg-gray-800 p-4 rounded-lg h-40 text-white"

                value={resumeText}

                onChange={(e) =>
                  setResumeText(e.target.value)
                }
              />

              <textarea
                placeholder="Paste Job Description Here..."
                className="w-full mt-6 bg-gray-800 p-4 rounded-lg h-40 text-white"

                value={jobDescription}

                onChange={(e) =>
                  setJobDescription(e.target.value)
                }
              />

              <button
                onClick={analyzeResume}

                className="w-full mt-6 bg-blue-600 py-4 rounded-xl hover:bg-blue-700 text-lg font-semibold"
              >
                Analyze Resume
              </button>

            </div>

            {/* ATS Result */}

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

              <h2 className="text-2xl font-bold text-blue-400 mb-6">
                ATS Analysis Result
              </h2>

              <div className="bg-black rounded-xl p-6 border border-gray-700">

                <h3 className="text-5xl font-bold text-green-400">

                  {atsScore !== null
                    ? `${atsScore}%`
                    : "--"}

                </h3>

                <p className="text-gray-400 mt-2">
                  ATS Match Score
                </p>

              </div>

              <div className="mt-8">

                <h3 className="text-xl font-semibold mb-4">
                  AI Suggestions
                </h3>

                <ul className="space-y-3 text-gray-300">

                  {suggestions.length > 0 ? (

                    suggestions.map(
                      (suggestion, index) => (
                        <li key={index}>
                          ✔ {suggestion}
                        </li>
                      )
                    )

                  ) : (

                    <li>No suggestions yet</li>
                  )}

                </ul>

              </div>

            </div>

          </section>

          {/* INTERVIEW GENERATOR */}

          <section className="max-w-6xl mx-auto px-6 pb-20">

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

              <h2 className="text-3xl font-bold text-blue-400 mb-6">
                AI Interview Question Generator
              </h2>

              <input
                type="text"
                placeholder="Enter Role (e.g. Python Developer)"
                className="w-full bg-gray-800 p-4 rounded-lg text-white"

                value={role}

                onChange={(e) => setRole(e.target.value)}
              />

              <textarea
                placeholder="Enter Skills (comma separated)"
                className="w-full mt-6 bg-gray-800 p-4 rounded-lg h-32 text-white"

                value={skills}

                onChange={(e) => setSkills(e.target.value)}
              />

              <button
                onClick={generateQuestions}

                className="w-full mt-6 bg-blue-600 py-4 rounded-xl hover:bg-blue-700 text-lg font-semibold"
              >
                Generate Questions
              </button>

              <div className="mt-10">

                <h3 className="text-2xl font-semibold mb-6">
                  Generated Questions
                </h3>

                <ul className="space-y-4 text-gray-300">

                  {questions.length > 0 ? (

                    questions.map((question, index) => (

                      <li
                        key={index}

                        className="bg-black border border-gray-700 p-4 rounded-xl"
                      >
                        {question}
                      </li>
                    ))

                  ) : (

                    <li>No questions generated yet</li>
                  )}

                </ul>

              </div>

            </div>

          </section>

          {/* TIMESHEET GENERATOR */}

          <section className="max-w-6xl mx-auto px-6 pb-20">

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

              <h2 className="text-3xl font-bold text-blue-400 mb-6">
                AI Timesheet Generator
              </h2>

              <textarea
                placeholder="Describe your work..."
                className="w-full bg-gray-800 p-4 rounded-lg h-40 text-white"

                value={work}

                onChange={(e) => setWork(e.target.value)}
              />

              <button
                onClick={generateTimesheet}

                className="w-full mt-6 bg-blue-600 py-4 rounded-xl hover:bg-blue-700 text-lg font-semibold"
              >
                Generate Timesheet
              </button>

              <div className="mt-10">

                <h3 className="text-2xl font-semibold mb-6">
                  Professional Timesheet
                </h3>

                <div className="bg-black border border-gray-700 p-6 rounded-xl text-gray-300 whitespace-pre-line">

                  {timesheet || "No timesheet generated yet"}

                </div>

              </div>

            </div>

          </section>
        </>
      )}

    </div>
  );
}

export default App;