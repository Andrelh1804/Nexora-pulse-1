import React from "react";
import NexoraLandingPage from "../components/NexoraLandingPage";
import { useNavigate } from "react-router-dom";

export default function LandingShell() {
  const navigate = useNavigate();

  return (
    <NexoraLandingPage
      onAccessApp={() => navigate("/login")}
      addXP={() => {}}
    />
  );
}
