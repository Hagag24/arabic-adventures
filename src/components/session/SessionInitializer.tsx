"use client";

import { useEffect } from "react";

export default function SessionInitializer() {
  useEffect(() => {
    // Send a POST request to ensure the player session cookie is created/active
    fetch("/api/session/ensure", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          console.error("Failed to initialize session:", data.error);
        }
      })
      .catch((err) => {
        console.error("Error setting up player session:", err);
      });
  }, []);

  return null;
}
