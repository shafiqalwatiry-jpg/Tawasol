package com.tawasol.app.presentation.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.tawasol.app.core.di.AppContainer
import com.tawasol.app.presentation.auth.login.LoginScreen
import com.tawasol.app.presentation.auth.login.LoginViewModel
import com.tawasol.app.presentation.auth.register.RegisterScreen
import com.tawasol.app.presentation.auth.register.RegisterViewModel
import com.tawasol.app.presentation.home.HomeScreen
import com.tawasol.app.presentation.home.HomeViewModel
import com.tawasol.app.presentation.profile.EditProfileScreen
import com.tawasol.app.presentation.profile.EditProfileViewModel
import com.tawasol.app.presentation.profile.UserProfileScreen
import com.tawasol.app.presentation.profile.UserProfileViewModel
import com.tawasol.app.presentation.search.UserSearchScreen
import com.tawasol.app.presentation.search.UserSearchViewModel
import com.tawasol.app.presentation.settings.PrivacySettingsScreen
import com.tawasol.app.presentation.settings.PrivacySettingsViewModel
import com.tawasol.app.presentation.splash.SplashScreen
import com.tawasol.app.presentation.splash.SplashViewModel

@Composable
fun AppNavGraph(
    appContainer: AppContainer,
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController()
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route,
        modifier = modifier
    ) {
        composable(
            route = Screen.Splash.route,
            enterTransition = {
                slideIntoContainer(
                    AnimatedContentTransitionScope.SlideDirection.Left,
                    animationSpec = tween(400)
                )
            }
        ) {
            val splashViewModel = viewModel<SplashViewModel> {
                SplashViewModel(appContainer.authRepository)
            }
            SplashScreen(
                viewModel = splashViewModel,
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToLogin = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        composable(
            route = Screen.Login.route,
            enterTransition = {
                slideIntoContainer(
                    AnimatedContentTransitionScope.SlideDirection.Left,
                    animationSpec = tween(350)
                )
            }
        ) {
            val loginViewModel = viewModel<LoginViewModel> {
                LoginViewModel(appContainer.loginUseCase)
            }
            LoginScreen(
                viewModel = loginViewModel,
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToRegister = {
                    navController.navigate(Screen.Register.route)
                }
            )
        }

        composable(
            route = Screen.Register.route,
            enterTransition = {
                slideIntoContainer(
                    AnimatedContentTransitionScope.SlideDirection.Left,
                    animationSpec = tween(350)
                )
            }
        ) {
            val registerViewModel = viewModel<RegisterViewModel> {
                RegisterViewModel(appContainer.registerUseCase)
            }
            RegisterScreen(
                viewModel = registerViewModel,
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Register.route) { inclusive = true }
                    }
                },
                onNavigateToLogin = {
                    navController.popBackStack()
                }
            )
        }

        composable(
            route = Screen.Home.route,
            enterTransition = {
                slideIntoContainer(
                    AnimatedContentTransitionScope.SlideDirection.Left,
                    animationSpec = tween(350)
                )
            }
        ) {
            val homeViewModel = viewModel<HomeViewModel> {
                HomeViewModel(
                    getConversationsUseCase = appContainer.getConversationsUseCase,
                    authRepository = appContainer.authRepository
                )
            }
            HomeScreen(
                viewModel = homeViewModel,
                onNavigateToChatDetail = { conversationId ->
                    navController.navigate(Screen.ChatDetail.createRoute(conversationId))
                },
                onNavigateToNewChat = {
                    navController.navigate(Screen.UserSearch.route)
                },
                onNavigateToUserSearch = {
                    navController.navigate(Screen.UserSearch.route)
                },
                onNavigateToProfile = { userId ->
                    navController.navigate(Screen.UserProfile.createRoute(userId))
                },
                onNavigateToEditProfile = {
                    navController.navigate(Screen.EditProfile.route)
                },
                onNavigateToPrivacySettings = {
                    navController.navigate(Screen.PrivacySettings.route)
                },
                onNavigateToLogin = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                }
            )
        }

        // Search Users Route
        composable(
            route = Screen.UserSearch.route,
            enterTransition = {
                slideIntoContainer(
                    AnimatedContentTransitionScope.SlideDirection.Left,
                    animationSpec = tween(300)
                )
            },
            exitTransition = {
                slideOutOfContainer(
                    AnimatedContentTransitionScope.SlideDirection.Right,
                    animationSpec = tween(300)
                )
            }
        ) {
            val searchViewModel = viewModel<UserSearchViewModel> {
                UserSearchViewModel(appContainer.searchUsersUseCase)
            }
            UserSearchScreen(
                viewModel = searchViewModel,
                onNavigateBack = { navController.popBackStack() },
                onUserClick = { userId ->
                    navController.navigate(Screen.UserProfile.createRoute(userId))
                }
            )
        }

        // User Profile Route
        composable(
            route = Screen.UserProfile.route,
            arguments = listOf(
                navArgument("userId") { type = NavType.StringType }
            ),
            enterTransition = {
                slideIntoContainer(
                    AnimatedContentTransitionScope.SlideDirection.Left,
                    animationSpec = tween(300)
                )
            },
            exitTransition = {
                slideOutOfContainer(
                    AnimatedContentTransitionScope.SlideDirection.Right,
                    animationSpec = tween(300)
                )
            }
        ) { backStackEntry ->
            val userId = backStackEntry.arguments?.getString("userId") ?: "self"
            val profileViewModel = viewModel<UserProfileViewModel>(
                key = "profile_$userId"
            ) {
                UserProfileViewModel(
                    userId = userId,
                    userRepository = appContainer.userRepository,
                    authRepository = appContainer.authRepository
                )
            }
            UserProfileScreen(
                viewModel = profileViewModel,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToEditProfile = {
                    navController.navigate(Screen.EditProfile.route)
                },
                onNavigateToPrivacySettings = {
                    navController.navigate(Screen.PrivacySettings.route)
                }
            )
        }

        // Edit Profile Route
        composable(
            route = Screen.EditProfile.route,
            enterTransition = {
                slideIntoContainer(
                    AnimatedContentTransitionScope.SlideDirection.Left,
                    animationSpec = tween(300)
                )
            },
            exitTransition = {
                slideOutOfContainer(
                    AnimatedContentTransitionScope.SlideDirection.Right,
                    animationSpec = tween(300)
                )
            }
        ) {
            val editViewModel = viewModel<EditProfileViewModel> {
                EditProfileViewModel(
                    authRepository = appContainer.authRepository,
                    userRepository = appContainer.userRepository,
                    updateProfileUseCase = appContainer.updateProfileUseCase,
                    uploadAvatarUseCase = appContainer.uploadAvatarUseCase
                )
            }
            EditProfileScreen(
                viewModel = editViewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // Privacy Settings Route
        composable(
            route = Screen.PrivacySettings.route,
            enterTransition = {
                slideIntoContainer(
                    AnimatedContentTransitionScope.SlideDirection.Left,
                    animationSpec = tween(300)
                )
            },
            exitTransition = {
                slideOutOfContainer(
                    AnimatedContentTransitionScope.SlideDirection.Right,
                    animationSpec = tween(300)
                )
            }
        ) {
            val privacyViewModel = viewModel<PrivacySettingsViewModel> {
                PrivacySettingsViewModel(
                    authRepository = appContainer.authRepository,
                    getPrivacySettingsUseCase = appContainer.getPrivacySettingsUseCase,
                    updatePrivacySettingsUseCase = appContainer.updatePrivacySettingsUseCase
                )
            }
            PrivacySettingsScreen(
                viewModel = privacyViewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
