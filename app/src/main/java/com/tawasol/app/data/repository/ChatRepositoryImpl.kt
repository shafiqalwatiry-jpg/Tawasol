package com.tawasol.app.data.repository

import com.tawasol.app.core.database.TawasolDatabase
import com.tawasol.app.core.database.entity.ConversationEntity
import com.tawasol.app.core.database.entity.MessageEntity
import com.tawasol.app.core.database.entity.OutboxMessageEntity
import com.tawasol.app.core.network.NetworkMonitor
import com.tawasol.app.core.supabase.SupabaseClientProvider
import com.tawasol.app.core.supabase.SupabaseConfig
import com.tawasol.app.domain.model.Conversation
import com.tawasol.app.domain.model.Message
import com.tawasol.app.domain.model.MessageStatus
import com.tawasol.app.domain.model.MessageType
import com.tawasol.app.domain.repository.ChatRepository
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import java.time.Instant
import java.util.UUID

@Serializable
data class RemoteMessageDto(
    val id: String,
    val conversation_id: String,
    val sender_id: String,
    val text: String?,
    val message_type: String = "text",
    val status: String = "sent",
    val reply_to_message_id: String? = null,
    val media_url: String? = null,
    val created_at: String
)

class ChatRepositoryImpl(
    private val database: TawasolDatabase,
    private val supabaseProvider: SupabaseClientProvider,
    private val networkMonitor: NetworkMonitor,
    private val currentUserIdProvider: () -> String?
) : ChatRepository {

    override fun getConversations(): Flow<List<Conversation>> {
        return database.conversationDao().getAllConversations().map { entities ->
            entities.map { entity ->
                Conversation(
                    id = entity.id,
                    type = entity.type,
                    title = entity.title,
                    avatarUrl = entity.avatarUrl,
                    lastMessage = entity.lastMessageText,
                    lastMessageTime = entity.lastMessageTimestamp,
                    unreadCount = entity.unreadCount,
                    isPinned = entity.isPinned,
                    isMuted = entity.isMuted
                )
            }
        }
    }

    override fun getMessages(conversationId: String): Flow<List<Message>> {
        return database.messageDao().getMessagesForConversation(conversationId).map { entities ->
            entities.map { entity ->
                Message(
                    id = entity.id,
                    conversationId = entity.conversationId,
                    senderId = entity.senderId,
                    text = entity.text,
                    type = try { MessageType.valueOf(entity.messageType.uppercase()) } catch (e: Exception) { MessageType.TEXT },
                    status = try { MessageStatus.valueOf(entity.status.uppercase()) } catch (e: Exception) { MessageStatus.SENT },
                    mediaUrl = entity.mediaUrl,
                    localFilePath = entity.localFilePath,
                    replyToMessageId = entity.replyToMessageId,
                    createdAt = entity.createdAt
                )
            }
        }
    }

    override suspend fun sendMessage(
        conversationId: String,
        text: String?,
        replyToId: String?
    ): Result<Message> = withContext(Dispatchers.IO) {
        val currentUserId = currentUserIdProvider()
            ?: return@withContext Result.failure(Exception("يجب تسجيل الدخول لإرسال الرسالة"))

        val localId = UUID.randomUUID().toString()
        val now = Instant.now()

        // 1. Immediately save into Room Local DB with status SENDING
        val localMessage = MessageEntity(
            id = localId,
            conversationId = conversationId,
            senderId = currentUserId,
            text = text,
            messageType = "text",
            status = "sending",
            replyToMessageId = replyToId,
            createdAt = now
        )
        database.messageDao().insertMessage(localMessage)

        // Update local conversation preview
        database.conversationDao().insertConversation(
            ConversationEntity(
                id = conversationId,
                type = "direct",
                title = "محادثة",
                lastMessageText = text,
                lastMessageTimestamp = now
            )
        )

        // 2. Check if device is currently online
        val isOnline = try { networkMonitor.isOnline.first() } catch (e: Exception) { false }

        if (!isOnline) {
            // Queue into Outbox for automatic synchronization when connectivity is restored
            database.messageDao().insertOutboxMessage(
                OutboxMessageEntity(
                    localId = localId,
                    conversationId = conversationId,
                    text = text,
                    messageType = "text",
                    replyToMessageId = replyToId
                )
            )
            return@withContext Result.success(
                Message(
                    id = localId,
                    conversationId = conversationId,
                    senderId = currentUserId,
                    text = text,
                    status = MessageStatus.SENDING,
                    createdAt = now
                )
            )
        }

        // 3. Send to Supabase Postgrest backend
        try {
            val payload = buildJsonObject {
                put("id", localId)
                put("conversation_id", conversationId)
                put("sender_id", currentUserId)
                put("text", text)
                put("message_type", "text")
                put("status", "sent")
                if (replyToId != null) put("reply_to_message_id", replyToId)
            }

            supabaseProvider.postgrest.from(SupabaseConfig.MESSAGES_TABLE)
                .insert(payload)

            // Update status in local DB to SENT
            database.messageDao().updateMessageStatus(localId, "sent")

            Result.success(
                Message(
                    id = localId,
                    conversationId = conversationId,
                    senderId = currentUserId,
                    text = text,
                    status = MessageStatus.SENT,
                    createdAt = now
                )
            )
        } catch (e: Exception) {
            // Put in outbox for retry
            database.messageDao().insertOutboxMessage(
                OutboxMessageEntity(
                    localId = localId,
                    conversationId = conversationId,
                    text = text,
                    messageType = "text",
                    lastError = e.message
                )
            )
            database.messageDao().updateMessageStatus(localId, "failed")
            Result.failure(e)
        }
    }

    override suspend fun syncOutbox(): Result<Unit> = withContext(Dispatchers.IO) {
        val currentUserId = currentUserIdProvider() ?: return@withContext Result.success(Unit)
        val pending = database.messageDao().getAllPendingOutboxMessages()

        for (item in pending) {
            try {
                val payload = buildJsonObject {
                    put("id", item.localId)
                    put("conversation_id", item.conversationId)
                    put("sender_id", currentUserId)
                    put("text", item.text)
                    put("message_type", item.messageType)
                    put("status", "sent")
                    if (item.replyToMessageId != null) put("reply_to_message_id", item.replyToMessageId)
                }
                supabaseProvider.postgrest.from(SupabaseConfig.MESSAGES_TABLE).insert(payload)
                database.messageDao().deleteOutboxMessage(item.localId)
                database.messageDao().updateMessageStatus(item.localId, "sent")
            } catch (e: Exception) {
                // Keep in outbox, will retry on next sync cycle
            }
        }
        Result.success(Unit)
    }
}
