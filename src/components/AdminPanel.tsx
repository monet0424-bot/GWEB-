import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  getDoc,
  orderBy
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { 
  Plus, 
  Trash2, 
  X, 
  LogOut, 
  LayoutDashboard, 
  Save, 
  Edit2,
  Lock,
  UserPlus,
  Mail as MailIcon,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { setDoc } from 'firebase/firestore';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  img: string;
  link: string;
  order: number;
}

interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  message: string;
  createdAt: any;
}

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const adminEmail = "monet0424@gmail.com";
  const [activeTab, setActiveTab] = useState<'portfolio' | 'contacts'>('portfolio');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    img: '',
    link: '',
    order: 0
  });
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeletingProcess] = useState(false);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://images.unsplash.com/photo-1560171963-70d103725036?q=80&w=256&auto=format&fit=crop";
    e.currentTarget.onerror = null;
  };

  const checkAdminStatus = async (uid: string) => {
    try {
      const adminDoc = await getDoc(doc(db, 'admins', uid));
      setIsAdmin(adminDoc.exists());
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await checkAdminStatus(user.uid);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleBootstrap = async () => {
    if (!user || user.email !== adminEmail) return;
    setIsBootstrapping(true);
    try {
      await setDoc(doc(db, 'admins', user.uid), {
        email: user.email,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
      await checkAdminStatus(user.uid);
    } catch (error) {
       console.error("Bootstrap error:", error);
       alert("관리자 등록에 실패했습니다. (Permission Denied)");
    } finally {
      setIsBootstrapping(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, 'portfolio'), orderBy('order', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const portfolioItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PortfolioItem[];
        setItems(portfolioItems);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'portfolio');
      });

      const qContacts = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
      const unsubscribeContacts = onSnapshot(qContacts, (snapshot) => {
        const contactItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ContactInquiry[];
        setContacts(contactItems);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'contacts');
      });

      return () => {
        unsubscribe();
        unsubscribeContacts();
      };
    }
  }, [isAdmin]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      if (isEditing) {
        await updateDoc(doc(db, 'portfolio', isEditing), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        setIsEditing(null);
      } else {
        await addDoc(collection(db, 'portfolio'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setFormData({ title: '', category: '', img: '', link: '', order: items.length + 1 });
    } catch (error) {
      handleFirestoreError(error, isEditing ? OperationType.UPDATE : OperationType.CREATE, `portfolio/${isEditing || ''}`);
    }
  };

  const handleDelete = async (id: string, type: 'portfolio' | 'contacts' = 'portfolio') => {
    setIsDeletingProcess(true);
    try {
      await deleteDoc(doc(db, type, id));
      setDeletingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${type}/${id}`);
    } finally {
      setIsDeletingProcess(false);
    }
  };

  if (loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full max-w-4xl bg-surface p-4 md:p-8 rounded-[24px] md:rounded-[40px] border border-white/10 shadow-2xl overflow-hidden relative max-h-[95vh] md:max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full hover:bg-white/10 transition-colors z-20 bg-black/20"
        >
          <X size={20} className="md:w-6 md:h-6" />
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8 mt-2 md:mt-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-fixed/20 rounded-xl md:rounded-2xl flex items-center justify-center text-primary-fixed">
              <LayoutDashboard size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-black text-white">Admin Management</h2>
              <p className="text-on-surface-variant text-[10px] md:text-sm">포트폴리오 및 문의 내역을 관리합니다.</p>
            </div>
          </div>
          {isAdmin && activeTab === 'portfolio' && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="w-full md:w-auto px-6 py-2.5 md:py-3 bg-primary-fixed text-black text-sm md:text-base font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-all"
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? '닫기' : '새 항목 추가'}
            </button>
          )}
        </div>

        {isAdmin && (
          <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
            <button 
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'portfolio' ? 'bg-primary-fixed text-black' : 'hover:bg-white/5 text-on-surface-variant'}`}
            >
              <Edit2 size={16} />
              Portfolio
            </button>
            <button 
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'contacts' ? 'bg-primary-fixed text-black' : 'hover:bg-white/5 text-on-surface-variant'}`}
            >
              <MailIcon size={16} />
              Inquiries
              {contacts.length > 0 && <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{contacts.length}</span>}
            </button>
          </div>
        )}

        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <Lock size={48} className="text-on-surface-variant/50" />
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Login Required</h3>
              <p className="text-on-surface-variant">관리자 권한이 필요합니다.</p>
            </div>
            <button 
              onClick={handleLogin}
              className="btn-primary px-8 py-3"
            >
              Sign in with Google
            </button>
          </div>
        ) : !isAdmin ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
             <div className="text-red-400 font-bold">접근 권한이 없습니다.</div>
             <p className="text-on-surface-variant mb-4">{user.email}</p>
             
             {user.email === adminEmail && (
               <button 
                 onClick={handleBootstrap}
                 disabled={isBootstrapping}
                 className="flex items-center gap-2 px-6 py-3 bg-primary-fixed/20 text-primary-fixed rounded-xl border border-primary-fixed/30 hover:bg-primary-fixed hover:text-black transition-all mb-4"
               >
                 <UserPlus size={18} />
                 {isBootstrapping ? '보안 설정 중...' : '관리자로 등록하기'}
               </button>
             )}

             <button onClick={handleLogout} className="text-sm text-on-surface-variant hover:text-white transition-colors">Logout</button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-10 pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {activeTab === 'portfolio' ? (
              <>
                {/* Form */}
                <AnimatePresence>
                  {(showForm || isEditing) && (
                    <motion.form 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      onSubmit={handleSubmit} 
                      className="glass-card p-4 md:p-8 rounded-2xl md:rounded-3xl border border-primary-fixed/20 space-y-4 md:space-y-6 overflow-hidden bg-primary-fixed/5"
                    >
                      <h3 className="font-display font-bold text-base md:text-lg flex items-center gap-2">
                        {isEditing ? <Edit2 size={16} /> : <Plus size={16} />}
                        {isEditing ? '게시물 수정' : '새 게시물 등록'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1 md:space-y-2">
                          <label className="text-[10px] md:text-xs text-on-surface-variant ml-1 font-bold">제목</label>
                          <input 
                            type="text" 
                            placeholder="예: SaaS 플랫폼"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:border-primary-fixed"
                            required
                          />
                        </div>
                        <div className="space-y-1 md:space-y-2">
                          <label className="text-[10px] md:text-xs text-on-surface-variant ml-1 font-bold">카테고리</label>
                          <input 
                            type="text" 
                            placeholder="예: IT / 스타트업"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:border-primary-fixed"
                            required
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1 md:space-y-2">
                          <label className="text-[10px] md:text-xs text-on-surface-variant ml-1 font-bold">이미지 주소 (URL)</label>
                          <input 
                            type="url" 
                            placeholder="https://..."
                            value={formData.img}
                            onChange={e => setFormData({...formData, img: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:border-primary-fixed"
                            required
                          />
                          <p className="text-[9px] md:text-[10px] text-on-surface-variant mt-1 ml-1 italic">
                            * 마우스 우클릭 후 '이미지 주소 복사'로 가져온 주소를 넣어주세요.
                          </p>
                        </div>
                        <div className="md:col-span-2 space-y-1 md:space-y-2">
                          <label className="text-[10px] md:text-xs text-on-surface-variant ml-1 font-bold">연결 링크 (URL)</label>
                          <input 
                            type="url" 
                            placeholder="https://..."
                            value={formData.link}
                            onChange={e => setFormData({...formData, link: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:border-primary-fixed"
                          />
                          <p className="text-[9px] md:text-[10px] text-on-surface-variant mt-1 ml-1 italic">
                            * 이미지 클릭 시 이동할 웹사이트 주소를 입력하세요. (필수 아님)
                          </p>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                          <label className="text-[10px] md:text-xs text-on-surface-variant ml-1 font-bold">정렬 순서</label>
                          <input 
                            type="number" 
                            placeholder="0"
                            value={formData.order}
                            onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:border-primary-fixed"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 md:gap-4 pt-2">
                        <button type="submit" className="btn-primary flex-1 py-2.5 md:py-3 flex items-center justify-center gap-2 text-sm md:text-base">
                          <Save size={16} />
                          {isEditing ? '수정 완료' : '등록하기'}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                              setIsEditing(null);
                              setShowForm(false);
                              setFormData({ title: '', category: '', img: '', link: '', order: 0 });
                          }}
                          className="px-4 md:px-6 py-2.5 md:py-3 border border-white/10 rounded-xl hover:bg-white/5 text-sm md:text-base"
                        >
                          취소
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* List */}
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-lg md:text-xl">Portfolio List</h3>
                      <span className="text-[10px] md:text-xs text-on-surface-variant font-bold">{items.length} items</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center gap-3 md:gap-6 p-3 md:p-5 glass-card rounded-2xl md:rounded-3xl border border-white/5 group hover:border-primary-fixed/30 transition-all">
                          <div className="w-16 h-16 md:w-24 md:h-24 rounded-lg md:rounded-2xl overflow-hidden flex-shrink-0 bg-white/5">
                            <img 
                              src={item.img} 
                              referrerPolicy="no-referrer"
                              onError={handleImageError}
                              className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-110" 
                              alt={item.title} 
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-[8px] md:text-[10px] text-primary-fixed font-bold mb-0.5 md:mb-1 uppercase tracking-widest">{item.category}</div>
                            <div className="font-bold text-white text-sm md:text-lg leading-tight">{item.title}</div>
                            <div className="text-[8px] md:text-[10px] text-on-surface-variant mt-1.5 font-bold">Order: {item.order}</div>
                          </div>
                          <div className="flex gap-1.5 md:gap-2">
                            <AnimatePresence mode="wait">
                              {deletingId === item.id ? (
                                <motion.div 
                                  key="confirm"
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  className="flex gap-2 items-center"
                                >
                                  <button 
                                    onClick={() => handleDelete(item.id, 'portfolio')}
                                    disabled={isDeleting}
                                    className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
                                  >
                                    {isDeleting ? '삭제 중...' : '확인'}
                                  </button>
                                  <button 
                                    onClick={() => setDeletingId(null)}
                                    className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20 transition-colors"
                                  >
                                    취소
                                  </button>
                                </motion.div>
                              ) : (
                                <motion.div 
                                  key="actions"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex gap-2"
                                >
                                  <button 
                                    onClick={() => {
                                      setIsEditing(item.id);
                                      setShowForm(false);
                                      setFormData({ 
                                        title: item.title, 
                                        category: item.category, 
                                        img: item.img, 
                                        link: item.link || '',
                                        order: item.order 
                                      });
                                      const container = document.querySelector('.overflow-y-auto');
                                      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl hover:text-primary-fixed hover:bg-primary-fixed/10 transition-all"
                                  >
                                    <Edit2 size={16} className="md:w-5 md:h-5" />
                                  </button>
                                  <button 
                                    onClick={() => setDeletingId(item.id)}
                                    className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl hover:text-red-400 hover:bg-red-400/10 transition-all"
                                  >
                                    <Trash2 size={16} className="md:w-5 md:h-5" />
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg md:text-xl">Contact Inquiries</h3>
                  <span className="text-[10px] md:text-xs text-on-surface-variant font-bold">{contacts.length} inquiries</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {contacts.map(contact => (
                    <div key={contact.id} className="p-5 md:p-8 glass-card rounded-3xl border border-white/5 hover:border-primary-fixed/30 transition-all space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-primary-fixed/10 rounded-2xl flex items-center justify-center text-primary-fixed flex-shrink-0">
                            <MessageSquare size={20} />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-white">{contact.name}</div>
                            <div className="text-xs text-on-surface-variant font-medium mt-1">
                              {contact.createdAt?.toDate?.() ? new Date(contact.createdAt.toDate()).toLocaleString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                        <AnimatePresence mode="wait">
                          {deletingId === contact.id ? (
                            <motion.div 
                              key="confirm"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="flex gap-2 items-center"
                            >
                              <button 
                                onClick={() => handleDelete(contact.id, 'contacts')}
                                disabled={isDeleting}
                                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold hover:bg-red-600 transition-colors"
                              >
                                {isDeleting ? '삭제 중...' : '확인'}
                              </button>
                              <button 
                                onClick={() => setDeletingId(null)}
                                className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-[10px] font-bold hover:bg-white/20 transition-colors"
                              >
                                취소
                              </button>
                            </motion.div>
                          ) : (
                            <button 
                              onClick={() => setDeletingId(contact.id)}
                              className="p-2 bg-white/5 rounded-xl hover:text-red-400 hover:bg-red-400/10 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-white/5">
                        <div className="space-y-1">
                          <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">연락처</div>
                          <div className="text-sm font-medium text-white">{contact.phone}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">이메일</div>
                          <div className="text-sm font-medium text-white">{contact.email}</div>
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">홈페이지 유형</div>
                          <div className="text-sm font-bold text-primary-fixed">{contact.type}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">문의 내용</div>
                        <p className="text-sm text-on-surface-variant leading-relaxed bg-white/5 p-4 rounded-xl">
                          {contact.message}
                        </p>
                      </div>
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                      <MailIcon size={40} className="mx-auto text-on-surface-variant/30 mb-4" />
                      <div className="text-on-surface-variant font-medium">아직 접수된 문의가 없습니다.</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            {user && (
              <div className="flex items-center gap-3">
                <img src={user.photoURL} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                <span className="text-xs text-on-surface-variant">{user.email}</span>
              </div>
            )}
            {user && (
              <button 
                onClick={handleLogout}
                className="text-xs font-bold text-red-400 flex items-center gap-2 hover:underline"
              >
                <LogOut size={14} />
                Logout
              </button>
            )}
        </div>
      </div>
    </motion.div>
  );
}
