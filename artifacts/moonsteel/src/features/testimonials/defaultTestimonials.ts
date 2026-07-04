import type { Testimonial } from "@/features/testimonials/types";

export const defaultTestimonials: Testimonial[] = [
  {
    id: "default-hospitality",
    quote:
      "Moon Steel delivered our hotel prep line on schedule with flawless welds. The equipment has held up through three years of high-volume service without a single structural issue.",
    author_name: "Operations Director",
    author_role: "Hospitality Group",
    company: "Karachi",
    sort_order: 10,
    published: true,
    created_at: "",
  },
  {
    id: "default-healthcare",
    quote:
      "Their sterile prep stations met our infection-control requirements exactly. Radiused corners, seamless welds, and accurate gauge thickness — exactly what we specified.",
    author_name: "Facilities Manager",
    author_role: "Private Hospital",
    company: null,
    sort_order: 20,
    published: true,
    created_at: "",
  },
  {
    id: "default-restaurant",
    quote:
      "We needed a custom cooking line under a tight deadline. Moon Steel returned a detailed quote within 24 hours and fabricated to our drawings with zero rework on site.",
    author_name: "Head Chef",
    author_role: "Fine Dining Restaurant",
    company: "Lahore",
    sort_order: 30,
    published: true,
    created_at: "",
  },
];
