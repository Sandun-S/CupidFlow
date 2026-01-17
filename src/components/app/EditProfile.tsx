import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { logAction } from '../../lib/audit';
import NICUploader from '../verification/NICUploader';
import { ArrowLeft, Camera, User, Heart, Coffee, Users, BookOpen, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DISTRICTS } from '../../lib/constants';

const SECTIONS = [
    { id: 'basic', label: 'Basic', icon: User },
    { id: 'personal', label: 'Personal', icon: BookOpen },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'habits', label: 'Lifestyle', icon: Coffee },
    { id: 'interests', label: 'Interests', icon: Heart },
];

const FAMILY_PROFESSIONS = [
    "Government Officer", "School Teacher", "Doctor", "Engineer", "Businessman",
    "Retired", "Housewife", "Private Sector Employee", "Self-Employed",
    "Farmer", "Military/Police", "Nurse", "Accountant", "Lawyer", "Deceased", "Other"
];

const INTERESTS_LIST = [
    "Photography", "Traveling", "Cooking", "Music", "Movies", "Reading",
    "Gaming", "Hiking", "Cycling", "Swimming", "Dancing", "Singing",
    "Art & Design", "Technology", "Fashion", "Pets", "Volunteering",
    "Yoga", "Gym/Fitness", "Foodie", "Cricket", "Rugby"
];

