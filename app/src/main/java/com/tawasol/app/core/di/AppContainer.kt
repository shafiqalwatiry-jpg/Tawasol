package com.tawasol.app.core.di

import android.content.Context
import com.tawasol.app.core.database.TawasolDatabase
import com.tawasol.app.core.network.ConnectivityNetworkMonitor
import com.tawasol.app.core.network.NetworkMonitor
import com.tawasol.app.core.security.KeystoreManager
import com.tawasol.app.core.supabase.SupabaseClientProvider
import com.tawasol.app.data.repository.AuthRepositoryImpl
import com.tawasol.app.data.repository.ChatRepositoryImpl
import com.tawasol.app.data.repository.UserRepositoryImpl
import com.tawasol.app.domain.repository.AuthRepository
import com.tawasol.app.domain.repository.ChatRepository
import com.tawasol.app.domain.repository.UserRepository
import com.tawasol.app.domain.usecase.GetConversationsUseCase
import com.tawasol.app.domain.usecase.LoginUseCase
import com.tawasol.app.domain.usecase.RegisterUseCase
import com.tawasol.app.domain.usecase.SendMessageUseCase

interface AppContainer {
    val database: TawasolDatabase
    val keystoreManager: KeystoreManager
    val supabaseProvider: SupabaseClientProvider
    val networkMonitor: NetworkMonitor
    val authRepository: AuthRepository
    val chatRepository: ChatRepository
    val userRepository: UserRepository
    val loginUseCase: LoginUseCase
    val registerUseCase: RegisterUseCase
    val getConversationsUseCase: GetConversationsUseCase
    val sendMessageUseCase: SendMessageUseCase
}

class DefaultAppContainer(private val context: Context) : AppContainer {

    override val database: TawasolDatabase by lazy {
        TawasolDatabase.getInstance(context)
    }

    override val keystoreManager: KeystoreManager by lazy {
        KeystoreManager(context)
    }

    override val supabaseProvider: SupabaseClientProvider by lazy {
        SupabaseClientProvider()
    }

    override val networkMonitor: NetworkMonitor by lazy {
        ConnectivityNetworkMonitor(context)
    }

    override val authRepository: AuthRepository by lazy {
        AuthRepositoryImpl(supabaseProvider, database, keystoreManager)
    }

    override val chatRepository: ChatRepository by lazy {
        ChatRepositoryImpl(
            database = database,
            supabaseProvider = supabaseProvider,
            networkMonitor = networkMonitor,
            currentUserIdProvider = { keystoreManager.getCurrentUserId() }
        )
    }

    override val userRepository: UserRepository by lazy {
        UserRepositoryImpl(database, supabaseProvider)
    }

    override val loginUseCase: LoginUseCase by lazy {
        LoginUseCase(authRepository)
    }

    override val registerUseCase: RegisterUseCase by lazy {
        RegisterUseCase(authRepository)
    }

    override val getConversationsUseCase: GetConversationsUseCase by lazy {
        GetConversationsUseCase(chatRepository)
    }

    override val sendMessageUseCase: SendMessageUseCase by lazy {
        SendMessageUseCase(chatRepository)
    }
}
