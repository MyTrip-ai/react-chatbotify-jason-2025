const flow = {
  start: {
    message: "¡Hola! I'm your MyTrip.AI curator. Ready to craft a dreamy Aguas Claras escape?",
    transition: { duration: 800 },
    path: "trip_styles",
  },
  trip_styles: {
    message: "Tell me the vibe you're craving. I’ll tailor inspiration instantly.",
    options: [
      "Tropical indulgence",
      "Adventure + wellness",
      "Family memory maker",
    ],
    chatDisabled: true,
    path: "celebrate_choice",
  },
  celebrate_choice: {
    message: (params) => `Gorgeous choice — ${params.userInput} sounds perfect for Cahuita!`,
    transition: { duration: 600 },
    path: "ask_dates",
  },
  ask_dates: {
    message: "When would you love to arrive? (Share a month or exact dates)",
    path: "ask_guests",
  },
  ask_guests: {
    message: "How many guests should we plan for?",
    path: "ask_priorities",
  },
  ask_priorities: {
    message: "Name one must-have detail — e.g. private plunge pool, spa rituals, reef snorkeling, etc.",
    path: "collect_email",
  },
  collect_email: {
    message: "Drop your best email so our concierge can send hand-picked stays within a few hours",
    path: async (params) => {
      const email = (params.userInput || "").trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        await params.injectMessage("Mind popping in a valid email so we can follow up?");
        return "collect_email";
      }
      params.metadata = {
        ...(params.metadata || {}),
        email,
      };
      return "summary";
    },
  },
  summary: {
    message: (params) => {
      const email = params.metadata?.email || "your inbox";
      return `Amazing! I’ll send a curated Aguas Claras itinerary straight to ${email}. Would you like another recommendation?`;
    },
    options: ["Yes, keep going", "No, I’m all set"],
    chatDisabled: true,
    path: (params) => (params.userInput === "Yes, keep going" ? "trip_styles" : "goodbye"),
  },
  goodbye: {
    message: "Pura vida! Your MyTrip curator will be in touch shortly ✨",
    path: "goodbye",
    chatDisabled: true,
  },
};

export default flow;
