package com.murocf.gestion.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColors = lightColorScheme(
    primary = MuroRed,
    onPrimary = MuroOnRed,
    secondary = MuroDark,
    onSecondary = MuroOnRed,
    background = MuroBackground,
    surface = MuroSurface,
    error = MuroError
)

@Composable
fun GestionMuroTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColors,
        content = content
    )
}
