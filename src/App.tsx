/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Smartphone,
  Layers,
  Database,
  Shield,
  FileCode,
  Terminal,
  CheckCircle2,
  Copy,
  Lock,
  UserCheck,
  Search,
  Image as ImageIcon
} from 'lucide-react';

interface FileNode {
  name: string;
  path: string;
  category: 'core' | 'ui' | 'data' | 'config' | 'sql';
  description: string;
  codeSnippet: string;
}

const ANDROID_FILES: FileNode[] = [
  {
    name: 'AuthRepositoryImpl.kt',
    path: 'app/src/main/java/com/tawasol/app/data/repository/AuthRepositoryImpl.kt',
    category: 'data',
    description: 'إدارة الحسابات الحقيقية عبر Supabase Auth والتحقق من فرادة @username وحماية بيانات الاتصال',
    codeSnippet: `class AuthRepositoryImpl(
    private val supabaseProvider: SupabaseClientProvider,
    private val database: TawasolDatabase,
    private val keystoreManager: KeystoreManager
) : AuthRepository {
    override suspend fun login(loginIdentifier: String, password: String): Result<User> {
        // Authenticates via Supabase Auth without exposing password
        // Maps username or email securely and restores session in Keystore
    }

    override suspend fun register(username: String, password: String, displayName: String, phone: String?, email: String?): Result<User> {
        // Enforces username uniqueness and stores private contacts in user_contacts protected by RLS
    }
}`
  },
  {
    name: 'UserSearchScreen.kt',
    path: 'app/src/main/java/com/tawasol/app/presentation/search/UserSearchScreen.kt',
    category: 'ui',
    description: 'شاشة بحث حقيقية عن المستخدمين باسم المعرف (@username) مع إخفاء تام لرقم الهاتف والبريد',
    codeSnippet: `@Composable
fun UserSearchScreen(
    viewModel: UserSearchViewModel,
    onNavigateBack: () -> Unit,
    onUserClick: (String) -> Unit
) {
    // Live search with debounce, displays Avatar, Display Name, @username, and short Bio
    // Strictly hides phone number and email
}`
  },
  {
    name: 'UserProfileScreen.kt',
    path: 'app/src/main/java/com/tawasol/app/presentation/profile/UserProfileScreen.kt',
    category: 'ui',
    description: 'شاشة الملف الشخصي: تعرض البيانات الحساسة لصاحب الحساب فقط وتخفيها عن المستخدمين الآخرين',
    codeSnippet: `@Composable
fun UserProfileScreen(
    viewModel: UserProfileViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToEditProfile: () -> Unit,
    onNavigateToPrivacySettings: () -> Unit
) {
    // If current user: shows Avatar, Name, @username, Bio, Phone, Email, Edit & Privacy buttons
    // If other user: shows Avatar, Name, @username, Bio only (Phone & Email strictly hidden)
}`
  },
  {
    name: 'EditProfileScreen.kt',
    path: 'app/src/main/java/com/tawasol/app/presentation/profile/EditProfileScreen.kt',
    category: 'ui',
    description: 'تعديل الاسم والنبذة ورفع الصورة الشخصية الحقيقية إلى Supabase Storage (avatars bucket)',
    codeSnippet: `@Composable
fun EditProfileScreen(
    viewModel: EditProfileViewModel,
    onNavigateBack: () -> Unit
) {
    // Image Picker Contract -> readBytes -> upload to Supabase Storage avatars bucket
    // Updates public profile URL in Supabase and Room
}`
  },
  {
    name: 'PrivacySettingsScreen.kt',
    path: 'app/src/main/java/com/tawasol/app/presentation/settings/PrivacySettingsScreen.kt',
    category: 'ui',
    description: 'إعدادات خصوصية حقيقية: آخر ظهور، حالة الاتصال، الصورة الشخصية، مؤشرات القراءة (RLS)',
    codeSnippet: `@Composable
fun PrivacySettingsScreen(
    viewModel: PrivacySettingsViewModel,
    onNavigateBack: () -> Unit
) {
    // Visibility Options: Everyone (الجميع), Contacts (جهات الاتصال), Nobody (لا أحد)
    // Synchronized to Supabase privacy_settings table and Room local DB
}`
  },
  {
    name: 'schema.sql',
    path: 'supabase/schema.sql',
    category: 'sql',
    description: 'مخطط Supabase PostgreSQL المحدث مع جدول user_contacts المشفر وسياسات RLS ومجلد avatars',
    codeSnippet: `-- Strict RLS: Phone and Email are segregated into user_contacts table
CREATE TABLE IF NOT EXISTS public.user_contacts (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    phone_number TEXT,
    email TEXT
);
ALTER TABLE public.user_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only read own private contacts" ON public.user_contacts
    FOR SELECT USING (auth.uid() = user_id);`
  }
];

