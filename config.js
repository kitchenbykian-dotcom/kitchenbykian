/* =====================================================================
   KITCHEN BY KIAN: ALL YOUR BUSINESS DETAILS LIVE IN THIS ONE FILE
   Change anything here and every page of the website updates.
   Last update: 7 Oct 2026 (frozen-only, final prices, live ordering)
   ===================================================================== */
window.CONFIG = {
  whatsapp: "923304067230",      // Your WhatsApp number: country code 92, no + or 0 (e.g. 923001234567)
  email: "",                     // optional, e.g. "hello@kitchenbykian.com"

  // "prelaunch" = Launching Soon mode (orders become launch-day reservations)
  // "live"      = normal ordering (no launch banner, no launch date)
  launchMode: "live",
  launchOffer: "",

  // Hero picture until you add a real video/photo: "roll", "emblem", "cloche" or "orbit"
  heroStyle: "roll",
  // Website look: "3d" (animations, 3D tilt and motion) or "simple" (clean and still)
  style: "3d",
  // Colour theme: "noir" (black & gold), "maroon", "emerald" or "cream"
  theme: "noir",
  // Real hero media (put the file in the "photos" folder): video shown first, then photo
  heroVideo: "",
  heroImage: "",                 // e.g. "photos/hero.jpg"
  // Shown on the hero photo. Use it whenever the hero shows cooked rolls.
  heroCaption: "Serving suggestion — delivered frozen",

  /* ---------------- PRODUCTS ----------------
     status: "available" or "soon" ("soon" = shown as Coming Soon, cannot be ordered)
     price: number in Rs (0 = "Ask on WhatsApp"), or a price per type
     image: real photo file (e.g. "photos/frozen-pack-6.jpg"), or "" for the gold icon
     imageNote: small label on the photo. Use "Serving suggestion — delivered frozen"
                whenever the photo shows cooked rolls; leave "" for photos of frozen packs.
  */
  products: [
    {
      id: "chicken-cheese-roll",
      name: "Frozen Cheese Chaska Roll",
      subtitle: "Chicken & Cheese · Ready to Cook",
      desc: "Our signature: tender spiced chicken and a generous melted-cheese centre, hand-wrapped at home and delivered frozen. Cook straight from the freezer whenever you like.",
      status: "available",
      badge: "Signature",
      art: "roll", image: "", imageNote: "",
      packs: [
        { name: "Pack of 6",  price: 1500 },
        { name: "Pack of 12", price: 3000 }
      ],
      types: [ "Frozen (Ready to Cook)" ]
    },
    {
      id: "fried-cheese-roll",
      name: "Fried Cheese Chaska Roll",
      subtitle: "Ready to Eat",
      desc: "Fried golden and ready to eat. Coming soon. For now, order our frozen rolls and cook them fresh at home.",
      status: "soon",
      art: "roll", image: "", imageNote: "",
      packs: [ { name: "Pack of 6", price: 0 }, { name: "Pack of 12", price: 0 } ],
      types: [ "Fried (Ready to Eat)" ]
    },
    { id: "shami-kabab", name: "Shami Kababs", desc: "Soft, spiced homemade kababs, ready to fry.", status: "soon", art: "kabab", image: "",
      packs: [ { name: "Pack of 6", price: 0 }, { name: "Pack of 12", price: 0 } ], types: [ "Frozen" ] },
    { id: "chicken-samosa", name: "Chicken Samosas", desc: "Crispy, hand-folded samosas with a spiced chicken filling.", status: "soon", art: "samosa", image: "",
      packs: [ { name: "Pack of 12", price: 0 }, { name: "Pack of 24", price: 0 } ], types: [ "Frozen" ] },
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

  // Customers can collect their order from home instead of delivery
  pickup: {
    enabled: true,               // false = hide the Pickup option at checkout
    area:    "Islampura, Lahore",
    hours:   "11 AM – 10 PM",
    note:    "Exact pickup address shared on WhatsApp when we confirm your order"
  },

  social: {
    instagram: "https://www.instagram.com/kitchenbykian/",
    facebook:  "https://www.facebook.com/profile.php?id=61595196895998",
    tiktok:    "https://www.tiktok.com/@kitchenbykian"
  }
};
