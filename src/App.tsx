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
  FolderTree,
  ExternalLink,
  Copy,
  ChevronRight,
  Sparkles,
  Lock,
  Phone,
  MessageSquare,
  Radio,
  Clock,
  ArrowRight
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
    name: 'MainActivity.kt',
    path: 'app/src/main/java/com/tawasol/app/MainActivity.kt',
    category: 'ui',
    description: 'نقطة الانطلاق لنظام أندرويد مع تفعيل اتجاه اليمين لليسار (RTL) وثيم تواصل',
    codeSnippet: `package com.tawasol.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import com.tawasol.app.core.theme.TawasolTheme
import com.tawasol.app.presentation.navigation.AppNavGraph

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val appContainer = (application as TawasolApp).container

        setContent {
            TawasolTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(
                        modifier = Modifier.fillMaxSize(),
                        color = MaterialTheme.colorScheme.background
                    ) {
                        AppNavGraph(appContainer = appContainer)
                    }
                }
            }
        }
    }
}`
  },
  {
    name: 'HomeScreen.kt',
    path: 'app/src/main/java/com/tawasol/app/presentation/home/HomeScreen.kt',
    category: 'ui',
    description: 'الشاشة الرئيسية بالألسن الأربعة: المحادثات، المكالمات، الحالات، والإعدادات',
    codeSnippet: `enum class HomeTab(val title: String, val icon: ImageVector) {
    CHATS("المحادثات", Icons.Rounded.Chat),
    CALLS("المكالمات", Icons.Rounded.Call),
    STATUS("الحالات", Icons.Rounded.Timeline),
    SETTINGS("الإعدادات", Icons.Rounded.Settings)
}

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToChatDetail: (String) -> Unit,
    onNavigateToNewChat: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val conversations by viewModel.conversations.collectAsState()
    // Jetpack Compose Scaffold with TopBar, BottomNavigation & FAB
}`
  },
  {
    name: 'TawasolDatabase.kt',
    path: 'app/src/main/java/com/tawasol/app/core/database/TawasolDatabase.kt',
    category: 'data',
    description: 'قاعدة بيانات Room المحلية المعزولة للعمل بدون إنترنت (Offline-First) مع طابور الـ Outbox',
    codeSnippet: `@Database(
    entities = [
        UserEntity::class,
        ConversationEntity::class,
        MessageEntity::class,
        OutboxMessageEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(DateConverters::class)
abstract class TawasolDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun conversationDao(): ConversationDao
    abstract fun messageDao(): MessageDao
}`
  },
  {
    name: 'SupabaseClientProvider.kt',
    path: 'app/src/main/java/com/tawasol/app/core/supabase/SupabaseClientProvider.kt',
    category: 'core',
    description: 'تهيئة عميل Supabase الآمن (Auth, Postgrest, Realtime, Storage) بدون Service Role Key',
    codeSnippet: `class SupabaseClientProvider(
    private val url: String = SupabaseConfig.supabaseUrl,
    private val anonKey: String = SupabaseConfig.supabaseAnonKey
) {
    val client: SupabaseClient by lazy {
        createSupabaseClient(supabaseUrl = url, supabaseKey = anonKey) {
            install(Auth)
            install(Postgrest)
            install(Realtime)
            install(Storage)
        }
    }
}`
  },
  {
    name: 'KeystoreManager.kt',
    path: 'app/src/main/java/com/tawasol/app/core/security/KeystoreManager.kt',
    category: 'core',
    description: 'تشفير الجلسات محلياً باستخدام Android KeyStore و AES-256 GCM',
    codeSnippet: `class KeystoreManager(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPreferences = EncryptedSharedPreferences.create(
        context,
        "tawasol_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
}`
  },
  {
    name: 'schema.sql',
    path: 'supabase/schema.sql',
    category: 'sql',
    description: 'مخطط قاعدة بيانات Supabase الكامل (20+ جدول، سياسات RLS، ومشغلات التزامن الآلي)',
    codeSnippet: `-- Profiles with hidden phone numbers & private emails
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    is_online BOOLEAN DEFAULT false,
    role user_role DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Strict policies, conversations, messages, calls, statuses, blocks, reports...`
  },
  {
    name: 'app/build.gradle.kts',
    path: 'app/build.gradle.kts',
    category: 'config',
    description: 'إعدادات بناء أندرويد لـ Compose و Room KSP و Supabase و Coroutines',
    codeSnippet: `android {
    namespace = "com.tawasol.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.tawasol.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}`
  }
];

