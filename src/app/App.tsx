import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, BrainCircuit, Car, ChevronRight, CircleDollarSign, ExternalLink, Eye, Mail, Menu, Microscope, Phone, Plane, Rocket, X, MessageCircle, MapPin, CalendarDays } from "lucide-react";

import logoImg from "@/public/logo.jpeg";

const NAV = ["Home", "Workshops", "About", "Gallery", "Contact"];
const contact = { email: "hr.futurepilot@gmail.com", phone: "+91 62610 72872" };

// Auto-import every numbered image (1.png, 2.jpeg, …) from src/public, ordered
// numerically. Non-numbered files like logo.jpeg are ignored. Drop a new
// `12.jpeg` into src/public and it shows up in the gallery automatically.
const GALLERY_IMAGES = Object.entries(
  import.meta.glob("../public/*.{png,jpg,jpeg}", { eager: true, import: "default" }) as Record<string, string>,
)
  .map(([path, src]) => ({ n: Number(path.match(/(\d+)\.[^/]+$/)?.[1]), src }))
  .filter((e) => Number.isFinite(e.n))
  .sort((a, b) => a.n - b.n)
  .map((e) => e.src);

/* ---------- Motion foundation ---------- */
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const softSpring = { type: "spring" as const, stiffness: 260, damping: 24 };

// Scroll-reveal wrapper. `stagger` makes direct motion children reveal in sequence.
function Reveal({ children, className, stagger = false, as = "div" }: { children: React.ReactNode; className?: string; stagger?: boolean; as?: "div" | "section" }) {
  const reduce = useReducedMotion();
  const MotionTag: any = as === "section" ? motion.section : motion.div;
  if (reduce) {
    const Tag: any = as;
    return <Tag className={className}>{children}</Tag>;
  }
  return (
    <MotionTag className={className} variants={stagger ? staggerContainer : fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
      {children}
    </MotionTag>
  );
}

// A single item inside a staggered Reveal container.
function RevealItem({ children, className, ...rest }: { children: React.ReactNode; className?: string } & React.ComponentProps<typeof motion.div>) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return <motion.div className={className} variants={fadeUp} {...rest}>{children}</motion.div>;
}

// Typewriter: types `text` out one character at a time with a blinking caret.
function Typewriter({ text, className, speed = 60, startDelay = 300 }: { text: string; className?: string; speed?: number; startDelay?: number }) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (reduce) { setCount(text.length); return; }
    setCount(0);
    let id: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      id = setInterval(() => setCount((c) => { if (c >= text.length) { clearInterval(id); return c; } return c + 1; }), speed);
    }, startDelay);
    return () => { clearTimeout(start); clearInterval(id); };
  }, [text, speed, startDelay, reduce]);
  const done = count >= text.length;
  return <span className={className}><span>{text.slice(0, count)}</span>{!reduce && <motion.span aria-hidden className="ml-1 inline-block w-[3px] translate-y-[2px] self-stretch bg-accent" style={{ height: "0.9em" }} animate={{ opacity: done ? [1, 0] : 1 }} transition={done ? { duration: 0.7, repeat: Infinity, repeatType: "reverse" } : { duration: 0 }} />}</span>;
}

// Reveals a heading word-by-word as it scrolls into view (heavier than a plain fade).
function WordReveal({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;
  const words = text.split(" ");
  return <motion.span className={className} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>{words.map((w, i) => <motion.span key={i} className="inline-block" variants={{ hidden: { opacity: 0, y: 24, rotateX: -40 }, show: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 220, damping: 18 } } }}>{w}{i < words.length - 1 ? " " : ""}</motion.span>)}</motion.span>;
}

// Cycles through phrases with an up/down slide swap.
function RotatingText({ phrases, className, interval = 2200 }: { phrases: string[]; className?: string; interval?: number }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((p) => (p + 1) % phrases.length), interval);
    return () => clearInterval(id);
  }, [phrases.length, interval, reduce]);
  if (reduce) return <span className={className}>{phrases[0]}</span>;
  return <span className={`relative inline-grid overflow-hidden ${className ?? ""}`}><AnimatePresence mode="wait"><motion.span key={i} initial={{ y: "100%", opacity: 0 }} animate={{ y: "0%", opacity: 1 }} exit={{ y: "-100%", opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 26 }} className="col-start-1 row-start-1">{phrases[i]}</motion.span></AnimatePresence></span>;
}

