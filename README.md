🚀 PrepForge — Interview Preparation Platform
Crack Your Dream Job with PrepForge
An end-to-end, AI-powered interview preparation platform optimized for Indian placement tracks — consolidating study notes, coding practice, aptitude quizzes, technical MCQs, and mock interviews in a single unified workspace.
📂 Backend  |  💻 Frontend

📸 Screenshots

Landing Page — Hero Section

<img width="1895" height="871" alt="image" src="https://github.com/user-attachments/assets/c42109bb-0eb2-4560-ac6c-4f4d965d740e" />


Feature Modules — End-to-End Preparation Engine

<img width="1901" height="863" alt="image" src="https://github.com/user-attachments/assets/2efe3ea7-688d-4bb3-80d4-2f80b1bfaca0" />

🧩 What is PrepForge?
PrepForge is a full-stack interview preparation platform built for final-year students and freshers targeting companies like TCS, Infosys, Wipro, Accenture, and high-growth startups.
Rather than juggling multiple resources, PrepForge consolidates six integrated functional tracks into a single workspace:
#ModuleDescription1📚 Study NotesCurated reference notes for Java frameworks, React architectures, Python, and core CS fundamentals2🎯 Interview QuestionsHR vetting roadmaps and technical question banks with deep verification guidelines3💻 Coding PracticeDSA challenges mapped from fundamental to hard, grouped by company tags4🧠 Aptitude QuizQuant, logical reasoning, and verbal diagnostics with built-in timer sequences5📝 Technical MCQTopic-wise MCQs covering Java, DBMS, OS, threading models, and more6🎥 Mock InterviewAI-driven real-time simulation loops tuned for Indian tier-1 placement parameters

✨ Key Features

🔐 JWT Authentication — Secure signup/login with Spring Security and token-based auth
🤖 AI Mock Interviews — Gemini API integration for automated, real-time mock interview simulations
🏷️ Company Tag Filtering — 50+ company tags to filter problems and questions by target employer
⏱️ Timed Aptitude Quizzes — Diagnostic quiz engine with configurable timer sequences
📊 Personalized Dashboard — Track progress, manage notes, and navigate modules from a central hub
🔒 RBAC — Role-based access control to separate user and admin flows
📱 Responsive UI — Clean, dark-themed interface optimized for desktop and mobile


🛠️ Tech Stack
Frontend

React.js
Axios
React Router
Tailwind CSS / CSS

Backend

Spring Boot
Spring Security
JWT Authentication
Spring Data JPA
MySQL

Tools & APIs

Gemini AI API
Git & GitHub
Maven

📂 Project Structure
PrepForge-Interview-Prep-Platform/
│
├── frontend/                   # React.js Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level page components
│   │   ├── services/           # Axios API service layer
│   │   └── App.js
│   └── package.json
│
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/
│   │   ├── controller/         # REST API controllers
│   │   ├── service/            # Business logic layer
│   │   ├── repository/         # JPA repositories
│   │   ├── model/              # Entity classes
│   │   ├── security/           # JWT & Spring Security config
│   │   └── config/             # Application configuration
│   └── pom.xml
│
└── README.md


✨ Features
🔐 JWT Authentication & Authorization
🤖 AI-Powered Mock Interview System
💻 Coding Practice & DSA Preparation
📊 Progress Tracking Dashboard
🧠 Gemini AI API Integration
📚 Structured Interview Learning Modules
🎯 Company-Based Interview Preparation
📱 Fully Responsive UI

🚀 Getting Started
📋 Prerequisites

Make sure you have the following installed:

Java 17+
Node.js 18+
MySQL 8+
Maven 3.8+
⚙️ Backend Setup
# Clone the repository
git clone https://github.com/Sakshi3456/PrepForge-Interview-Prep-Platform.git

# Navigate to backend
cd PrepForge-Interview-Prep-Platform/backend

# Run the Spring Boot application
mvn spring-boot:run
Configure application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/prepforge
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD

jwt.secret=YOUR_JWT_SECRET

gemini.api.key=YOUR_GEMINI_API_KEY

💻 Frontend Setup
# Navigate to frontend
cd PrepForge-Interview-Prep-Platform/frontend

# Install dependencies
npm install

# Start development server
npm start
Create .env file
REACT_APP_API_URL=http://localhost:8080
📊 Platform Stats
Metric	Value
Architectural Modules	6+
Verified Core Tasks	500+
Target Company Tags	50+
Access License	100% Open
📸 Screenshots


👩‍💻 Author
Sakshi Nagre

Java Full Stack Developer

🎓 B.E. Computer Engineering
Sandip Institute of Technology, Nashik (2025)

📜 Certified in Java Full Stack Development — The Kiran Academy

🤝 Contributing

Contributions, issues, and feature requests are welcome!

Feel free to fork this repository and submit a pull request.

📄 License

This project is 100% open access — free to use for learning and reference purposes.