export default function App() {
  const [selectedFile, setSelectedFile] = useState<FileNode>(ANDROID_FILES[0]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'code' | 'commands' | 'supabase'>('architecture');

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
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/30">
                  Android Native 100%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                مشروع أندرويد حقيقي بلغة Kotlin و Jetpack Compose مع Room و Supabase
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
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>بنية النظام المنجز (Phase 1)</span>
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
            <span>مستعرض ملفات Kotlin و Jetpack Compose</span>
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'supabase'
                ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>مخطط Supabase PostgreSQL والأمان</span>
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'commands'
                ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>طريقة التشغيل على Emulator والجهاز</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Architecture Tab */}
        {activeTab === 'architecture' && (
          <div className="space-y-8">
            {/* Overview Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">مشروع تواصل أندرويد الأصيل جاهز للبناء والتشغيل</h2>
                  <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                    تم إنشاء الهيكل التأسيسي الكامل للمرحلة الأولى وفق مبادئ هندسة البرمجيات الحديثة (Clean Architecture) ونمط
                    Offline-First، مع احترام كامل لكافة متطلباتك وموانعك (لا يوجد WebView، لا توجد نسخ Web كواجهة للتطبيق،
                    بل كود Kotlin أصيل وJetpack Compose جاهز للفتح في Android Studio).
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    المرحلة الأولى مكتملة
                  </span>
                </div>
              </div>

              {/* Stat badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <div className="text-xs text-slate-400 mb-1">اللغة وواجهة المستخدم</div>
                  <div className="text-lg font-bold text-teal-400">Kotlin 2.1 + Compose</div>
                  <div className="text-xs text-slate-500 mt-1">Material 3 / RTL للعربية</div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <div className="text-xs text-slate-400 mb-1">البيانات المحلية</div>
                  <div className="text-lg font-bold text-emerald-400">Room Database</div>
                  <div className="text-xs text-slate-500 mt-1">Outbox Queue للمزامنة</div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <div className="text-xs text-slate-400 mb-1">الخادم والمصادقة</div>
                  <div className="text-lg font-bold text-blue-400">Supabase Auth & DB</div>
                  <div className="text-xs text-slate-500 mt-1">Anon Key فقط / RLS</div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <div className="text-xs text-slate-400 mb-1">أمن الجلسات</div>
                  <div className="text-lg font-bold text-amber-400">Android Keystore</div>
                  <div className="text-xs text-slate-500 mt-1">AES-256 GCM محلياً</div>
                </div>
              </div>
            </div>

            {/* Architecture Pillars */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Pillar 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">1. طبقة الواجهة (Presentation)</h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5"></span>
                    <span><b>Jetpack Navigation Compose:</b> مسارات محددة (Splash, Login, Register, Home).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5"></span>
                    <span><b>RTL أصيل:</b> واجهة عربية كاملة باستخدام <code className="text-teal-300 font-mono">LocalLayoutDirection</code>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5"></span>
                    <span><b>الألسن الرئيسية:</b> المحادثات، المكالمات، الحالات، الإعدادات.</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">2. التخزين المحلي (Offline-First)</h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5"></span>
                    <span><b>Room Database:</b> جداول Users, Conversations, Messages.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5"></span>
                    <span><b>Outbox Message Queue:</b> كتابة الرسائل وحفظها محلياً عند انقطاع الإنترنت.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5"></span>
                    <span><b>NetworkMonitor:</b> مراقبة فورية لشبكة الاتصال لاستئناف التزامن.</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">3. الأمان والخصوصية الصارمة</h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></span>
                    <span><b>اسم المستخدم الفريد (@username):</b> هو المعرف الوحيد الظاهر للآخرين.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></span>
                    <span><b>رقم الهاتف والبريد:</b> مخفيان تماماً عن العامة ومحميان بقواعد RLS.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></span>
                    <span><b>Android KeyStore:</b> تشفير رموز الوصول محلياً بواسطة المفتاح الرئيسي.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Screens implemented list */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                <span>الشاشات المنجزة في المرحلة الحالية (Phase 1)</span>
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-mono text-teal-400">1. SplashScreen</div>
                  <div className="text-sm font-semibold text-white mt-1">شاشة البداية والتحقق</div>
                  <p className="text-xs text-slate-400 mt-1">فحص التوكن المشفر وتوجيه المستخدم تلقائياً للرئيسية أو الدخول.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-mono text-teal-400">2. LoginScreen</div>
                  <div className="text-sm font-semibold text-white mt-1">شاشة تسجيل الدخول</div>
                  <p className="text-xs text-slate-400 mt-1">دخول باسم المستخدم وكلمة المرور ومعالجة الأخطاء بالعربية.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-mono text-teal-400">3. RegisterScreen</div>
                  <div className="text-sm font-semibold text-white mt-1">إنشاء حساب جديد</div>
                  <p className="text-xs text-slate-400 mt-1">اسم مستخدم فريد إجباري، كلمة مرور قوية، وهاتف وبريد اختياريان مخفيان.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-mono text-teal-400">4. HomeScreen</div>
                  <div className="text-sm font-semibold text-white mt-1">الشاشة الرئيسية للألسن</div>
                  <p className="text-xs text-slate-400 mt-1">المحادثات، المكالمات، الحالات، والإعدادات، وزر المحادثة الجديدة.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Explorer Tab */}
        {activeTab === 'code' && (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* File List */}
            <div className="lg:col-span-4 space-y-2">
              <div className="text-xs font-semibold text-slate-400 px-2 mb-2 flex items-center justify-between">
                <span>ملفات المشروع المنشأة ({ANDROID_FILES.length})</span>
                <span className="text-[11px] text-teal-400 font-mono">com.tawasol.app</span>
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

            {/* Code Viewer */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="text-xs font-mono text-slate-400 mr-2">{selectedFile.path}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedFile.codeSnippet, selectedFile.name)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedText === selectedFile.name ? 'تم النسخ' : 'نسخ الكود'}</span>
                </button>
              </div>
              <div className="p-4 bg-slate-950/70 border-b border-slate-800/60 text-xs text-slate-300">
                <b>الوظيفة: </b> {selectedFile.description}
              </div>
              <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed bg-slate-950 text-left dir-ltr">
                <code>{selectedFile.codeSnippet}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Supabase Schema Tab */}
        {activeTab === 'supabase' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">مخطط قاعدة بيانات Supabase (PostgreSQL)</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    الملف <code className="text-teal-300 font-mono">supabase/schema.sql</code> يحتوي على كل الجداول وقواعد RLS اللازمة للمشروع.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard('-- File: supabase/schema.sql created in project root', 'schema')}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedText === 'schema' ? 'تم النسخ!' : 'جاهز في supabase/schema.sql'}</span>
                </button>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {[
                  { name: 'profiles', desc: 'ملفات المستخدمين مع خصوصية الهاتف والبريد' },
                  { name: 'conversations', desc: 'المحادثات الفردية والجماعية' },
                  { name: 'conversation_members', desc: 'أعضاء المحادثات والصلاحيات' },
                  { name: 'messages', desc: 'الرسائل وحالاتها وأنواعها والردود' },
                  { name: 'calls & call_participants', desc: 'إشارات WebRTC للمكالمات' },
                  { name: 'statuses & status_views', desc: 'الحالات المؤقتة (24 ساعة) والمشاهدات' },
                  { name: 'blocks & reports', desc: 'قوائم الحظر والتبليغ ضد الإساءة' },
                  { name: 'user_devices', desc: 'جلسات الأجهزة ورموز الإشعارات FCM' },
                  { name: 'privacy_settings', desc: 'خيارات آخر ظهور والصورة والحالة' }
                ].map((item) => (
                  <div key={item.name} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-mono text-xs font-bold text-teal-400">{item.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
                <span className="font-bold">ملاحظة أمنية هامة: </span>
                تم الالتزام بعدم وضع <code className="font-mono font-bold">Service Role Key</code> في تطبيق أندرويد نهائياً. يتم استخدام <code className="font-mono font-bold">Anon Public Key</code> فقط، وتتكفل سياسات <b>Row Level Security (RLS)</b> بمنع أي مستخدم من الوصول إلى رسائل أو بيانات لا تخصه.
              </div>
            </div>
          </div>
        )}

        {/* Commands and How to Run Tab */}
        {activeTab === 'commands' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-400" />
                <span>دليل تشغيل التطبيق في Android Studio</span>
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-sm text-teal-300 mb-1">الخطوة 1: فتح المشروع في Android Studio</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    افتح برنامج Android Studio واضغط على <b>Open</b> ثم اختر المجلد الجذري لهذا المشروع. سيتعرف البرنامج تلقائياً على ملفات <code className="text-teal-400 font-mono">settings.gradle.kts</code> و <code className="text-teal-400 font-mono">build.gradle.kts</code> ويبدأ فحص الـ Dependencies.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-sm text-teal-300 mb-1">الخطوة 2: تشغيل المشروع على Android Emulator</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    من خلال <b>Device Manager</b> في Android Studio، اختر أو أنشئ أي محاكي يعمل بنظام Android 8.0 وحتى Android 15 (API 26 إلى 35)، ثم اضغط على زر <b>Run (▶)</b> لتثبيت التطبيق وتشغيله فورياً.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-sm text-teal-300 mb-1">الخطوة 3: التشغيل على هاتف أندرويد حقيقي</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    فعّل <b>خيارات المطور (Developer Options)</b> و <b>تصحيح USB (USB Debugging)</b> على هاتفك، وصِل الهاتف بكابل USB. سيظهر اسم الهاتف مباشرة في شريط الأجهزة بـ Android Studio لاختياره والتشغيل عليه.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-sm text-teal-300 mb-2">بناء ملف APK تجريبي عبر سطر الأوامر (Gradle)</div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-700/80 font-mono text-xs text-teal-300 dir-ltr text-left">
                    <span>./gradlew assembleDebug</span>
                    <button
                      onClick={() => copyToClipboard('./gradlew assembleDebug', 'cmd_apk')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      {copiedText === 'cmd_apk' ? 'تم' : 'نسخ'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    المسار الناتج للملف: <code className="text-slate-300 font-mono">app/build/outputs/apk/debug/app-debug.apk</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
