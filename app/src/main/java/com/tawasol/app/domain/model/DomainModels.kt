package com.tawasol.app.domain.model

import java.time.Instant

data class User(
    val id: String,
    val username: String,
    val displayName: String,
    val avatarUrl: String? = null,
    val bio: String? = null,
    val isOnline: Boolean = false,
    val lastSeen: Instant? = null
)

enum class MessageType {
    TEXT,
    IMAGE,
    VIDEO,
    AUDIO,
    FILE
}

enum class MessageStatus {
    SENDING,
    SENT,
    DELIVERED,
    READ,
    FAILED
}

data class Message(
    val id: String,
    val conversationId: String,
    val senderId: String,
    val text: String?,
    val type: MessageType = MessageType.TEXT,
    val status: MessageStatus = MessageStatus.SENT,
    val mediaUrl: String? = null,
    val localFilePath: String? = null,
    val replyToMessageId: String? = null,
    val createdAt: Instant = Instant.now()
)

data class Conversation(
    val id: String,
    val type: String, // "direct" or "group"
    val title: String,
    val avatarUrl: String? = null,
    val lastMessage: String? = null,
    val lastMessageTime: Instant? = null,
    val unreadCount: Int = 0,
    val isPinned: Boolean = false,
    val isMuted: Boolean = false
)
