import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { logAction } from '../../lib/audit';
import NICUploader from '../verification/NICUploader';
import { ArrowLeft, Camera, User, Heart, Coffee, Users, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DISTRICTS } from '../../lib/constants';

const SECTIONS = [
    { id: 'basic', label: 'Basic', icon: User },
    { id: 'personal', label: 'Personal', icon: BookOpen },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'habits', label: 'Lifestyle', icon: Coffee },
    { id: 'interests', label: 'Interests', icon: Heart },
];

export default function EditProfile() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('basic');

    // Form State covering all onboarding fields
    const [formData, setFormData] = useState({
        displayName: '',
        about: '',
        profession: '',
        university: '',
        photos: [] as string[],

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

    // Helper to handle nested updates
    const updateFamily = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, family: { ...prev.family, [field]: value } }));
    };

    const updateHabits = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, habits: { ...prev.habits, [field]: value } }));
    };

    const updateLocation = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, location: { ...prev.location, [field]: value } }));
    };

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
            case 'item_photos': // Virtual section for photos if needed, but keeping them static on top is better
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
                                    <option value="High School">High School</option>
                                    <option value="Diploma">Diploma</option>
                                    <option value="Bachelors">Bachelor's Degree</option>
                                    <option value="Masters">Master's Degree</option>
                                    <option value="Doctorate">Doctorate</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="label">District</label>
                            <select value={formData.location.district} onChange={e => updateLocation('district', e.target.value)} className="input-field">
                                <option value="">Select District</option>
                                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">City</label>
                            <input type="text" value={formData.location.city} onChange={e => updateLocation('city', e.target.value)} className="input-field" />
                        </div>
                    </div>
                );
            case 'family':
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="label">Father's Profession</label>
                            <input type="text" value={formData.family.fatherProfession} onChange={e => updateFamily('fatherProfession', e.target.value)} className="input-field" placeholder="e.g. Retired Teacher" />
                        </div>
                        <div>
                            <label className="label">Mother's Profession</label>
                            <input type="text" value={formData.family.motherProfession} onChange={e => updateFamily('motherProfession', e.target.value)} className="input-field" placeholder="e.g. Housewife" />
                        </div>
                        <div>
                            <label className="label">Siblings Details</label>
                            <textarea
                                value={formData.family.siblings}
                                onChange={e => updateFamily('siblings', e.target.value)}
                                className="input-field h-24 resize-none"
                                placeholder="Describe siblings (e.g. 1 Elder Brother - Married)"
                            />
                        </div>
                    </div>
                );
            case 'habits':
                return (
                    <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="label">Drinking</label>
                            <select value={formData.habits.drinking} onChange={e => updateHabits('drinking', e.target.value)} className="input-field">
                                <option value="No">No</option>
                                <option value="Socially">Socially</option>
                                <option value="Regularly">Regularly</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Smoking</label>
                            <select value={formData.habits.smoking} onChange={e => updateHabits('smoking', e.target.value)} className="input-field">
                                <option value="No">No</option>
                                <option value="Socially">Socially</option>
                                <option value="Regularly">Regularly</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Food Preference</label>
                            <select value={formData.habits.food} onChange={e => updateHabits('food', e.target.value)} className="input-field">
                                <option value="Veg">Vegetarian</option>
                                <option value="Non-Veg">Non-Vegetarian</option>
                                <option value="Vegan">Vegan</option>
                            </select>
                        </div>
                    </div>
                );
            case 'interests':
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <label className="label mb-2 block">Your Interests (Comma separated)</label>
                        <textarea
                            value={formData.interests.join(", ")}
                            onChange={(e) => {
                                const list = e.target.value.split(",").map(i => i.trim()); // don't filter empty yet to allow typing comma
                                // actually, for better UX with raw text, we just store what they type and parse on save? 
                                // Or simplistic:
                                setFormData({ ...formData, interests: list });
                            }}
                            className="input-field h-32"
                            placeholder="Music, Travel, Photography, Hiking..."
                        />
                        <p className="text-xs text-gray-400 mt-2">Tip: Add at least 5 interests to get better matches.</p>
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
                            <label className="label">About Me</label>
                            <textarea value={formData.about} onChange={e => setFormData({ ...formData, about: e.target.value })} className="input-field h-24" />
                        </div>
                        <div>
                            <label className="label">Profession</label>
                            <input type="text" value={formData.profession} onChange={e => setFormData({ ...formData, profession: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="label">University / College</label>
                            <input type="text" value={formData.university} onChange={e => setFormData({ ...formData, university: e.target.value })} className="input-field" placeholder="e.g. University of Colombo" />
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
                {/* Photos Section (Always Visible) */}
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