export default function EditProfile() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('basic');

    // Sibling Builder State
    const [siblingGender, setSiblingGender] = useState('Brother');
    const [siblingStatus, setSiblingStatus] = useState('Student');
    const [siblingOrder, setSiblingOrder] = useState('Elder');
    const [siblingsList, setSiblingsList] = useState<{ gender: string, status: string, order: string }[]>([]);

    const [formData, setFormData] = useState({
        displayName: '',
        about: '',
        profession: '',
        university: '',
        photos: [] as string[],

        // Basic / Onboarding
        gender: '',
        birthDate: '',
        civilStatus: '',

        // Personal
        height: '',
        education: '',
        religion: '',
        ethnicity: '',
        location: { city: '', district: '', address: '' },

        // Family
        family: {
            fatherProfession: '',
            motherProfession: '',
            siblings: ''
        },

        // Habits
        habits: {
            drinking: '',
            smoking: '',
            food: ''
        },

        // Interests
        interests: [] as string[]
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const docSnap = await getDoc(doc(db, "profiles", user.uid));
                if (docSnap.exists()) {
                    const data = docSnap.data();

                    setFormData({
                        displayName: data.displayName || '',
                        about: data.bio || '',
                        profession: data.profession || '',
                        university: data.university || '',
                        photos: data.photos || [],

                        gender: data.gender || '',
                        birthDate: data.birthDate || '',
                        civilStatus: data.civilStatus || '',

                        height: data.height || '',
                        education: data.education || '',
                        religion: data.religion || '',
                        ethnicity: data.ethnicity || '',
                        location: data.location || { city: '', district: '', address: '' },

                        family: data.family || { fatherProfession: '', motherProfession: '', siblings: '' },
                        habits: data.habits || { drinking: '', smoking: '', food: '' },
                        interests: data.interests || []
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    // Helpers
    const handleFamilyProfession = (field: 'fatherProfession' | 'motherProfession', value: string) => {
        setFormData(prev => ({
            ...prev,
            family: { ...prev.family, [field]: value }
        }));
    };

    const addSibling = () => {
        const newItem = { gender: siblingGender, status: siblingStatus, order: siblingOrder };
        const newList = [...siblingsList, newItem];
        setSiblingsList(newList);

        const details = newList.map(s => `${s.order} ${s.gender} (${s.status})`).join(", ");
        setFormData(prev => ({
            ...prev,
            family: { ...prev.family, siblings: details }
        }));
    };

    const removeSibling = (idx: number) => {
        const newList = siblingsList.filter((_, i) => i !== idx);
        setSiblingsList(newList);
        const details = newList.length > 0
            ? newList.map(s => `${s.order} ${s.gender} (${s.status})`).join(", ")
            : "Only Child";
        setFormData(prev => ({
            ...prev,
            family: { ...prev.family, siblings: details }
        }));
    };

    const toggleInterest = (interest: string) => {
        setFormData(prev => {
            const current = prev.interests;
            if (current.includes(interest)) {
                return { ...prev, interests: current.filter(i => i !== interest) };
            } else {
                return { ...prev, interests: [...current, interest] };
            }
        });
    };

    const updateLocation = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, location: { ...prev.location, [field]: value } }));
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, "profiles", user.uid), {
                displayName: formData.displayName,
                bio: formData.about,
                profession: formData.profession,
                university: formData.university,
                photos: formData.photos,
                avatar: formData.photos[0] || '',

                gender: formData.gender,
                birthDate: formData.birthDate,
                civilStatus: formData.civilStatus,

                height: formData.height,
                education: formData.education,
                religion: formData.religion,
                ethnicity: formData.ethnicity,
                location: formData.location,

                family: formData.family,
                habits: formData.habits,
                interests: formData.interests
            });

            await logAction('PROFILE_UPDATE', {
                fields: ['all_fields'],
            });

            // alert("Profile Updated!");
            navigate('/app/profile/view');
        } catch (err) {
            console.error(err);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpdate = (url: string, index: number) => {
        const newPhotos = [...(formData.photos || [])];
        while (newPhotos.length <= index) newPhotos.push("");
        newPhotos[index] = url;
        setFormData(prev => ({ ...prev, photos: newPhotos }));
    };

    if (loading) return <div>Loading...</div>;

    const renderSection = () => {
        switch (activeSection) {
            case 'item_photos':
                return null;
            case 'personal':
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Height (ft/cm)</label>
                                <input type="text" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="input-field" placeholder="5'8" />
                            </div>
                            <div>
                                <label className="label">Religion</label>
                                <select value={formData.religion} onChange={e => setFormData({ ...formData, religion: e.target.value })} className="input-field">
                                    <option value="">Select</option>
                                    <option value="Buddhist">Buddhist</option>
                                    <option value="Christian">Christian</option>
                                    <option value="Hindu">Hindu</option>
                                    <option value="Islam">Islam</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Ethnicity</label>
                                <select value={formData.ethnicity} onChange={e => setFormData({ ...formData, ethnicity: e.target.value })} className="input-field">
                                    <option value="">Select</option>
                                    <option value="Sinhalese">Sinhalese</option>
                                    <option value="Tamil">Tamil</option>
                                    <option value="Muslim">Muslim</option>
                                    <option value="Burgher">Burgher</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Education</label>
                                <select value={formData.education} onChange={e => setFormData({ ...formData, education: e.target.value })} className="input-field">
                                    <option value="">Select</option>
                                    <option value="O/L">G.C.E O/L</option>
                                    <option value="A/L">G.C.E A/L</option>
                                    <option value="Diploma">Diploma</option>
                                    <option value="Bachelors">Bachelor's Degree</option>
                                    <option value="Masters">Master's Degree</option>
                                    <option value="Doctorate">Doctorate</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* University - Only if Higher Ed */}
                        {(['Diploma', 'Bachelors', 'Masters', 'Doctorate'].includes(formData.education)) && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="label">University / College</label>
                                <input type="text" value={formData.university} onChange={e => setFormData({ ...formData, university: e.target.value })} className="input-field" placeholder="e.g. University of Colombo" />
                            </div>
                        )}

                        <div>
                            <label className="label">District</label>
                            <select value={formData.location.district || ''} onChange={e => updateLocation('district', e.target.value)} className="input-field">
                                <option value="">Select District</option>
                                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">City</label>
                            <input type="text" value={formData.location.city || ''} onChange={e => updateLocation('city', e.target.value)} className="input-field" />
                        </div>
                    </div>
                );
            case 'family':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Father */}
                        <div>
                            <label className="label">Father's Profession</label>
                            <div className="space-y-2">
                                <select
                                    className="input-field"
                                    value={FAMILY_PROFESSIONS.includes(formData.family.fatherProfession) ? formData.family.fatherProfession : (formData.family.fatherProfession ? "Other" : "")}
                                    onChange={(e) => handleFamilyProfession('fatherProfession', e.target.value === "Other" ? "Other" : e.target.value)}
                                >
                                    <option value="">Select</option>
                                    {FAMILY_PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                {(!FAMILY_PROFESSIONS.includes(formData.family.fatherProfession) && formData.family.fatherProfession !== "") && (
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Specify Profession"
                                        value={formData.family.fatherProfession === "Other" ? "" : formData.family.fatherProfession}
                                        onChange={(e) => handleFamilyProfession('fatherProfession', e.target.value)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Mother */}
                        <div>
                            <label className="label">Mother's Profession</label>
                            <div className="space-y-2">
                                <select
                                    className="input-field"
                                    value={FAMILY_PROFESSIONS.includes(formData.family.motherProfession) ? formData.family.motherProfession : (formData.family.motherProfession ? "Other" : "")}
                                    onChange={(e) => handleFamilyProfession('motherProfession', e.target.value === "Other" ? "Other" : e.target.value)}
                                >
                                    <option value="">Select</option>
                                    {FAMILY_PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                {(!FAMILY_PROFESSIONS.includes(formData.family.motherProfession) && formData.family.motherProfession !== "") && (
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Specify Profession"
                                        value={formData.family.motherProfession === "Other" ? "" : formData.family.motherProfession}
                                        onChange={(e) => handleFamilyProfession('motherProfession', e.target.value)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Siblings */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <label className="label mb-3">Siblings Builder</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <select value={siblingOrder} onChange={e => setSiblingOrder(e.target.value)} className="p-2 border rounded text-xs flex-1">
                                    <option>Elder</option><option>Younger</option><option>Twin</option>
                                </select>
                                <select value={siblingGender} onChange={e => setSiblingGender(e.target.value)} className="p-2 border rounded text-xs flex-1">
                                    <option>Brother</option><option>Sister</option>
                                </select>
                                <select value={siblingStatus} onChange={e => setSiblingStatus(e.target.value)} className="p-2 border rounded text-xs flex-1">
                                    <option>Student</option><option>Employed</option><option>Married</option>
                                </select>
                                <button onClick={addSibling} className="bg-gray-900 text-white p-2 rounded hover:bg-black"><Plus size={16} /></button>
                            </div>

                            {/* Live List Preview */}
                            {(siblingsList.length > 0) && (
                                <div className="space-y-1 mb-3">
                                    {siblingsList.map((s, i) => (
                                        <div key={i} className="flex justify-between items-center text-xs bg-white p-2 rounded border">
                                            <span>{s.order} {s.gender} ({s.status})</span>
                                            <button onClick={() => removeSibling(i)}><X size={14} className="text-red-400" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actual String Value */}
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Final Summary</label>
                            <textarea
                                value={formData.family.siblings}
                                onChange={e => setFormData(prev => ({ ...prev, family: { ...prev.family, siblings: e.target.value } }))}
                                className="input-field h-16 text-sm"
                                placeholder="Only Child"
                            />
                        </div>
                    </div>
                );
            case 'habits':
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="label">Drinking</label>
                            <div className="flex gap-2">
                                {['No', 'Socially', 'Regularly'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setFormData(p => ({ ...p, habits: { ...p.habits, drinking: opt as any } }))}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${formData.habits.drinking === opt ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-white border-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="label">Smoking</label>
                            <div className="flex gap-2">
                                {['No', 'Socially', 'Regularly'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setFormData(p => ({ ...p, habits: { ...p.habits, smoking: opt as any } }))}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${formData.habits.smoking === opt ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-white border-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="label">Food Preference</label>
                            <div className="flex gap-2">
                                {['Veg', 'Non-Veg', 'Vegan'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setFormData(p => ({ ...p, habits: { ...p.habits, food: opt as any } }))}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${formData.habits.food === opt ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'interests':
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <label className="label mb-3">Select Interests</label>
                        <div className="flex flex-wrap gap-2">
                            {INTERESTS_LIST.map(interest => (
                                <button
                                    key={interest}
                                    onClick={() => toggleInterest(interest)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${formData.interests.includes(interest)
                                            ? 'bg-pink-600 text-white shadow-md scale-105'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'
                                        }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-4">Selected: {formData.interests.length}</p>
                    </div>
                );
            case 'basic':
            default:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="label">Display Name</label>
                            <input type="text" value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} className="input-field" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Gender</label>
                                <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="input-field">
                                    <option value="">Select</option>
                                    <option value="man">Man</option>
                                    <option value="woman">Woman</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Civil Status</label>
                                <select value={formData.civilStatus} onChange={e => setFormData({ ...formData, civilStatus: e.target.value })} className="input-field">
                                    <option value="">Select</option>
                                    <option value="Single">Single</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                    <option value="Separated">Separated</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="label">Date of Birth</label>
                            <input type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="label">Profession</label>
                            <input type="text" value={formData.profession} onChange={e => setFormData({ ...formData, profession: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="label">About Me</label>
                            <textarea value={formData.about} onChange={e => setFormData({ ...formData, about: e.target.value })} className="input-field h-24" />
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <style>{`
                .label { display: block; font-size: 0.75rem; color: #6b7280; font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem; }
                .input-field { width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; background-color: white; color: #1f2937; font-weight: 500; outline: none; transition: box-shadow 0.2s; }
                .input-field:focus { box-shadow: 0 0 0 2px #fbcfe8; border-color: #f472b6; }
            `}</style>

            {/* Nav */}
            <nav className="bg-white shadow-sm p-4 sticky top-0 z-20 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="text-gray-600" />
                </button>
                <h1 className="text-lg font-bold">Edit Profile</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-1.5 bg-pink-600 text-white rounded-full font-bold text-sm shadow-sm hover:bg-pink-700 disabled:opacity-50 transition-all"
                >
                    {saving ? '...' : 'Save'}
                </button>
            </nav>

            <div className="max-w-md mx-auto p-4">
                {/* Photos Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="font-bold text-gray-900">My Photos</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <div key={idx} className="relative aspect-[3/4] bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm flex flex-col items-center justify-center hover:border-pink-300 transition-colors group">
                                <NICUploader
                                    label={`#${idx + 1}`}
                                    type="public"
                                    onUpload={(url) => handlePhotoUpdate(url, idx)}
                                    initialUrl={formData.photos[idx] || ''}
                                    minimal={true}
                                />
                                {!formData.photos[idx] && (
                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-pink-400 transition-colors">
                                        <Camera size={20} className="mb-1" />
                                        <span className="text-[10px] font-bold uppercase">Add</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section Tabs */}
                <div className="flex overflow-x-auto gap-2 pb-4 mb-2 no-scrollbar">
                    {SECTIONS.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${isActive
                                        ? 'bg-gray-900 text-white shadow-md'
                                        : 'bg-white text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon size={16} />
                                {section.label}
                            </button>
                        );
                    })}
                </div>

                {/* Active Section Content */}
                <div className="bg-white p-6 rounded-2xl shadow-sm min-h-[400px]">
                    {renderSection()}
                </div>
            </div>
        </div>
    );
}
