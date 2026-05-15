from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    create_access_token
)

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import PyPDF2

app = Flask(__name__)

CORS(app)

# Database Config
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///nexivio.db"

# JWT Secret Key
app.config["JWT_SECRET_KEY"] = "super-secret-key"

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# =========================
# DATABASE MODEL
# =========================

class User(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(255),
        nullable=False
    )

# Create Database
with app.app_context():
    db.create_all()

# =========================
# HOME ROUTE
# =========================

@app.route("/")
def home():

    return {
        "message": "Nexivio Backend Running Successfully"
    }

# =========================
# REGISTER ROUTE
# =========================

@app.route("/register", methods=["POST"])
def register():

    data = request.json

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "message": "User already exists"
        }), 400

    hashed_password = bcrypt.generate_password_hash(
        password
    ).decode("utf-8")

    new_user = User(
        username=username,
        email=email,
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully"
    })

# =========================
# LOGIN ROUTE
# =========================

@app.route("/login", methods=["POST"])
def login():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({
            "message": "Invalid credentials"
        }), 401

    valid_password = bcrypt.check_password_hash(
        user.password,
        password
    )

    if not valid_password:
        return jsonify({
            "message": "Invalid credentials"
        }), 401

    access_token = create_access_token(
        identity=user.id
    )

    return jsonify({
        "token": access_token,
        "username": user.username
    })

# =========================
# ATS ANALYZER
# =========================

@app.route("/analyze", methods=["POST"])
def analyze_resume():

    data = request.json

    resume_text = data.get("resumeText", "")
    job_description = data.get("jobDescription", "")

    documents = [resume_text, job_description]

    cv = CountVectorizer()
    matrix = cv.fit_transform(documents)

    similarity = cosine_similarity(matrix)[0][1]

    ats_score = round(similarity * 100, 2)

    resume_words = set(resume_text.lower().split())
    job_words = set(job_description.lower().split())

    missing_keywords = list(job_words - resume_words)

    important_missing = missing_keywords[:10]

    suggestions = []

    if important_missing:
        suggestions.append(
            f"Missing Keywords: {', '.join(important_missing)}"
        )

    if ats_score < 40:
        suggestions.append("Resume has low ATS match")
        suggestions.append("Add more technical skills")

    elif ats_score < 70:
        suggestions.append("Good resume but can improve")

    else:
        suggestions.append("Excellent ATS compatibility")

    return jsonify({
        "ats_score": ats_score,
        "suggestions": suggestions
    })

# =========================
# PDF UPLOAD
# =========================

@app.route("/upload-resume", methods=["POST"])
def upload_resume():

    file = request.files["resume"]

    pdf_reader = PyPDF2.PdfReader(file)

    text = ""

    for page in pdf_reader.pages:

        extracted = page.extract_text()

        if extracted:
            text += extracted

    return jsonify({
        "resume_text": text
    })

# =========================
# INTERVIEW GENERATOR
# =========================

@app.route("/generate-questions", methods=["POST"])
def generate_questions():

    data = request.json

    role = data.get("role", "")
    skills = data.get("skills", "")

    skill_list = skills.split(",")

    questions = []

    questions.append(
        f"Tell me about yourself as a {role}."
    )

    questions.append(
        f"Why do you want to become a {role}?"
    )

    for skill in skill_list:

        skill = skill.strip()

        questions.append(
            f"Explain your experience with {skill}."
        )

        questions.append(
            f"What are important concepts in {skill}?"
        )

    return jsonify({
        "questions": questions
    })

# =========================
# TIMESHEET GENERATOR
# =========================

@app.route("/generate-timesheet", methods=["POST"])
def generate_timesheet():

    data = request.json

    work = data.get("work", "")

    formatted = f'''
Completed assigned development tasks.

Worked on:
{work}

Collaborated with team members
and ensured timely updates.
'''

    return jsonify({
        "timesheet": formatted
    })

if __name__ == "__main__":
    app.run(debug=True)