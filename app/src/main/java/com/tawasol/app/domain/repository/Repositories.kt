package com.tawasol.app.domain.repository

import com.tawasol.app.domain.model.Conversation
import com.tawasol.app.domain.model.Message
import com.tawasol.app.domain.model.PrivacySettings
import com.tawasol.app.domain.model.User
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    suspend fun login(loginIdentifier: String, password: String): Result<User>
    suspend fun register(
        username: String,
        password: String,
        displayName: String,
        phone: String? = null,
        email: String? = null
    ): Result<User>
    suspend fun getCurrentUser(): User?
    suspend fun restoreSession(): Result<User?>
    suspend fun logout(): Result<Unit>
    val currentUserId: String?
}

interface UserRepository {
    fun getUser(userId: String): Flow<User?>
    suspend fun getUserProfile(userId: String): Result<User>
    suspend fun searchUsers(query: String): Result<List<User>>
    suspend fun updateProfile(userId: String, displayName: String, bio: String?): Result<User>
    suspend fun uploadAvatar(userId: String, imageBytes: ByteArray, mimeType: String): Result<String>
    fun getPrivacySettings(userId: String): Flow<PrivacySettings?>
    suspend fun updatePrivacySettings(settings: PrivacySettings): Result<Unit>
}

interface ChatRepository {
    fun getConversations(): Flow<List<Conversation>>
    fun getMessages(conversationId: String): Flow<List<Message>>
    suspend fun sendMessage(
        conversationId: String,
        text: String?,
        replyToId: String? = null
    ): Result<Message>
    suspend fun syncOutbox(): Result<Unit>
}
