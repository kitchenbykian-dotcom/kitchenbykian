/* =====================================================================
   KITCHEN BY KIAN: ALL YOUR BUSINESS DETAILS LIVE IN THIS ONE FILE
   Change anything here and every page of the website updates.
   ===================================================================== */
window.CONFIG = {
  whatsapp: "923304067230",      // Your WhatsApp number: country code 92, no + or 0 (e.g. 923001234567)
  email: "",                     // optional, e.g. "hello@kitchenbykian.com"

  // "prelaunch" = Launching Soon mode (orders become launch-day reservations)
  // "live"      = normal ordering
  launchMode: "prelaunch",
  launchOffer: "Join the launch list and get an exclusive opening-day discount",

  // Hero picture until you add a real video/photo: "roll", "emblem", "cloche" or "orbit"
  heroStyle: "roll",
  // Website look: "3d" (animations, 3D tilt and motion) or "simple" (clean and still)
  style: "3d",
  // Colour theme: "noir" (black & gold), "maroon", "emerald" or "cream"
  theme: "noir",
  // Real hero media (put the file next to index.html): video shown first, then photo
  heroVideo: "",
  heroImage: "",

  /* ---------------- PRODUCTS ----------------
     status: "available" or "soon"
     price: number in Rs (0 = "Price at launch"), or a price per type like { "Frozen (Fry at Home)": 1080, "Fresh (Ready to Eat)": 1200 }
     image: photo file next to index.html (e.g. "rolls.jpg"), or "" for the gold icon
  */
  products: [
    {
      id: "chicken-cheese-roll",
      name: "Cheese Chaska Roll",
      subtitle: "Chicken & Cheese",
      desc: "Our signature: tender spiced chicken and a generous melted-cheese centre, hand-wrapped and fried golden-crisp. One bite and you're hooked.",
      status: "available",
      badge: "Signature",
      art: "roll", image: "",
      // Different price for each type (Fresh costs more: fried at home with oil and gas)
      packs: [
        { name: "Pack of 6",  price: { "Frozen (Fry at Home)": 1080, "Fresh (Ready to Eat)": 1200 } },
        { name: "Pack of 12", price: { "Frozen (Fry at Home)": 2100, "Fresh (Ready to Eat)": 2350 } }
      ],
      types: [ "Frozen (Fry at Home)", "Fresh (Ready to Eat)" ]
    },
    { id: "shami-kabab", name: "Shami Kababs", desc: "Soft, spiced homemade kababs, ready to fry.", status: "soon", art: "kabab", image: "",
      packs: [ { name: "Pack of 6", price: 0 }, { name: "Pack of 12", price: 0 } ], types: [ "Frozen (Fry at Home)" ] },
    { id: "chicken-samosa", name: "Chicken Samosas", desc: "Crispy, hand-folded samosas with a spiced chicken filling.", status: "soon", art: "samosa", image: "",
      packs: [ { name: "Pack of 12", price: 0 }, { name: "Pack of 24", price: 0 } ], types: [ "Frozen (Fry at Home)" ] },
    { id: "halwa", name: "Homemade Halwa", desc: "Rich, slow-cooked halwa made the traditional way.", status: "soon", art: "dessert", image: "",
      packs: [ { name: "Half kg", price: 0 }, { name: "1 kg", price: 0 } ], types: [ "Fresh" ] },
    { id: "desserts", name: "Homemade Desserts", desc: "Traditional sweet treats, made the homemade way.", status: "soon", art: "dessert", image: "",
      packs: [ { name: "Half kg", price: 0 }, { name: "1 kg", price: 0 } ], types: [ "Fresh" ] }
  ],

  delivery: {
    areas:   "All over Lahore",
    fee:     0,                  // delivery charge in Rs (0 = confirmed on WhatsApp)
    freeAbove: 0,                // free delivery above this order total (0 = off)
    timing:  "Order 1 day in advance",
    payment: [ "Cash on Delivery", "JazzCash", "Easypaisa", "Bank Transfer" ]
  },

  social: {
    instagram: "https://www.instagram.com/kitchenbykian/",
    facebook:  "https://www.facebook.com/profile.php?id=61595196895998",
    tiktok:    "https://www.tiktok.com/@kitchenbykian"
  }
};