function Logo() {
  const reduce = useReducedMotion();
  return <button onClick={() => window.dispatchEvent(new CustomEvent("go", { detail: "Home" }))} className="group flex items-center gap-3 text-left" aria-label="Future Pilots home"><motion.span whileHover={reduce ? undefined : { scale: 1.06, rotate: -3 }} transition={softSpring} className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-[#072A63]/15 ring-1 ring-primary/10"><img src={logoImg} alt="Future Pilots logo" className="size-full object-cover" /></motion.span><span><span className="block font-['Poppins'] text-xl font-extrabold leading-none text-primary">Future Pilots</span><span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Learn. Innovate. Lead.</span></span></button>;
}

function CTA({ children, variant = "primary" }: { children: React.ReactNode; variant?: "primary" | "light" }) {
  return <motion.button onClick={() => window.dispatchEvent(new CustomEvent("go", { detail: "Contact" }))} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={softSpring} className={`group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold focus:outline-none focus:ring-4 focus:ring-accent/30 ${variant === "primary" ? "bg-primary text-white shadow-xl shadow-[#072A63]/18 hover:bg-[#0b377f]" : "border border-primary/15 bg-white text-primary shadow-sm hover:border-accent"}`}>{children}<ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" /></motion.button>;
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return <Reveal className="mx-auto mb-10 max-w-3xl text-center"><p className="mb-3 text-xs font-extrabold uppercase tracking-[0.28em] text-[#3eaa00]">{eyebrow}</p><h2 className="font-['Poppins'] text-3xl font-extrabold text-primary md:text-4xl" style={{ perspective: 600 }}><WordReveal text={title} /></h2>{text && <p className="mt-4 text-base leading-7 text-muted-foreground">{text}</p>}</Reveal>;
}

const domains = [
  ["AI for basic website development via Prompt Engineering and Agentic AI", BrainCircuit, true, ["Prompt Engineering Basics", "Agentic AI Workflows", "Website Structure Planning", "Landing Page Copy and Layout", "Frontend Editing with AI", "Publishing and Safety Basics"]],
  ["Electric Vehicle, Automobile Engineering Concepts", Car, true, ["How Electric Vehicles Work", "EV Battery Basics", "Motor and Power Systems", "Vehicle Design Fundamentals", "Sustainable Transportation", "Real World EV Applications"]],
  ["Robotics and Drone Technology", Rocket, false, ["Introduction to Robotics", "Building Simple Robots", "Sensors and Automation", "Drone Components", "Flight Principles", "Robotics in Everyday Life"]],
  ["Strategic & Non-Tech Skills", MessageCircle, false, ["Communication Skills", "Public Speaking", "Leadership", "Critical Thinking", "Team Collaboration", "Decision Making"]],
  ["Finance & Commercial Logic", CircleDollarSign, false, ["Money Management", "Personal Finance Basics", "Budgeting", "Business Fundamentals", "Profit and Cost Concepts", "Investment Awareness"]],
  ["Bio & Scientific Innovation", Microscope, false, ["Biotechnology Basics", "Genetics Simplified", "Healthcare Innovation", "Scientific Research Methods", "Future Medical Technologies", "Environmental Innovation"]],
] as const;

function Home() {
  const reduce = useReducedMotion();
  const why = ["National Level Innovators", "Practical Learning Approach", "School Friendly Execution", "Hands On Activities", "Future Ready Skills"];
  return <><section className="relative overflow-hidden bg-white px-6 pb-20 pt-14 md:pt-24"><motion.div animate={reduce ? undefined : { x: [0, 20, 0], y: [0, -16, 0], scale: [1, 1.12, 1] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} className="absolute left-8 top-32 h-40 w-40 rounded-full bg-accent/20 blur-3xl" /><motion.div animate={reduce ? undefined : { x: [0, -24, 0], y: [0, 18, 0], scale: [1, 1.08, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" /><motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="relative mx-auto max-w-5xl text-center"><motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, ...softSpring }} className="mb-5 inline-flex rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-bold text-primary">Hands-on future ready workshops for Classes 8 to 12</motion.p><h1 className="font-['Poppins'] text-4xl font-extrabold leading-[1.08] text-primary md:text-6xl"><Typewriter text="Beyond Classroom Learning" speed={70} className="inline-flex items-center" /></h1><p className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-2 text-base leading-7 text-[#334155]">Transforming Students from Learners to <RotatingText phrases={["Innovators", "Builders", "Leaders", "Creators"]} className="font-extrabold text-[#3eaa00]" /></p><div className="mt-8 flex flex-wrap justify-center gap-4"><CTA>Book a Workshop</CTA><CTA variant="light">Explore Topics</CTA></div></motion.div></section><section className="bg-secondary px-6 py-20"><SectionTitle eyebrow="Why Future Pilots" title="School friendly execution, student-level wonder" /><Reveal stagger className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">{why.map((w, i) => <RevealItem whileHover={reduce ? undefined : { y: -6 }} transition={softSpring} className="rounded-3xl bg-white p-6 shadow-lg shadow-[#072A63]/5 transition-shadow hover:shadow-xl hover:shadow-[#072A63]/10" key={w}><span className="grid size-11 place-items-center rounded-2xl bg-accent/15 font-bold text-primary">{i + 1}</span><h3 className="mt-5 font-['Poppins'] text-lg font-bold text-primary">{w}</h3><p className="mt-2 text-muted-foreground">Designed for assembly halls, classrooms, labs, and mixed curiosity levels.</p></RevealItem>)}</Reveal></section><section className="px-6 py-20"><SectionTitle eyebrow="Workshop journey" title="A flight plan for active learning" /><Reveal stagger className="mx-auto grid max-w-6xl gap-4 md:grid-cols-6">{["Theory Session", "Live Demonstration", "Hands On Activity", "Team Challenge", "Discussion & Reflection", "Follow Up Resources"].map((s) => <RevealItem whileHover={reduce ? undefined : { y: -4 }} transition={softSpring} className="group relative rounded-3xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-lg" key={s}><Plane className="mb-5 size-6 text-accent transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-12" /><p className="font-bold text-primary">{s}</p></RevealItem>)}</Reveal></section></>;
}

function About() {
  const cards = [
    ["Vision", "By introducing students to emerging technologies, innovation-driven thinking, leadership development, and industry-relevant skills at an early stage, we aim to create future-ready individuals capable of driving positive change in their communities and beyond."],
    ["Mission", "Future Pilots is committed to bridging the gap between traditional classroom learning and the practical demands of the modern world. Our mission is to provide engaging, hands-on, and experiential learning opportunities that expose students to emerging technologies, scientific innovation, entrepreneurship, leadership, and future career pathways."],
    ["Values", "We encourage curiosity, experimentation, and the courage to build solutions that create meaningful impact."],
  ];
  const reduce = useReducedMotion();
  return <section className="px-6 py-16"><SectionTitle eyebrow="About" title="Built by learners, for future creators" text="Future Pilots bridges the gap between textbook learning and real-world application through practical workshops, projects, and innovation-led experiences." /><div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_.95fr]"><Reveal as="div"><article className="rounded-[2rem] bg-primary p-7 text-white shadow-xl md:p-9"><p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-accent">Our Story</p><h3 className="font-['Poppins'] text-2xl font-bold">Future Pilots was born from a simple belief: students learn best when they build, create, and solve real problems.</h3><div className="mt-5 space-y-4 text-sm leading-7 text-white/82 md:text-base md:leading-8"><p>The journey began with a group of students who refused to limit their learning to classrooms and textbooks. Instead, they chose to experiment, compete, and innovate. Along the way, the team achieved milestones that reflected this mindset, including securing an All India Rank 7 in a national SAE competition after designing and developing an electric vehicle from the ground up, gaining hands-on experience in engineering, teamwork, and problem-solving.</p><p>The spirit of innovation continued with participation in prestigious challenges such as the Smart India Hackathon (SIH), where ideas were transformed into practical solutions addressing real-world problems. These experiences reinforced a powerful lesson: the future belongs to those who can combine knowledge with execution.</p>
  <p className="font-semibold text-white">Today, Future Pilots is more than an initiative. It is a community of learners, builders, innovators, and future leaders committed to shaping tomorrow through creativity, technology, and continuous learning. 🚀</p></div></article></Reveal><Reveal stagger className="grid content-start gap-4">{cards.map(([title, body])=><RevealItem whileHover={reduce ? undefined : { y: -4 }} transition={softSpring} className="rounded-3xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-lg" key={title}><h4 className="font-['Poppins'] text-lg font-bold text-primary">{title}</h4><p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">{body}</p></RevealItem>)}</Reveal></div></section>}

function Workshops() {const reduce = useReducedMotion(); return <section className="bg-secondary px-6 py-16"><SectionTitle eyebrow="Workshop Topics" title="Six focused domains with real outcomes" /><Reveal stagger className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">{domains.map(([name, Icon, bestseller, topics])=><RevealItem whileHover={reduce ? undefined : { y: -6 }} transition={softSpring} className={`group relative rounded-[1.75rem] border bg-white p-5 sm:p-6 shadow-lg shadow-[#072A63]/5 transition-shadow hover:shadow-xl hover:shadow-[#072A63]/10 ${bestseller ? "ring-2 ring-accent/60" : ""}`} key={name}>{bestseller && <motion.span animate={reduce ? undefined : { scale: [1, 1.05, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} className="mb-4 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Bestseller</motion.span>}<div className="flex min-w-0 flex-col gap-4 sm:flex-row"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/15 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"><Icon /></span><div><h3 className="font-['Poppins'] text-lg font-bold text-primary">{name}</h3><p className="mt-2 text-muted-foreground">Overview: a practical introduction with demos, teamwork, and student reflection.</p></div></div><div className="mt-5 grid min-w-0 gap-2 sm:grid-cols-2">{topics.map(t=><p className="flex min-w-0 items-start gap-2 text-sm leading-6 text-[#334155]" key={t}><ChevronRight className="mt-1 size-4 shrink-0 text-accent" />{t}</p>)}</div><div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold"><span className="rounded-full bg-secondary px-3 py-1">Learning Outcomes: build + explain</span><span className="rounded-full bg-secondary px-3 py-1">Target Classes 8–12</span><span className="rounded-full bg-secondary px-3 py-1">Duration 2–3 hours</span></div><div className="mt-6"><CTA>Book Workshop</CTA></div></RevealItem>)}</Reveal></section>}

function Gallery() {const reduce = useReducedMotion(); const [open,setOpen]=useState<{label:string;src?:string}|null>(null); const cats=["Workshop Events","School Visits","Student Activities","Project Showcases"]; const imgs=GALLERY_IMAGES.map((src,i)=>({cat:cats[i%4], h:[220,300,180,260][i%4], label:`${cats[i%4]} ${i+1}`, src})); return <section className="px-6 py-16"><SectionTitle eyebrow="Gallery" title="Responsive moments from the workshop floor"/><Reveal stagger className="mx-auto columns-1 gap-5 space-y-5 md:columns-3 max-w-7xl">{imgs.map((img)=><RevealItem key={img.label} className="mb-5 inline-block w-full align-top"><motion.button onClick={()=>setOpen({label:img.label, src:img.src})} whileHover={reduce ? undefined : { y: -4 }} transition={softSpring} className="group block w-full overflow-hidden rounded-3xl border bg-secondary text-left shadow-sm transition-shadow hover:shadow-xl hover:shadow-[#072A63]/10"><div className="overflow-hidden">{img.src ? <img src={img.src} alt={img.label} loading="lazy" className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]" style={{height:img.h}} /> : <div className="grid place-items-center bg-gradient-to-br from-[#eaf7e6] to-[#eaf2ff] p-6 transition-transform duration-500 ease-out group-hover:scale-[1.06]" style={{height:img.h}}><Eye className="size-10 text-primary/50 transition-transform duration-300 group-hover:scale-125 group-hover:text-primary/70" /></div>}</div><p className="p-4 font-bold text-primary transition-colors group-hover:text-[#0b377f]">{img.label}</p></motion.button></RevealItem>)}</Reveal><AnimatePresence>{open && <motion.div onClick={()=>setOpen(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-primary/70 p-6"><motion.div initial={{ opacity: 0, scale: 0.9, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={softSpring} onClick={(e)=>e.stopPropagation()} className="max-h-[85vh] max-w-2xl overflow-hidden rounded-[2rem] bg-white text-center shadow-2xl">{open.src ? <><img src={open.src} alt={open.label} className="max-h-[70vh] w-full object-contain bg-secondary" /><p className="p-5 font-['Poppins'] text-xl font-bold text-primary">{open.label}</p></> : <div className="p-8"><p className="font-['Poppins'] text-2xl font-bold text-primary">{open.label}</p><p className="mt-2 text-muted-foreground">Lightbox preview. Replace placeholder with CMS images anytime.</p></div>}</motion.div></motion.div>}</AnimatePresence></section>}

function Contact() {const reduce = useReducedMotion(); return <section className="bg-secondary px-6 py-16"><SectionTitle eyebrow="Contact" title="Contact Future Pilots directly" text="Reach out by email or phone to book a workshop, schedule a session, or discuss a school partnership." /><div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2"><Reveal><div className="rounded-[2rem] bg-primary p-8 text-white shadow-xl"><h3 className="font-['Poppins'] text-2xl font-bold">Future Pilots</h3><p className="mt-3 text-white/75">Learn. Innovate. Lead.</p>{[[Mail,contact.email],[Phone,contact.phone],[CalendarDays,"Monday to Saturday"],[MapPin,"Indore, India"]].map(([Icon,text]:any)=><p className="group mt-6 flex items-center gap-3" key={text}><Icon className="size-5 text-accent transition-transform duration-300 group-hover:scale-125" />{text}</p>)}</div></Reveal><Reveal><div className="rounded-[2rem] border bg-white p-8 shadow-xl shadow-[#072A63]/8"><h3 className="font-['Poppins'] text-2xl font-bold text-primary">Ready to invite us?</h3><p className="mt-4 text-base leading-7 text-muted-foreground">Please contact us with your school name, target classes, preferred workshop topic, expected student count, and preferred dates. Our team will coordinate the next steps directly.</p><div className="mt-8 flex flex-wrap gap-4"><motion.a href={`mailto:${contact.email}`} whileHover={reduce ? undefined : { scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={softSpring} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white"><Mail className="size-4" />Email Us</motion.a><motion.a href="tel:+916261072872" whileHover={reduce ? undefined : { scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={softSpring} className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-6 py-3 font-bold text-primary"><Phone className="size-4" />Call Now</motion.a></div></div></Reveal></div></section>}

export default function App() {
  const [page,setPage]=useState("Home"); const [menu,setMenu]=useState(false);
  const goTo = (next: string) => { setPage(next); setMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  useEffect(()=>{const h=(e:any)=>goTo(e.detail); window.addEventListener("go",h); return ()=>window.removeEventListener("go",h)},[]);
  const Page = page === "About" ? About : page === "Workshops" ? Workshops : page === "Gallery" ? Gallery : page === "Contact" ? Contact : Home;
  return <main className="min-h-screen bg-background font-['Inter'] text-foreground"><header className="sticky top-0 z-40 border-b bg-white/90 px-6 py-4 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between"><Logo /><nav className="hidden items-center gap-1 md:flex">{NAV.map(n=><motion.button onClick={()=>goTo(n)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={softSpring} className={`rounded-full px-4 py-2 font-bold ${page===n?'bg-secondary text-primary':'text-muted-foreground hover:text-primary'}`} key={n}>{n}</motion.button>)}</nav><button className="md:hidden" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div><AnimatePresence>{menu&&<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: EASE }} className="overflow-hidden md:hidden"><div className="mt-4 grid gap-2">{NAV.map(n=><button onClick={()=>goTo(n)} className="rounded-2xl bg-secondary p-3 text-left font-bold text-primary" key={n}>{n}</button>)}</div></motion.div>}</AnimatePresence></header><AnimatePresence mode="wait"><motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}><Page /></motion.div></AnimatePresence><footer className="border-t bg-white px-6 py-12"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4"><Logo /><div><h4 className="font-bold text-primary">Quick Links</h4>{NAV.map(n=><button onClick={()=>goTo(n)} className="mt-2 block text-muted-foreground transition-colors hover:text-primary" key={n}>{n}</button>)}</div><div><h4 className="font-bold text-primary">Workshop Topics</h4><p className="mt-2 text-muted-foreground">AI website development, EV concepts, Robotics, Strategic skills, Finance, Bio innovation</p></div><div><h4 className="font-bold text-primary">Contact</h4><p className="mt-2 text-muted-foreground">{contact.email}<br />{contact.phone}<br />Indore, India</p><div className="mt-4 flex gap-3">{[0,1,2].map(i=><motion.span key={i} whileHover={{ scale: 1.2, y: -2 }} transition={softSpring} className="cursor-pointer text-muted-foreground hover:text-primary"><ExternalLink/></motion.span>)}</div></div></div><p className="mx-auto mt-10 max-w-7xl text-sm text-muted-foreground">© 2026 Future Pilots. Learn. Innovate. Lead.</p></footer></main>;
}
