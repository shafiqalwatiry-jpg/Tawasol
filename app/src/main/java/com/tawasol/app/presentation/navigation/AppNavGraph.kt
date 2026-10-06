package com.tawasol.app.presentation.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.tawasol.app.core.di.AppContainer
import com.tawasol.app.presentation.auth.login.LoginScreen
import com.tawasol.app.presentation.auth.login.LoginViewModel
import com.tawasol.app.presentation.auth.register.RegisterScreen
import com.tawasol.app.presentation.auth.register.RegisterViewModel
import com.tawasol.app.presentation.home.HomeScreen
import com.tawasol.app.presentation.home.HomeViewModel
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
                    navController.navigate(Screen.NewChat.route)
                },
                onNavigateToLogin = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                }
            )
        }
    }
}
