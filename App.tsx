import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Member, FixedCosts, CalculationResult, CalculatedMember, UserRole } from './types';
import { DEFAULT_MEMBERS, DEFAULT_FIXED_COSTS, DEFAULT_ADMIN_PHOTO, ADMIN_PASSWORD, VALID_PINS } from './constants';
import { MemberRow } from './components/MemberRow';
import { ReportTemplate } from './components/ReportTemplate';
import { IndividualCard } from './components/IndividualCard';

const STORAGE_KEY_MEMBERS = 'mess_manager_members';
const STORAGE_KEY_COSTS = 'mess_manager_costs';
const STORAGE_KEY_ADMIN_PHOTO = 'mess_manager_admin_photo';

const App: React.FC = () => {
  // --- Auth State ---
  const [role, setRole] = useState<UserRole>('viewer');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // --- Admin/Manager Action State ---
  const [showAssignManagerModal, setShowAssignManagerModal] = useState(false);
  const [generatedPins, setGeneratedPins] = useState<string[]>([]);
  const [selectedMemberIdForManager, setSelectedMemberIdForManager] = useState<string>("");

  // --- View State ---
  const [showReceiptWidget, setShowReceiptWidget] = useState(false);

  // --- Toast State ---
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // --- App Data State ---
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);
  const [fixedCosts, setFixedCosts] = useState<FixedCosts>(DEFAULT_FIXED_COSTS);
  
  const [adminPhoto, setAdminPhoto] = useState<string>(DEFAULT_ADMIN_PHOTO);
  const [signature, setSignature] = useState<string>("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  
  // For individual PDF generation
  const [tempMemberForPdf, setTempMemberForPdf] = useState<CalculatedMember | null>(null);
  
  // --- Refs ---
  const reportRef = useRef<HTMLDivElement>(null);
  const individualCardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // For Restore Data

  // --- Persist Data Logic ---
  useEffect(() => {
    const storedMembers = localStorage.getItem(STORAGE_KEY_MEMBERS);
    const storedCosts = localStorage.getItem(STORAGE_KEY_COSTS);
    const storedAdminPhoto = localStorage.getItem(STORAGE_KEY_ADMIN_PHOTO);

    if (storedMembers) setMembers(JSON.parse(storedMembers));
    if (storedCosts) setFixedCosts(JSON.parse(storedCosts));
    if (storedAdminPhoto) setAdminPhoto(storedAdminPhoto);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
    localStorage.setItem(STORAGE_KEY_COSTS, JSON.stringify(fixedCosts));
    localStorage.setItem(STORAGE_KEY_ADMIN_PHOTO, adminPhoto);
  }, [members, fixedCosts, adminPhoto]);

  // --- Toast Helper ---
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Auth Handlers ---
  const handleLogin = () => {
    if (loginInput === ADMIN_PASSWORD) {
      setRole('admin');
      setShowLoginModal(false);
      setLoginInput("");
      setLoginError("");
      showToast("Admin Login Successful!");
    } else if (VALID_PINS.includes(loginInput)) {
      setRole('manager');
      setShowLoginModal(false);
      setLoginInput("");
      setLoginError("");
      showToast("Manager Login Successful!");
    } else {
      setLoginError("Invalid Password or PIN");
    }
  };

  const handleLogout = () => {
    setRole('viewer');
    setCalculationResult(null); // Clear result on logout to force re-calculation check
    setShowReceiptWidget(false);
    showToast("Logged Out Successfully");
  };

  const isReadOnly = role === 'viewer';
  const isAdmin = role === 'admin';

  // --- Handlers: File Uploads ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (!isReadOnly && e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setter(ev.target.result as string);
          if (setter === setReceiptImage as any && isAdmin) {
            setShowReceiptWidget(true); // Auto open widget on upload for admin
          }
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAdminPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAdmin && e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setAdminPhoto(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // --- Handlers: Member Management ---
  const updateMember = (id: string, field: keyof Member, value: any) => {
    if (isReadOnly) return;
    setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addMember = () => {
    if (isReadOnly) return;
    const newMember: Member = {
      id: Date.now().toString(),
      name: "",
      phone: "",
      meal: 0,
      deposit: 0,
      isManager: false,
      photo: ""
    };
    setMembers([...members, newMember]);
  };

  const removeMember = (id: string) => {
    if (isReadOnly) return;
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleMemberImageUpload = (id: string, file: File) => {
    if (isReadOnly) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        updateMember(id, 'photo', ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Handlers: Manager Assignment (Admin Only) ---
  const openAssignManagerModal = () => {
    setShowAssignManagerModal(true);
    setGeneratedPins([]);
    // Default select current manager if exists, else first member
    const currentMgr = members.find(m => m.isManager);
    setSelectedMemberIdForManager(currentMgr ? currentMgr.id : (members[0]?.id || ""));
  };

  const executeAssignManager = () => {
    if (!selectedMemberIdForManager) return;

    // Reset all managers first
    const updatedMembers = members.map(m => ({
      ...m,
      isManager: m.id === selectedMemberIdForManager
    }));
    setMembers(updatedMembers);

    // Generate 2 random PINs
    const pins = [];
    const available = [...VALID_PINS];
    for(let i=0; i<2; i++) {
       const idx = Math.floor(Math.random() * available.length);
       pins.push(available[idx]);
       available.splice(idx, 1);
    }
    setGeneratedPins(pins);
    showToast("Manager Assigned! Please save the PINs.");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("PIN Copied to Clipboard!", 'success');
  };

  // --- Handlers: Fixed Costs ---
  const updateFixedCost = (field: keyof FixedCosts, value: number) => {
    if (isReadOnly) return;
    setFixedCosts(prev => ({ ...prev, [field]: value }));
  };

  // --- Backup & Restore ---
  const handleBackup = () => {
    const data = {
      members,
      fixedCosts,
      adminPhoto,
      backupDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mess_Backup_${new Date().toLocaleDateString('bn-BD').replace(/\//g,'-')}.json`;
    link.click();
  };

  const handleRestoreClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json.members && json.fixedCosts) {
          if (window.confirm("Are you sure you want to restore data? Current unsaved data will be lost.")) {
            setMembers(json.members);
            setFixedCosts(json.fixedCosts);
            if (json.adminPhoto) setAdminPhoto(json.adminPhoto);
            alert("Data restored successfully!");
          }
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Error parsing backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  // --- Logic: Calculation ---
  const calculate = () => {
    const totalFixed = 
      fixedCosts.rent + 
      fixedCosts.maid + 
      fixedCosts.gas + 
      fixedCosts.wifi + 
      fixedCosts.masala + 
      fixedCosts.utility;

    const activeMembers = members.filter(m => m.name.trim() !== "");
    if (activeMembers.length === 0) {
      alert("Please add at least one member with a name.");
      return;
    }

    const totalMeals = activeMembers.reduce((sum, m) => sum + m.meal, 0);
    const totalDeposit = activeMembers.reduce((sum, m) => sum + m.deposit, 0);
    
    // Avoid division by zero
    const mealRate = totalMeals > 0 ? fixedCosts.totalMealCost / totalMeals : 0;
    const fixedPerMember = totalFixed / activeMembers.length;

    let totalMealCostCalc = 0;
    let grandTotalCostCalc = 0;
    let managerName = "Not Selected";

    const calculatedMembers: CalculatedMember[] = activeMembers.map(m => {
      if (m.isManager) managerName = m.name;

      const mealCost = m.meal * mealRate;
      const totalCost = mealCost + fixedPerMember;
      const balance = m.deposit - totalCost;

      totalMealCostCalc += mealCost;
      grandTotalCostCalc += totalCost;

      return {
        ...m,
        mealCost,
        fixedCostShare: fixedPerMember,
        totalCost,
        balance
      };
    });

    setCalculationResult({
      members: calculatedMembers,
      stats: {
        totalMeals,
        totalMealCost: totalMealCostCalc,
        totalFixedCost: totalFixed,
        grandTotalCost: grandTotalCostCalc,
        totalDeposit,
        mealRate,
        fixedPerMember,
        managerName
      },
      generatedAt: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
    });

    // Scroll to report
    setTimeout(() => {
      document.getElementById('report-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // --- PDF Generation Logic ---
  const downloadFullPDF = async () => {
    if (!reportRef.current) return;
    
    const element = reportRef.current;
    const noPrintElements = document.querySelectorAll('.no-print');
    noPrintElements.forEach(el => (el as HTMLElement).style.display = 'none');

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const a4WidthMm = 210;
      const a4HeightMm = 297;
      const contentHeightMm = (canvas.height * a4WidthMm) / canvas.width;
      
      let pdf;
      if (contentHeightMm <= a4HeightMm) {
        pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'JPEG', 0, 0, a4WidthMm, contentHeightMm);
      } else {
        pdf = new jsPDF('p', 'mm', [a4WidthMm, contentHeightMm]);
        pdf.addImage(imgData, 'JPEG', 0, 0, a4WidthMm, contentHeightMm);
      }
      pdf.save('Mess_Report.pdf');
    } catch (err) {
      console.error(err);
      alert("Error generating PDF");
    } finally {
      noPrintElements.forEach(el => (el as HTMLElement).style.display = '');
    }
  };

  const downloadImage = async () => {
    if (!reportRef.current) return;
    const noPrintElements = document.querySelectorAll('.no-print');
    noPrintElements.forEach(el => (el as HTMLElement).style.display = 'none');
    
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const link = document.createElement('a');
      link.download = 'Mess_Report.jpg';
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    } finally {
      noPrintElements.forEach(el => (el as HTMLElement).style.display = '');
    }
  };

  const handleIndividualDownload = (member: CalculatedMember) => {
    setTempMemberForPdf(member);
  };

  // Individual PDF Generator Hook
  useEffect(() => {
    if (tempMemberForPdf && individualCardRef.current && calculationResult) {
      const generateIndivPdf = async () => {
        try {
            await new Promise(r => setTimeout(r, 200));
            const element = individualCardRef.current!;
            // High scale for clarity
            const canvas = await html2canvas(element, { 
                scale: 2, 
                useCORS: true, 
                backgroundColor: "#ffffff",
                windowWidth: 1000 
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            // Logic to Fit to Page
            if (imgHeight <= pdfHeight) {
                // If fits comfortably, just add
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
            } else {
                // If taller than A4, scale down to fit height
                const scale = pdfHeight / imgHeight;
                const scaledWidth = pdfWidth * scale;
                const xOffset = (pdfWidth - scaledWidth) / 2;
                pdf.addImage(imgData, 'JPEG', xOffset, 0, scaledWidth, pdfHeight);
            }
            
            pdf.save(`Mess_Report_${tempMemberForPdf.name}.pdf`);
        } catch (e) {
            console.error(e);
        } finally {
            setTempMemberForPdf(null);
        }
      };
      generateIndivPdf();
    }
  }, [tempMemberForPdf, calculationResult]);


  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-[200] px-6 py-3 rounded-full shadow-2xl font-bold text-white animate-fade-in-up flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
           <i className={`fas ${toast.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
           {toast.msg}
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm transform transition-all scale-100">
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Login Required</h2>
            <p className="text-sm text-center text-slate-500 mb-6">Enter Admin Password or Manager PIN</p>
            <input 
              type="password" 
              autoFocus
              className="w-full text-center text-2xl tracking-widest p-3 border-2 border-slate-200 rounded-lg focus:border-primary focus:outline-none mb-4"
              placeholder="****"
              value={loginInput}
              onChange={(e) => {
                setLoginInput(e.target.value);
                setLoginError("");
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            {loginError && <div className="text-red-500 text-sm text-center mb-4 font-semibold">{loginError}</div>}
            <div className="flex gap-2">
              <button onClick={() => setShowLoginModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleLogin} className="flex-1 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-blue-800">Login</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Manager Modal (Admin Only) */}
      {showAssignManagerModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-800 mb-1"><i className="fas fa-user-shield text-primary mr-2"></i> Assign Manager</h2>
            <p className="text-xs text-slate-500 mb-4">Select a member to give edit access.</p>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 mb-1">Select Member</label>
              <select 
                value={selectedMemberIdForManager}
                onChange={(e) => {
                  setSelectedMemberIdForManager(e.target.value);
                  setGeneratedPins([]); // Reset pins when member changes
                }}
                className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50 focus:border-primary focus:outline-none"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name || "Unnamed Member"}</option>
                ))}
              </select>
            </div>

            {generatedPins.length === 0 ? (
               <button 
                onClick={executeAssignManager} 
                className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-blue-800 transition-colors"
               >
                 Assign & Generate PINs
               </button>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                 <p className="text-center text-sm font-semibold text-emerald-600 mb-3"><i className="fas fa-check-circle"></i> Manager Assigned Successfully!</p>
                 <p className="text-center text-xs text-slate-500 mb-3">Share one of these PINs with the manager:</p>
                 <div className="flex gap-3 justify-center">
                    {generatedPins.map(pin => (
                      <div key={pin} className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-300 rounded shadow-sm">
                        <span className="font-mono text-lg font-bold text-slate-800 tracking-wider">{pin}</span>
                        <button onClick={() => copyToClipboard(pin)} className="text-slate-400 hover:text-primary" title="Copy PIN">
                          <i className="fas fa-copy"></i>
                        </button>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            <div className="mt-4 text-right">
              <button onClick={() => setShowAssignManagerModal(false)} className="text-slate-500 font-bold hover:text-slate-800 text-sm px-4">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white px-6 py-3 flex justify-between items-center border-b border-gray-200 shadow-sm z-50 flex-shrink-0">
        <div className="text-xl font-extrabold text-primary flex items-center gap-2">
          <span>Mess Manager</span> <span className="text-slate-400 font-light">Pro</span>
          {role !== 'viewer' && (
             <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold ml-2 ${role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
               {role} Mode
             </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {role === 'viewer' ? (
            <button 
              onClick={() => setShowLoginModal(true)} 
              className="bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-md text-sm font-bold shadow transition-all"
            >
              <i className="fas fa-lock mr-2"></i> Login to Edit
            </button>
          ) : (
            <>
               <div className="flex gap-2 mr-2">
                  <button onClick={handleBackup} className="text-slate-500 hover:text-primary p-2 transition-colors" title="Backup Data (JSON)">
                    <i className="fas fa-download"></i>
                  </button>
                  {isAdmin && (
                    <>
                      <button onClick={handleRestoreClick} className="text-slate-500 hover:text-red-600 p-2 transition-colors" title="Restore Data (JSON)">
                        <i className="fas fa-upload"></i>
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleRestoreFile} />
                    </>
                  )}
               </div>

               {isAdmin && (
                 <button 
                    onClick={openAssignManagerModal}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-md text-xs font-bold shadow-sm flex items-center gap-2 transition-colors"
                 >
                    <i className="fas fa-user-shield"></i> Assign Manager
                 </button>
               )}

               {isAdmin && (
                  <label className="bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-2 rounded-md text-xs cursor-pointer flex items-center gap-2 transition-colors shadow-sm">
                    <i className="fas fa-user-tie"></i> Admin Photo
                    <input type="file" accept="image/*" onChange={handleAdminPhotoUpload} className="hidden" />
                  </label>
               )}
               {/* Admin can upload receipt here, view it via floating widget */}
               {isAdmin && (
                  <label className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-md text-xs cursor-pointer flex items-center gap-2 transition-colors shadow-sm">
                    <i className="fas fa-cloud-upload-alt"></i> Khata Upload
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setReceiptImage as any)} className="hidden" />
                  </label>
               )}
               <button 
                onClick={handleLogout} 
                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md text-xs font-bold border border-red-200 ml-2"
               >
                 Logout
               </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-6xl mx-auto">
          
          {/* Main Input Panel */}
          <div className={`bg-slate-100 rounded-xl overflow-hidden ${isReadOnly ? 'opacity-100' : ''}`}>
            
            {/* Card: Fixed Costs */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-5">
                <div className="font-bold text-slate-800 flex items-center gap-2 text-lg"><i className="fas fa-home text-primary"></i> ফিক্সড খরচ বিবরণী</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'বাসা ভাড়া', key: 'rent' },
                  { label: 'খালা বিল', key: 'maid' },
                  { label: 'গ্যাস বিল', key: 'gas' },
                  { label: 'ওয়াই ফাই', key: 'wifi' },
                  { label: 'মশলা', key: 'masala' },
                  { label: 'অন্যান্য', key: 'utility' }
                ].map((item) => (
                  <div key={item.key} className="flex flex-col">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{item.label}</label>
                    <input 
                      type="number" 
                      value={fixedCosts[item.key as keyof FixedCosts]}
                      onChange={(e) => updateFixedCost(item.key as keyof FixedCosts, parseFloat(e.target.value) || 0)}
                      disabled={isReadOnly}
                      className="p-2.5 border border-gray-200 bg-slate-50 text-gray-900 rounded-lg text-sm font-semibold focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                ))}
                <div className="flex flex-col col-span-2 lg:col-span-2">
                   <label className="text-xs font-bold text-primary uppercase tracking-wide mb-1.5">মোট মিল খরচ</label>
                   <input 
                      type="number" 
                      value={fixedCosts.totalMealCost}
                      onChange={(e) => updateFixedCost('totalMealCost', parseFloat(e.target.value) || 0)}
                      disabled={isReadOnly}
                      className="p-2.5 border border-blue-200 bg-blue-50 text-primary font-bold rounded-lg text-sm focus:outline-none disabled:opacity-75"
                    />
                </div>
              </div>
            </div>

            {/* Card: Members */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200 relative">
              {isReadOnly && (
                <div className="absolute top-4 right-4 z-10">
                   <span className="bg-slate-100 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-200 font-bold uppercase tracking-wider">Read Only</span>
                </div>
              )}

              <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-5">
                <div className="font-bold text-slate-800 flex items-center gap-2 text-lg"><i className="fas fa-users text-primary"></i> সদস্য তালিকা</div>
                <span className="text-xs bg-blue-50 text-primary px-3 py-1 rounded-full font-bold">মোট: {members.length}</span>
              </div>

              <div className="grid grid-cols-[25px_35px_1.5fr_1fr_0.8fr_0.8fr_25px_30px] gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center mb-3 px-2">
                <span>#</span><span>ছবি</span><span className="text-left pl-1">নাম</span><span>মোবাইল</span><span>মিল</span><span>জমা</span><i className="fas fa-crown"></i><span></span>
              </div>

              <div className="space-y-2">
                {members.map((member, index) => (
                  <MemberRow 
                    key={member.id} 
                    member={member} 
                    index={index} 
                    isReadOnly={isReadOnly}
                    isAdmin={isAdmin}
                    onUpdate={updateMember}
                    onRemove={removeMember}
                    onImageUpload={handleMemberImageUpload}
                  />
                ))}
              </div>

              {!isReadOnly && (
                <button 
                  onClick={addMember}
                  className="w-full mt-5 py-3 border border-dashed border-slate-300 rounded-lg text-slate-500 font-semibold hover:bg-slate-50 hover:text-primary hover:border-primary transition-all flex justify-center items-center gap-2 text-sm"
                >
                  <i className="fas fa-plus"></i> নতুন সদস্য যোগ করুন
                </button>
              )}

              {!isReadOnly && (
                <div className="mt-8 pt-6 border-t border-dashed border-slate-200 flex items-center gap-4 bg-slate-50 p-4 rounded-lg">
                  <label className="text-sm font-bold text-slate-700">ম্যানেজারের সিগনেচার আপলোড:</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                    onChange={(e) => handleFileUpload(e, setSignature as any)}
                  />
                </div>
              )}

              <button 
                onClick={calculate}
                className="w-full mt-6 py-4 bg-gradient-to-r from-primary to-blue-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex justify-center items-center gap-2 text-base"
              >
                <i className="fas fa-wand-magic-sparkles"></i> রিপোর্ট তৈরি করুন
              </button>
            </div>

            {/* Report Section */}
            <div id="report-section" className={calculationResult ? 'block animate-fade-in' : 'hidden'}>
              <ReportTemplate 
                ref={reportRef} 
                result={calculationResult} 
                adminPhoto={adminPhoto} 
                signature={signature}
                fixedCosts={fixedCosts}
                onIndividualDownload={handleIndividualDownload}
              />

              {/* Download Buttons */}
              <div className="flex justify-center gap-5 mt-10 pb-16">
                 <button 
                  onClick={downloadFullPDF}
                  className="bg-slate-800 hover:bg-black text-white px-8 py-3 rounded-full font-bold shadow-xl transition-all flex items-center gap-3 transform hover:-translate-y-1"
                 >
                   <i className="fas fa-file-pdf text-lg"></i> Save Full PDF
                 </button>
                 <button 
                  onClick={downloadImage}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold shadow-xl transition-all flex items-center gap-3 transform hover:-translate-y-1"
                 >
                   <i className="fas fa-image text-lg"></i> Save Image
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Floating Receipt Widget - Bottom Right */}
      {isAdmin && receiptImage && (
        <>
          {/* Minimized Trigger */}
          {!showReceiptWidget && (
             <button 
               onClick={() => setShowReceiptWidget(true)}
               className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white w-14 h-14 rounded-full shadow-2xl hover:bg-black transition-all hover:scale-110 flex items-center justify-center animate-bounce"
               title="View Khata (Receipt)"
             >
               <i className="fas fa-receipt text-xl"></i>
             </button>
          )}

          {/* Maximized Panel */}
          {showReceiptWidget && (
            <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-300 overflow-hidden flex flex-col animate-fade-in-up">
              <div 
                className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center cursor-pointer select-none"
                onClick={() => setShowReceiptWidget(false)}
              >
                <span className="font-bold text-sm flex items-center gap-2">
                  <i className="fas fa-receipt text-amber-500"></i> খাতা (Receipt)
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowReceiptWidget(false); }} 
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <i className="fas fa-chevron-down"></i>
                </button>
              </div>
              <div className="p-0 bg-slate-100 max-h-[500px] overflow-auto">
                 <img src={receiptImage} alt="Receipt" className="w-full h-auto block" />
              </div>
            </div>
          )}
        </>
      )}

      {/* Hidden Individual Card for PDF Generation */}
      <IndividualCard 
        ref={individualCardRef}
        member={tempMemberForPdf}
        result={calculationResult}
        adminPhoto={adminPhoto}
        signature={signature}
        fixedCosts={fixedCosts}
      />

    </div>
  );
};

export default App;