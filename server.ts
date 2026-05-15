import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON parsing
  app.use(express.json());

  // API Routes
  app.get("/api/rpsc", (req, res) => {
    // Simulating dynamic data with timestamps in the last few days
    const now = new Date();
    
    // Randomize some fields to simulate "real-time" changes for the user's demo
    const statuses = ["Exam Date", "Admit Card", "Result", "New Notification", "Answer Key"];
    const departments = ["Education", "Medical & Health", "Revenue", "Home Department", "Ayurved"];
    
    const notifications = [
      {
        id: "1",
        title: "Press Note regarding Exam Date for RAS/RTS Comb. Comp. Exam 2026",
        date: new Date(now.getTime() - 1000 * 60 * 45).toISOString(), // 45 mins ago
        category: "Exams",
        isNew: true,
        department: "General Administration",
        status: "Exam Date"
      },
      {
        id: "2",
        title: "Extended Date for Online Application for Lecturer (Sanskrit Edu.) - 2026",
        date: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        category: "Recruitment",
        isNew: true,
        department: "Sanskrit Education",
        status: "New Notification"
      },
      {
        id: "3",
        title: "Question Paper for Statistical Officer Exam 2025 (Economics & Statistics)",
        date: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        category: "Question Papers",
        isNew: false,
        department: "Economics & Statistics",
        status: "Answer Key"
      },
      {
        id: "4",
        title: "Final Answer Key for Assistant Professor (College Edu.) - 2024",
        date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        category: "Results",
        isNew: false,
        department: "College Education",
        status: "Result"
      },
      {
        id: "5",
        title: "Admit Card Download for Junior Legal Officer (JLO) 2025",
        date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        category: "Admit Cards",
        isNew: false,
        department: "Law Department",
        status: "Admit Card"
      }
    ];

    // Add some random noise to simulate 'live' data changing
    if (Math.random() > 0.7) {
        notifications.unshift({
            id: `temp-${Date.now()}`,
            title: `URGENT: Press note regarding ${departments[Math.floor(Math.random() * departments.length)]} Interview Schedule`,
            date: new Date().toISOString(),
            category: "Interview",
            isNew: true,
            department: departments[Math.floor(Math.random() * departments.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)]
        });
    }

    res.json({
        success: true,
        lastUpdated: now.toISOString(),
        data: notifications
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
