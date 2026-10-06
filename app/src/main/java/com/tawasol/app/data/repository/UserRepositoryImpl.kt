package com.tawasol.app.data.repository

import com.tawasol.app.core.database.TawasolDatabase
import com.tawasol.app.core.supabase.SupabaseClientProvider
import com.tawasol.app.core.supabase.SupabaseConfig
import com.tawasol.app.domain.model.User
import com.tawasol.app.domain.repository.UserRepository
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class UserRepositoryImpl(
    private val database: TawasolDatabase,
    private val supabaseProvider: SupabaseClientProvider
) : UserRepository {

    override fun getUser(userId: String): Flow<User?> {
        return database.userDao().getUserById(userId).map { entity ->
            entity?.let {
                User(
                    id = it.id,
                    username = it.username,
                    displayName = it.displayName,
                    avatarUrl = it.avatarUrl,
                    bio = it.bio,
                    isOnline = it.isOnline,
                    lastSeen = it.lastSeen
                )
            }
        }
    }

    override suspend fun searchUsers(query: String): Result<List<User>> = withContext(Dispatchers.IO) {
        try {
            val cleanQuery = query.trim().removePrefix("@")
            val results = supabaseProvider.postgrest.from(SupabaseConfig.PROFILES_TABLE)
                .select {
                    filter {
                        ilike("username", "%$cleanQuery%")
                    }
                }.decodeList<ProfileDto>()

            val users = results.map { dto ->
                User(
                    id = dto.id,
                    username = dto.username,
                    displayName = dto.display_name,
                    avatarUrl = dto.avatar_url,
                    bio = dto.bio,
                    isOnline = dto.is_online
                )
            }
            Result.success(users)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun updateProfile(displayName: String, bio: String?): Result<Unit> = withContext(Dispatchers.IO) {
        // Will be connected in Phase 2
        Result.success(Unit)
    }
}
