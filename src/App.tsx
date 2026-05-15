import { motion, useScroll, useSpring, AnimatePresence } from "motion/react";
import { 
  Bolt, 
  Diamond, 
  Smartphone, 
  PenTool, 
  Mail, 
  Phone, 
  MessageCircle, 
  Instagram, 
  Link as LinkIcon,
  ChevronRight,
  ArrowRight,
  Star,
  CheckCircle2,
  Lock,
  X
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './lib/firebase';
import { AdminPanel } from './components/AdminPanel';

const IMAGES = {
  heroVisual: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
  portfolio1: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
  portfolio2: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop",
  portfolio3: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
};

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  img: string;
  link?: string;
  order: number;
}

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [clickCount, setClickCount] = useState(0);

  const [contactData, setContactData] = useState({
    name: "",
    phone: "",
    email: "",
    type: "기업형 홈페이지",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Save to Firestore for Admin Panel
      await addDoc(collection(db, 'contacts'), {
        ...contactData,
        createdAt: serverTimestamp()
      });

      // 2. Send to Formspree for Email Notification
      await fetch("https://formspree.io/f/xrejwywd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: contactData.name,
          phone: contactData.phone,
          email: contactData.email,
          type: contactData.type,
          message: contactData.message,
          _subject: `[G.web Inquiry] New request from ${contactData.name}`
        })
      });

      setIsSubmitted(true);
      setContactData({
        name: "",
        phone: "",
        email: "",
        type: "기업형 홈페이지",
        message: ""
      });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'contacts');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'portfolio'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PortfolioItem[];
      setPortfolioData(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'portfolio');
    });

    return () => unsubscribe();
  }, []);

  const handleLogoClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount + 1 >= 5) {
      setIsAdminOpen(true);
      setClickCount(0);
    }
    // Reset click count after 3 seconds
    setTimeout(() => setClickCount(0), 3000);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://images.unsplash.com/photo-1560171963-70d103725036?q=80&w=800&auto=format&fit=crop";
    e.currentTarget.onerror = null;
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const stagger = {
    whileInView: { transition: { staggerChildren: 0.1 } }
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const REVIEWS = [
    {
      name: "김민혁",
      role: "테크 스타트업 대표",
      content: "복잡했던 요구사항을 명확하게 파악하고 압도적인 디자인으로 풀어주셨습니다. 결과물이 정말 만족스럽습니다.",
      rating: 5,
      tag: "Project: SaaS 플랫폼"
    },
    {
      name: "이지연",
      role: "패션 브랜드 디렉터",
      content: "브랜드가 지향하는 프리미엄 이미지가 웹에서 그대로 느껴집니다. 모바일 최적화도 완벽하네요.",
      rating: 5,
      tag: "Project: 패션 브랜드"
    },
    {
      name: "박준호",
      role: "건축사무소 실장",
      content: "세련된 레이아웃과 속도감 있는 모션 덕분에 포트폴리오를 가장 효과적으로 보여줄 수 있게 되었습니다.",
      rating: 5,
      tag: "Project: 건축 인테리어"
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary-fixed z-[100] origin-left"
        style={{ scaleX }}
      />

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] bg-primary-fixed rounded-full blur-[120px] opacity-10" />
        <div className="absolute bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-500 rounded-full blur-[150px] opacity-5" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div 
            onClick={handleLogoClick}
            className="text-xl md:text-2xl font-display font-black tracking-tighter hover:text-primary-fixed transition-colors cursor-pointer select-none"
          >
            G.<span className="text-primary-fixed">web</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {["Service", "Portfolio", "Process", "Reviews", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-label text-on-surface-variant hover:text-primary-fixed transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <a 
              href="https://open.kakao.com/o/sbHSLu3h" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex btn-primary items-center gap-2 group px-4 py-2 text-sm md:px-6 md:py-3 md:text-base"
            >
              Consultation
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <ArrowRight size={16} />
              </motion.span>
            </a>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : (
                <div className="flex flex-col gap-1.5">
                  <div className="w-6 h-0.5 bg-white rounded-full" />
                  <div className="w-4 h-0.5 bg-primary-fixed rounded-full self-end" />
                  <div className="w-6 h-0.5 bg-white rounded-full" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-surface-container/95 backdrop-blur-2xl border-b border-white/5 overflow-hidden"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                {["Service", "Portfolio", "Process", "Reviews", "Contact"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-2xl font-display font-bold text-white hover:text-primary-fixed transition-colors"
                  >
                    {item}
                  </a>
                ))}
                <a 
                  href="https://open.kakao.com/o/sbHSLu3h"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full py-4 mt-4 flex items-center justify-center gap-2 text-lg"
                >
                  Consultation
                  <ArrowRight size={20} />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section id="hero" className="relative pt-24 pb-20 md:pt-32 md:pb-40 px-4 md:px-6 min-h-screen flex items-center overflow-hidden bg-black">
          {/* Enhanced Background Effects */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -right-1/4 w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] bg-blue-600/10 rounded-full blur-[100px] md:blur-[180px] animate-pulse-slow" />
            <div className="absolute -bottom-1/4 -left-1/4 w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-primary-fixed/5 rounded-full blur-[120px] md:blur-[200px]" />
          </div>
          
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 md:px-5 md:py-2.5 rounded-full mb-6 md:mb-12 backdrop-blur-xl">
                  <div className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-fixed opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 md:h-2.5 w-2 md:w-2.5 bg-primary-fixed"></span>
                  </div>
                  <span className="text-[8px] md:text-[10px] font-label uppercase tracking-[0.3em] text-primary-fixed font-bold">New Vision 2024</span>
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[100px] font-display font-black leading-[0.9] mb-8 md:mb-12 tracking-tighter text-white">
                  <span className="block mb-2 overflow-hidden">
                    <motion.span 
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.2, duration: 0.8, ease: "circOut" }}
                      className="block"
                    >
                      디자인 &
                    </motion.span>
                  </span>
                  <span className="block overflow-hidden pb-2 md:pb-4">
                    <motion.span 
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.4, duration: 0.8, ease: "circOut" }}
                      className="block text-primary-fixed"
                    >
                      마케팅
                    </motion.span>
                  </span>
                </h1>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 1 }}
                  className="text-lg md:text-xl text-on-surface-variant mb-10 md:mb-14 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
                >
                  감각적인 디자인과 전략적인 마케팅이 만나<br />
                  브랜드의 가치를 만듭니다
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-6"
                >
                  <a 
                    href="https://open.kakao.com/o/sbHSLu3h"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative px-8 py-4 md:px-12 md:py-5 bg-primary-fixed text-black rounded-xl font-display font-black text-lg md:text-xl shadow-[0_0_40px_rgba(195,244,0,0.4)] hover:shadow-[0_0_60px_rgba(195,244,0,0.6)] transition-all flex items-center gap-3 group overflow-hidden"
                  >
                    <span className="relative z-10">Free Consultation</span>
                    <ArrowRight size={22} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                  </a>
                  <button className="px-8 py-4 md:px-12 md:py-5 border-2 border-white/10 rounded-xl font-display font-bold text-lg md:text-xl text-white hover:bg-white/5 transition-all">
                    View Portfolio
                  </button>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Visual Composition (Mockups) */}
            <div className="hidden lg:col-span-6 relative h-[600px] lg:flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="relative w-full h-full flex items-center justify-center p-12"
              >
                {/* Main Browser Mockup */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="absolute z-20 top-0 left-0 w-full max-w-[600px] overflow-hidden rounded-2xl bg-[#0D1117]/90 backdrop-blur-3xl border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.7)] group"
                >
                  {/* Browser Bar */}
                  <div className="flex items-center px-5 h-14 bg-white/5 border-b border-white/10">
                    <div className="flex gap-2 mr-8">
                      <div className="w-3 h-3 rounded-full bg-red-400/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                      <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    </div>
                    <div className="flex-1 h-7 bg-white/5 rounded-md border border-white/5 flex items-center px-3 gap-2">
                       <div className="w-2 h-2 rounded-full bg-primary-fixed/40" />
                       <div className="w-24 h-1.5 bg-white/20 rounded-full" />
                    </div>
                  </div>
                  
                  {/* Browser Content */}
                  <div className="p-8 relative overflow-hidden">
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(195,244,0,0.05),transparent_70%)]" />
                    
                    <div className="relative z-10 space-y-6">
                      <div className="text-[10px] uppercase tracking-[0.4em] text-primary-fixed font-bold opacity-80">Portfolio Showcase</div>
                      <h3 className="text-4xl font-display font-black leading-tight text-white mb-8">
                        디자인과 <br />
                        <span className="text-primary-fixed">마케팅 전략의 만남</span>
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-video rounded-xl overflow-hidden border border-white/10 relative group/item">
                          <img src={IMAGES.portfolio1} className="w-full h-full object-cover opacity-60 group-hover/item:opacity-100 transition-all duration-500" alt="Work 1" />
                        </div>
                        <div className="aspect-video rounded-xl overflow-hidden border border-white/10 relative group/item">
                          <img src={IMAGES.portfolio2} className="w-full h-full object-cover opacity-60 group-hover/item:opacity-100 transition-all duration-500" alt="Work 2" />
                        </div>
                      </div>

                      <div className="pt-6 flex justify-between items-center border-t border-white/5">
                        <div className="flex -space-x-3">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="w-9 h-9 rounded-full border-2 border-[#0D1117] bg-white/10 flex items-center justify-center overflow-hidden">
                              <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/5" />
                            </div>
                          ))}
                        </div>
                        <a 
                          href="https://open.kakao.com/o/sbHSLu3h"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-24 h-8 bg-primary-fixed rounded-lg flex items-center justify-center text-[10px] font-black text-black hover:scale-105 transition-transform"
                        >
                          Get Quote
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Smartphone Mockup */}
                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                  className="absolute z-30 bottom-[-40px] right-2 w-[220px] aspect-[1/2] rounded-[42px] bg-[#050505] p-3 border border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.9)]"
                >
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-4 bg-black rounded-lg z-20" />
                  <div className="h-full w-full bg-[#0D1117] rounded-[34px] overflow-hidden relative p-6">
                    <div className="mt-8 space-y-4">
                      <div className="text-[8px] font-label text-primary-fixed tracking-widest uppercase font-bold">G.web Agency</div>
                      <h4 className="text-xl font-display font-black leading-tight text-white mb-4">Crafting Future <br />Digital Identity</h4>
                    </div>
                    
                    <div className="mt-8 space-y-4">
                       <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
                          <img src={IMAGES.portfolio3} className="w-full h-full object-cover" alt="Mobile Portfolio" />
                       </div>
                       <div className="flex gap-2 items-center">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />
                         <div className="w-2/3 h-1.5 bg-white/20 rounded-full" />
                       </div>
                       <div className="w-1/2 h-1.5 bg-white/10 rounded-full" />
                    </div>

                    <div className="absolute bottom-10 left-0 right-0 px-6">
                       <div className="w-full h-10 bg-primary-fixed rounded-xl flex items-center justify-center text-[10px] font-black text-black">Contact Us</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="service" className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12 md:mb-20">
            <span className="text-primary-fixed font-label text-xs md:text-sm tracking-[0.2em] uppercase mb-4 block">Expertise</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Our Services</h2>
            <div className="w-16 md:w-24 h-1 bg-primary-fixed mx-auto rounded-full" />
          </motion.div>

          <motion.div 
            variants={{
              initial: { opacity: 0 },
              whileInView: { 
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.2 }
              }
            }}
            whileInView="whileInView"
            initial="initial"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {[
              { icon: <Bolt size={24} />, title: "전략형 디자인", desc: <>단순히 예쁜 웹이 아닌<br />브랜드 성장을 고려한 전략형 디자인을<br />제작합니다.</> },
              { icon: <Diamond size={24} />, title: "마케팅 중심 설계", desc: <>고객의 시선과 행동 흐름을 분석하여<br />문의와 전환을 고려한 웹사이트를 설계합니다.</> },
              { icon: <Smartphone size={24} />, title: "반응형 최적화", desc: <>PC·모바일 어디서든<br />브랜드 경험이 자연스럽게 이어지도록<br />구현합니다.</> },
              { icon: <PenTool size={24} />, title: "브랜드 맞춤", desc: <>당신만의 아이덴티티를 심층 분석하여<br />맞춤형 디지털 공간을 구축합니다.</> }
            ].map((service, i) => (
              <motion.div 
                key={i} 
                variants={{
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 }
                }}
                whileHover={{ 
                  y: -8, 
                  backgroundColor: "rgba(195, 244, 0, 0.05)",
                  borderColor: "rgba(195, 244, 0, 0.3)" 
                }}
                className="glass-card p-6 md:p-8 rounded-2xl group transition-all duration-300 border border-white/5"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary-fixed/10 flex items-center justify-center rounded-xl text-primary-fixed mb-6 group-hover:bg-primary-fixed group-hover:text-black transition-all">
                  {service.icon}
                </div>
                <h3 className="text-xl font-display font-bold mb-3">{service.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Portfolio Section */}
        <section id="portfolio" className="py-20 md:py-32 px-4 md:px-6 max-w-[1440px] mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Header Part */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-3 lg:sticky lg:top-40 pt-4 text-center lg:text-left"
            >
              <span className="text-primary-fixed font-label text-xs md:text-sm tracking-[0.3em] uppercase mb-4 md:mb-6 block font-bold">Portfolio</span>
              <h2 className="text-3xl md:text-5xl font-display font-black mb-6 md:mb-8 leading-[1.2] tracking-tighter text-white">
                다양한 <br className="hidden md:block" />프로젝트 경험
              </h2>
              <p className="text-on-surface-variant mb-8 md:mb-12 text-base md:text-lg leading-relaxed">
                G.web이 제작한 다양한 홈페이지를<br className="hidden md:block" />
                확인해보세요.
              </p>
              <button className="inline-flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-all group">
                전체 포트폴리오 보기
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Right Scrollable Cards Part */}
            <div className="lg:col-span-9 relative overflow-hidden">
              <motion.div 
                animate={{ x: ["0%", "-50%"] }}
                transition={{ 
                  duration: portfolioData.length > 5 ? 40 : 30, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="flex gap-4 md:gap-6 w-max pb-8 md:pb-12"
              >
                {(portfolioData.length > 0 ? [...portfolioData, ...portfolioData] : [
                  { img: IMAGES.portfolio1, category: "IT / 스타트업", title: "SaaS 플랫폼" },
                  { img: IMAGES.portfolio2, category: "브랜드 / 쇼핑몰", title: "패션 브랜드" },
                  { img: IMAGES.portfolio3, category: "기업 / 서비스", title: "건축 인테리어" },
                  { img: IMAGES.portfolio1, category: "의료 / 병원", title: "의료 기관" },
                ]).map((item, i) => (
                  <div 
                    key={i}
                    className="flex-shrink-0 w-[240px] md:w-[320px] group cursor-pointer"
                    onClick={() => {
                       if (item.link) window.open(item.link, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <div className="aspect-[4/5] overflow-hidden rounded-[24px] md:rounded-[32px] bg-surface-container border border-white/10 mb-4 md:mb-6 relative">
                      <motion.img 
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                        src={item.img} 
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                        className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" 
                        alt={item.title} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="px-2 md:px-4 flex items-center justify-between">
                      <div>
                        <div className="text-primary-fixed text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">{item.category}</div>
                        <h4 className="text-lg md:text-xl font-display font-bold text-white group-hover:text-primary-fixed transition-colors">{item.title}</h4>
                      </div>
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 flex items-center justify-center text-white md:group-hover:bg-primary-fixed md:group-hover:text-black md:group-hover:border-primary-fixed transition-all">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
              
              <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section id="process" className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto overflow-hidden">
          <motion.div {...fadeInUp} className="text-center mb-16 md:mb-24">
            <span className="text-primary-fixed font-label text-xs md:text-sm tracking-[0.2em] uppercase mb-4 block">Workflow</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold">Our Process</h2>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute top-[32px] left-0 w-full h-[1px] bg-white/10 z-0" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 relative z-10">
              {[
                { step: "01", title: "상담", desc: "요구사항 분석 및 비전 공유" },
                { step: "02", title: "기획", desc: "구조 설계 및 와이어프레임" },
                { step: "03", title: "디자인", desc: "브랜드 맞춤형 비주얼 제작" },
                { step: "04", title: "제작", desc: "고성능 퍼포먼스 퍼블리싱" },
                { step: "05", title: "오픈", desc: "최종 검수 및 배포 완료" }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full border ${i === 0 ? 'border-primary-fixed text-primary-fixed shadow-[0_0_20px_rgba(195,244,0,0.3)]' : 'border-white/10 text-on-surface-variant'} bg-black flex items-center justify-center font-display font-bold text-xl md:text-2xl mb-6 md:mb-8 relative transition-all duration-300 group-hover:border-primary-fixed group-hover:text-primary-fixed`}>
                    {item.step}
                    {i === 0 && <div className="absolute inset-0 rounded-full border border-primary-fixed animate-ping opacity-20" />}
                  </div>
                  <h4 className="text-lg md:text-xl font-display font-bold mb-2 md:mb-3 group-hover:text-primary-fixed transition-colors">{item.title}</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed px-4 md:px-0">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
          <motion.div {...fadeInUp} className="text-center mb-24">
            <span className="text-primary-fixed font-label text-sm tracking-[0.3em] uppercase mb-6 block font-bold">Client Stories</span>
            <h2 className="text-4xl md:text-5xl font-display font-black mb-8 leading-[1.2] tracking-tighter text-white">
              다양한 <br />프로젝트 경험
            </h2>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={20} fill="#c3f400" className="text-primary-fixed" />
              ))}
              <span className="ml-3 text-on-surface-variant font-bold">5.0 / 5.0 만족도</span>
            </div>
          </motion.div>

          {/* Reviews Marquee */}
          <div className="relative -mx-6 overflow-hidden group/marquee">
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ 
                duration: 50, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="flex gap-8 w-max px-6 pb-12"
            >
              {[...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS].map((review, i) => (
                <div 
                  key={i}
                  className="flex-shrink-0 w-[320px] md:w-[400px] glass-card p-10 rounded-[40px] border border-white/5 relative group bg-white/[0.02] backdrop-blur-sm"
                >
                  <div className="absolute top-8 right-10 text-primary-fixed opacity-10">
                    <CheckCircle2 size={32} />
                  </div>
                  
                  <div className="flex gap-1 mb-8">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill="#c3f400" className="text-primary-fixed" />
                    ))}
                  </div>

                  <p className="text-lg text-white font-medium mb-10 leading-relaxed italic h-[120px] overflow-hidden">
                    "{review.content}"
                  </p>

                  <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-display font-black text-white">{review.name}</div>
                      <div className="text-xs text-on-surface-variant font-medium mt-1">{review.role}</div>
                    </div>
                    <div className="text-[10px] font-label text-primary-fixed uppercase tracking-wider font-bold">
                      {review.tag.split(":")[1]}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
            
            {/* Edge Gradients for smooth fade */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto">
          <div className="glass-card rounded-[32px] md:rounded-[40px] p-8 md:p-16 lg:p-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 overflow-hidden relative border border-white/5 bg-white/[0.01]">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-fixed/10 rounded-full blur-[120px]" />
            
            <motion.div {...fadeInUp} className="z-10 text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold mb-6 md:mb-8 leading-tight tracking-tighter">
                Ready to start <br className="hidden md:block" />your journey?
              </h2>
              <p className="text-base md:text-lg text-on-surface-variant mb-10 md:mb-12 leading-relaxed max-w-lg mx-auto lg:mx-0">
                지금 바로 전문가와 상담하고 비즈니스의 새로운 도약을 시작하세요. 
                빠르고 친절하게 안내해 드리겠습니다.
              </p>
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-center lg:justify-start gap-4 md:gap-6 group">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary-fixed group-hover:text-black transition-all">
                    <Mail size={18} />
                  </div>
                  <span className="text-base md:text-lg font-label">monet0424@gmail.com</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-4 md:gap-6 group">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary-fixed group-hover:text-black transition-all">
                    <Phone size={18} />
                  </div>
                  <span className="text-base md:text-lg font-label">010-3264-1867</span>
                </div>
              </div>
            </motion.div>

            <motion.form 
              {...fadeInUp}
              className="space-y-4 md:space-y-6 z-10"
              onSubmit={handleContactSubmit}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant block mb-2 font-bold">성함 / 업체명</label>
                  <input 
                    type="text" 
                    placeholder="홍길동 / G.web"
                    required
                    value={contactData.name}
                    onChange={e => setContactData({...contactData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 focus:border-primary-fixed focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant block mb-2 font-bold">연락처</label>
                  <input 
                    type="tel" 
                    placeholder="010-0000-0000"
                    required
                    value={contactData.phone}
                    onChange={e => setContactData({...contactData, phone: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 focus:border-primary-fixed focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant block mb-2 font-bold">이메일 주소</label>
                <input 
                  type="email" 
                  placeholder="example@email.com"
                  required
                  value={contactData.email}
                  onChange={e => setContactData({...contactData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 focus:border-primary-fixed focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant block mb-2 font-bold">웹사이트 유형</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 focus:border-primary-fixed focus:outline-none transition-colors appearance-none cursor-pointer"
                  value={contactData.type}
                  onChange={e => setContactData({...contactData, type: e.target.value})}
                >
                  <option className="bg-[#0A0A0A]">기업형 홈페이지</option>
                  <option className="bg-[#0A0A0A]">랜딩 페이지</option>
                  <option className="bg-[#0A0A0A]">쇼핑몰</option>
                  <option className="bg-[#0A0A0A]">기타</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant block mb-2 font-bold">문의 내용</label>
                <textarea 
                  rows={4}
                  placeholder="프로젝트에 대해 간략히 설명해 주세요."
                  required
                  value={contactData.message}
                  onChange={e => setContactData({...contactData, message: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 focus:border-primary-fixed focus:outline-none transition-colors resize-none"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`btn-primary w-full py-4 md:py-5 text-base md:text-lg transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? '전송 중...' : isSubmitted ? '전송 완료!' : '문의하기 신청'}
              </button>
              {isSubmitted && (
                <p className="text-center text-primary-fixed text-sm font-bold animate-pulse">문의가 성공적으로 전달되었습니다!</p>
              )}
            </motion.form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#080808] border-t border-white/5 py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center sm:text-left">
          <div className="space-y-6">
            <div className="text-2xl md:text-3xl font-display font-black tracking-tighter">G.<span className="text-primary-fixed">web</span></div>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs mx-auto sm:mx-0">
              © 2024 G.web. <br />Elevating digital presence for innovators across the globe.
            </p>
          </div>
          <div>
            <h5 className="font-label text-xs uppercase tracking-widest mb-6 text-primary-fixed font-bold">Contact</h5>
            <ul className="space-y-4 text-on-surface-variant text-sm">
              <li>Seoul, Gangnam-gu</li>
              <li>010-3264-1867</li>
              <li>monet0424@gmail.com</li>
            </ul>
          </div>
          <div>
            <h5 className="font-label text-xs uppercase tracking-widest mb-6 text-primary-fixed font-bold">Links</h5>
            <ul className="space-y-4 text-on-surface-variant text-sm">
              <li><a href="#" className="hover:text-primary-fixed transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-fixed transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-label text-xs uppercase tracking-widest mb-6 text-primary-fixed font-bold">Social</h5>
            <div className="flex gap-4 justify-center sm:justify-start">
              {[MessageCircle, Instagram, LinkIcon].map((Icon, idx) => (
                <a 
                  key={idx} 
                  href="#" 
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary-fixed hover:text-black transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating CTA */}
      <motion.a
        href="https://open.kakao.com/o/sbHSLu3h"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-[#FEE500] rounded-full flex items-center justify-center shadow-2xl z-40 overflow-hidden group"
      >
        <MessageCircle size={28} color="#3A1D1D" fill="#3A1D1D" className="md:w-8 md:h-8" />
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
      </motion.a>

      {/* Admin Panel Overlay */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel onClose={() => setIsAdminOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
