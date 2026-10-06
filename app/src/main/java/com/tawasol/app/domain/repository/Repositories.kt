package com.tawasol.app.domain.repository

import com.tawasol.app.domain.model.Conversation
import com.tawasol.app.domain.model.Message
import com.tawasol.app.domain.model.User
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    suspend fun loginWithUsername(username: String, password: String): Result<User>
    suspend fun register(
        username: String,
        password: String,
        displayName: String,
        phone: String? = null,
        email: String? = null
    ): Result<User>
    suspend fun getCurrentUser(): User?
    suspend fun logout(): Result<Unit>
    val currentUserId: String?
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

interface UserRepository {
    fun getUser(userId: String): Flow<User?>
    suspend fun searchUsers(query: String): Result<List<User>>
    suspend fun updateProfile(displayName: String, bio: String?): Result<Unit>
}
