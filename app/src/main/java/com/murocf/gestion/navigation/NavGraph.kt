package com.murocf.gestion.navigation

import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.murocf.gestion.ui.screens.CalculationScreen
import com.murocf.gestion.ui.screens.CertificateScreen
import com.murocf.gestion.ui.screens.HistoryScreen
import com.murocf.gestion.ui.screens.HomeScreen
import com.murocf.gestion.ui.screens.PlayerEditScreen
import com.murocf.gestion.ui.screens.PlayersScreen
import com.murocf.gestion.viewmodel.AppViewModel

object Routes {
    const val HOME = "home"
    const val PLAYERS = "players"
    const val PLAYER_NEW = "player/new"
    const val PLAYER_EDIT = "player/edit/{playerId}"
    const val CALCULATION = "calculation"
    const val HISTORY = "history"
    const val CERTIFICATE = "certificate"

    fun playerEdit(id: Long) = "player/edit/$id"
}

@Composable
fun AppNavGraph() {
    val navController = rememberNavController()
    val viewModel: AppViewModel = viewModel()

    NavHost(navController = navController, startDestination = Routes.HOME) {
        composable(Routes.HOME) {
            HomeScreen(
                onPlayers = { navController.navigate(Routes.PLAYERS) },
                onCalculate = { navController.navigate(Routes.CALCULATION) },
                onHistory = { navController.navigate(Routes.HISTORY) },
                onCertificate = { navController.navigate(Routes.CERTIFICATE) }
            )
        }
        composable(Routes.PLAYERS) {
            PlayersScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() },
                onEdit = { id -> navController.navigate(Routes.playerEdit(id)) },
                onAdd = { navController.navigate(Routes.PLAYER_NEW) }
            )
        }
        composable(Routes.PLAYER_NEW) {
            PlayerEditScreen(
                viewModel = viewModel,
                playerId = null,
                onBack = { navController.popBackStack() }
            )
        }
        composable(
            Routes.PLAYER_EDIT,
            arguments = listOf(navArgument("playerId") { type = NavType.LongType })
        ) { entry ->
            val id = entry.arguments?.getLong("playerId")
            PlayerEditScreen(
                viewModel = viewModel,
                playerId = id,
                onBack = { navController.popBackStack() }
            )
        }
        composable(Routes.CALCULATION) {
            CalculationScreen(viewModel = viewModel, onBack = { navController.popBackStack() })
        }
        composable(Routes.HISTORY) {
            HistoryScreen(viewModel = viewModel, onBack = { navController.popBackStack() })
        }
        composable(Routes.CERTIFICATE) {
            CertificateScreen(onBack = { navController.popBackStack() })
        }
    }
}
