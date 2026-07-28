import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { TracksPage } from "./pages/TracksPage.js";
import { TrackDetailPage } from "./pages/TrackDetailPage.js";
import { LabPage } from "./pages/LabPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { AuthPage } from "./pages/AuthPage.js";
import { Layout } from "./Layout.js";
import { RequireAuth } from "./RequireAuth.js";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/" element={<TracksPage />} />
            <Route path="/tracks/:slug" element={<TrackDetailPage />} />
            <Route path="/labs/:slug" element={<LabPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