export default function App() {
  const [selectedFile, setSelectedFile] = useState<FileNode>(ANDROID_FILES[0]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'phase2' | 'code' | 'security'>('phase2');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Cairo',sans-serif] selection:bg-teal-500 selection:text-white">
      {/* Header Banner */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white font-bold text-2xl">
              ت
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-wide">تواصل | Tawasol</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Phase 2: نظام الحسابات والمستخدمين
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Android Native (Kotlin + Jetpack Compose) مع Supabase Auth & RLS و Room
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              com.tawasol.app
            </div>
            <button
              onClick={() => copyToClipboard('./gradlew assembleDebug', 'gradle')}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-teal-600/20"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{copiedText === 'gradle' ? 'تم نسخ الأمر!' : './gradlew assembleDebug'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto border-t border-slate-800/60 pt-2">
          <button
            onClick={() => setActiveTab('phase2')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'phase2'
                ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>نظام الحسابات والمستخدمين (Phase 2)</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>كود Kotlin & Jetpack Compose الجديد</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>الأمان وحماية الهاتف والبريد (RLS)</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'phase2' && (
          <div className="space-y-8">
            {/* Phase 2 Summary Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">اكتمال متطلبات Phase 2 بنجاح</h2>
                  <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                    تم بناء نظام المستخدمين والحسابات الحقيقي لتطبيق تواصل: التحقق من اسم المستخدم الفريد (@username)، المصادقة الحقيقية عبر Supabase Auth، حماية خصوصية رقم الهاتف والبريد الإلكتروني، شاشة البحث عن المستخدمين، صفحة الملف الشخصي وتعديله مع رفع الصور إلى Supabase Storage، وشاشة إعدادات الخصوصية.
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Phase 2: Success
                </span>
              </div>

              {/* Pillars grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-teal-400 font-bold mb-2">
                    <UserCheck className="w-4 h-4" />
                    <span>المصادقة والجلسة</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Supabase Auth هو مصدر الهوية، استعادة الجلسة في Splash، وتخزين الرموز في Android KeyStore.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                    <Lock className="w-4 h-4" />
                    <span>خصوصية الهاتف والبريد</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    عزل رقم الهاتف والبريد في جدول user_contacts مع سياسات RLS صارمة تمنع وصول أي طرف آخر.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
                    <Search className="w-4 h-4" />
                    <span>البحث والملف الشخصي</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    بحث فوري بالمعرف @username، عرض الملفات الشخصية بدون تسريب البيانات الحساسة.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>الصور والتخزين</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    تعديل الملف الشخصي ورفع الصور عبر Supabase Storage (avatars bucket) والتخزين المحلي في Room.
                  </p>
                </div>
              </div>
            </div>

            {/* Screens implemented list */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-400" />
                <span>شاشات ومكونات Phase 2 المنجزة</span>
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-mono text-teal-400">RegisterScreen</div>
                  <div className="text-sm font-semibold text-white mt-1">إنشاء الحساب الحقيقي</div>
                  <p className="text-xs text-slate-400 mt-1">التحقق من فرادة @username ومنع الأسماء المحجوزة وقوة كلمة المرور.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-mono text-teal-400">LoginScreen</div>
                  <div className="text-sm font-semibold text-white mt-1">تسجيل الدخول</div>
                  <p className="text-xs text-slate-400 mt-1">دعم الدخول باسم المستخدم أو البريد وحفظ الجلسة الآمنة.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-mono text-teal-400">UserSearchScreen</div>
                  <div className="text-sm font-semibold text-white mt-1">البحث عن المستخدمين</div>
                  <p className="text-xs text-slate-400 mt-1">بحث فوري بالمعرف، نتائج عامة (الاسم، المعرف، النبذة) دون كشف الهاتف.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-mono text-teal-400">UserProfileScreen</div>
                  <div className="text-sm font-semibold text-white mt-1">الملف الشخصي</div>
                  <p className="text-xs text-slate-400 mt-1">معاينة الحساب الشخصي بحقوله الخاصة، وحجب المعلومات الحساسة للآخرين.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-mono text-teal-400">EditProfileScreen</div>
                  <div className="text-sm font-semibold text-white mt-1">تعديل الملف الشخصي</div>
                  <p className="text-xs text-slate-400 mt-1">تعديل الاسم والنبذة ورفع الصور الشخصية إلى Supabase Storage.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-mono text-teal-400">PrivacySettingsScreen</div>
                  <div className="text-sm font-semibold text-white mt-1">إعدادات الخصوصية</div>
                  <p className="text-xs text-slate-400 mt-1">تخصيص رؤية آخر ظهور وحالة الاتصال والصورة والنبذة ومؤشرات القراءة.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-2">
              <div className="text-xs font-semibold text-slate-400 px-2 mb-2">
                الملفات المضافة والمحدثة في Phase 2
              </div>
              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                {ANDROID_FILES.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-right p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                      selectedFile.path === file.path
                        ? 'bg-teal-500/10 border-teal-500/50 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-teal-300">{file.name}</div>
                      <div className="text-xs text-slate-400 mt-1 line-clamp-1">{file.description}</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                      {file.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">{selectedFile.path}</span>
                <button
                  onClick={() => copyToClipboard(selectedFile.codeSnippet, selectedFile.name)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedText === selectedFile.name ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>
              <div className="p-4 bg-slate-950/70 border-b border-slate-800/60 text-xs text-slate-300">
                <b>الوصف: </b> {selectedFile.description}
              </div>
              <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed bg-slate-950 text-left dir-ltr">
                <code>{selectedFile.codeSnippet}</code>
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-400" />
                <span>حماية الخصوصية على مستوى قاعدة البيانات (Row Level Security)</span>
              </h3>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                وفقاً لشروط الخصوصية الصارمة، تم فصل بيانات الاتصال الحساسة (الهاتف والبريد) في جدول <code className="text-teal-300 font-mono">user_contacts</code> وتطبيق سياسات RLS تمنع أي استعلام عام من استرجاعها، بحيث لا يمكن إلا للمستخدم نفسه أو الإدارة المصرحة قراءتها.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-emerald-400 mb-1">بيانات الملف الشخصي العامة (public.profiles)</div>
                  <div className="text-xs text-slate-300">متاحة لجميع المستخدمين في البحث والمحادثات:</div>
                  <ul className="text-[11px] text-slate-400 mt-2 space-y-1 list-disc list-inside">
                    <li>المعرف الفريد (id)</li>
                    <li>اسم المستخدم (username)</li>
                    <li>الاسم الظاهر (display_name)</li>
                    <li>رابط الصورة الشخصية (avatar_url)</li>
                    <li>النبذة التعريفية (bio)</li>
                    <li>حالة الاتصال وفق إعدادات الخصوصية</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-rose-400 mb-1">بيانات الاتصال الحساسة (public.user_contacts)</div>
                  <div className="text-xs text-slate-300">محمية بالكامل ولا تظهر للعامة نهائياً:</div>
                  <ul className="text-[11px] text-slate-400 mt-2 space-y-1 list-disc list-inside">
                    <li>رقم الهاتف (phone_number): خاص بحساب المستخدم</li>
                    <li>البريد الإلكتروني (email): خاص بحساب المستخدم</li>
                    <li>مفروضة عبر RLS: <code className="font-mono text-teal-300">auth.uid() = user_id</code></li>
                    <li>لا يمكن تجاوزها من تطبيق العميل</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
