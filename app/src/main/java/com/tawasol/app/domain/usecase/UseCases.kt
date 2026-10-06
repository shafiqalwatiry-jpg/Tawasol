package com.tawasol.app.domain.usecase

import com.tawasol.app.domain.model.Conversation
import com.tawasol.app.domain.model.Message
import com.tawasol.app.domain.model.User
import com.tawasol.app.domain.repository.AuthRepository
import com.tawasol.app.domain.repository.ChatRepository
import kotlinx.coroutines.flow.Flow

class LoginUseCase(private val authRepository: AuthRepository) {
    suspend operator fun invoke(username: String, password: String): Result<User> {
        val cleanUsername = username.trim().removePrefix("@")
        if (cleanUsername.isEmpty()) {
            return Result.failure(IllegalArgumentException("يرجى إدخال اسم المستخدم"))
        }
        if (password.length < 6) {
            return Result.failure(IllegalArgumentException("كلمة المرور يجب ألا تقل عن 6 أحرف"))
        }
        return authRepository.loginWithUsername(cleanUsername, password)
    }
}

class RegisterUseCase(private val authRepository: AuthRepository) {
    suspend operator fun invoke(
        username: String,
        password: String,
        displayName: String,
        phone: String? = null,
        email: String? = null
    ): Result<User> {
        val cleanUsername = username.trim().removePrefix("@")
        if (cleanUsername.length < 3) {
            return Result.failure(IllegalArgumentException("اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل"))
        }
        if (password.length < 8) {
            return Result.failure(IllegalArgumentException("كلمة المرور يجب أن تكون 8 أحرف على الأقل للأمان"))
        }
        if (displayName.isBlank()) {
            return Result.failure(IllegalArgumentException("يرجى إدخال الاسم الظاهر"))
        }
        return authRepository.register(
            username = cleanUsername,
            password = password,
            displayName = displayName.trim(),
            phone = phone?.takeIf { it.isNotBlank() },
            email = email?.takeIf { it.isNotBlank() }
        )
    }
}

class GetConversationsUseCase(private val chatRepository: ChatRepository) {
    operator fun invoke(): Flow<List<Conversation>> {
        return chatRepository.getConversations()
    }
}

class SendMessageUseCase(private val chatRepository: ChatRepository) {
    suspend operator fun invoke(conversationId: String, text: String): Result<Message> {
        if (text.isBlank()) {
            return Result.failure(IllegalArgumentException("لا يمكن إرسال رسالة فارغة"))
        }
        return chatRepository.sendMessage(conversationId, text.trim())
    }
}
