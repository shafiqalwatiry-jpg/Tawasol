package com.tawasol.app.data.repository

import com.tawasol.app.core.database.TawasolDatabase
import com.tawasol.app.core.database.entity.UserEntity
import com.tawasol.app.core.security.KeystoreManager
import com.tawasol.app.core.supabase.SupabaseClientProvider
import com.tawasol.app.core.supabase.SupabaseConfig
import com.tawasol.app.domain.model.User
import com.tawasol.app.domain.repository.AuthRepository
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import java.time.Instant

@Serializable
data class ProfileDto(
    val id: String,
    val username: String,
    val display_name: String,
    val avatar_url: String? = null,
    val bio: String? = null,
    val is_online: Boolean = false
)

class AuthRepositoryImpl(
    private val supabaseProvider: SupabaseClientProvider,
    private val database: TawasolDatabase,
    private val keystoreManager: KeystoreManager
) : AuthRepository {

    override val currentUserId: String?
        get() = keystoreManager.getCurrentUserId()

    override suspend fun loginWithUsername(username: String, password: String): Result<User> =
        withContext(Dispatchers.IO) {
            try {
                // In Supabase, if using email auth format for usernames:
                // Username can be mapped to an internal auth identity e.g. "username@tawasol.internal" or direct email
                val internalEmail = "$username@tawasol.local"

                supabaseProvider.auth.signInWith(Email) {
                    this.email = internalEmail
                    this.password = password
                }

                val currentSession = supabaseProvider.auth.currentSessionOrNull()
                val sessionUser = currentSession?.user
                    ?: return@withContext Result.failure(Exception("فشل استرجاع بيانات الجلسة بعد تسجيل الدخول"))

                val userId = sessionUser.id
                keystoreManager.saveCurrentUserId(userId)
                currentSession.accessToken.let { keystoreManager.saveAuthToken(it) }

                // Fetch user profile from Supabase Postgrest
                val profile = try {
                    supabaseProvider.postgrest.from(SupabaseConfig.PROFILES_TABLE)
                        .select {
                            filter {
                                eq("id", userId)
                            }
                        }.decodeSingleOrNull<ProfileDto>()
                } catch (e: Exception) {
                    null
                }

                val user = User(
                    id = userId,
                    username = profile?.username ?: username,
                    displayName = profile?.display_name ?: username,
                    avatarUrl = profile?.avatar_url,
                    bio = profile?.bio,
                    isOnline = true
                )

                // Cache in local Room database
                database.userDao().insertUser(
                    UserEntity(
                        id = user.id,
                        username = user.username,
                        displayName = user.displayName,
                        avatarUrl = user.avatarUrl,
                        bio = user.bio,
                        isOnline = true,
                        lastSeen = Instant.now()
                    )
                )

                Result.success(user)
            } catch (e: Exception) {
                Result.failure(Exception("خطأ في تسجيل الدخول: ${e.localizedMessage ?: "تأكد من صحة البيانات"}"))
            }
        }

    override suspend fun register(
        username: String,
        password: String,
        displayName: String,
        phone: String?,
        email: String?
    ): Result<User> = withContext(Dispatchers.IO) {
        try {
            // Check username uniqueness in profiles table
            val existing = supabaseProvider.postgrest.from(SupabaseConfig.PROFILES_TABLE)
                .select {
                    filter {
                        eq("username", username)
                    }
                }.decodeList<ProfileDto>()

            if (existing.isNotEmpty()) {
                return@withContext Result.failure(Exception("اسم المستخدم @$username محجوز بالفعل، اختر اسماً آخر"))
            }

            // Create Supabase Auth User with metadata
            val internalEmail = email?.takeIf { it.isNotBlank() } ?: "$username@tawasol.local"

            supabaseProvider.auth.signUpWith(Email) {
                this.email = internalEmail
                this.password = password
                this.data = buildJsonObject {
                    put("username", username)
                    put("display_name", displayName)
                    if (!phone.isNullOrBlank()) put("phone_number", phone)
                }
            }

            val session = supabaseProvider.auth.currentSessionOrNull()
            val userId = session?.user?.id ?: java.util.UUID.randomUUID().toString()

            keystoreManager.saveCurrentUserId(userId)
            session?.accessToken?.let { keystoreManager.saveAuthToken(it) }

            // Insert into Supabase profiles table
            val profileInsert = buildJsonObject {
                put("id", userId)
                put("username", username)
                put("display_name", displayName)
                if (!phone.isNullOrBlank()) put("phone_number", phone)
                if (!email.isNullOrBlank()) put("email", email)
            }

            supabaseProvider.postgrest.from(SupabaseConfig.PROFILES_TABLE)
                .insert(profileInsert)

            val domainUser = User(
                id = userId,
                username = username,
                displayName = displayName,
                avatarUrl = null,
                bio = null,
                isOnline = true
            )

            // Cache in local Room DB
            database.userDao().insertUser(
                UserEntity(
                    id = domainUser.id,
                    username = domainUser.username,
                    displayName = domainUser.displayName,
                    isOnline = true
                )
            )

            Result.success(domainUser)
        } catch (e: Exception) {
            Result.failure(Exception("تعذر إكمال التسجيل: ${e.localizedMessage ?: "حدث خطأ غير متوقع"}"))
        }
    }

    override suspend fun getCurrentUser(): User? = withContext(Dispatchers.IO) {
        val currentId = keystoreManager.getCurrentUserId() ?: return@withContext null
        // First check Room local database for instant offline load
        val localUser = database.userDao().getUserByUsername(currentId)
        if (localUser != null) {
            return@withContext User(
                id = localUser.id,
                username = localUser.username,
                displayName = localUser.displayName,
                avatarUrl = localUser.avatarUrl,
                bio = localUser.bio,
                isOnline = localUser.isOnline
            )
        }
        null
    }

    override suspend fun logout(): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            supabaseProvider.auth.signOut()
            keystoreManager.clearSession()
            Result.success(Unit)
        } catch (e: Exception) {
            keystoreManager.clearSession()
            Result.success(Unit)
        }
    }
}
