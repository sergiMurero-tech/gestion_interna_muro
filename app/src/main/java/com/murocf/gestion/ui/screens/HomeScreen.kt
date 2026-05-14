package com.murocf.gestion.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.People
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onPlayers: () -> Unit,
    onCalculate: () -> Unit,
    onHistory: () -> Unit,
    onCertificate: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestión Interna - Muro CF") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { padding ->
        Content(
            padding = padding,
            onPlayers = onPlayers,
            onCalculate = onCalculate,
            onHistory = onHistory,
            onCertificate = onCertificate
        )
    }
}

@Composable
private fun Content(
    padding: PaddingValues,
    onPlayers: () -> Unit,
    onCalculate: () -> Unit,
    onHistory: () -> Unit,
    onCertificate: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        HomeAction("Jugadores", "Alta y edición de sueldo y primas", Icons.Default.People, onPlayers)
        HomeAction("Calcular nómina del mes", "Goles, porterías, minutos y descuentos", Icons.Default.Calculate, onCalculate)
        HomeAction("Histórico mensual", "Cálculos guardados", Icons.Default.History, onHistory)
        HomeAction("Generar certificado de licencia", "Genera y firma el PDF para FFCV", Icons.Default.Description, onCertificate)
    }
}

@Composable
private fun HomeAction(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = onClick
    ) {
        androidx.compose.foundation.layout.Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(36.dp)
            )
            androidx.compose.foundation.layout.Spacer(Modifier.size(16.dp))
            Column {
                Text(title, style = MaterialTheme.typography.titleMedium)
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
            }
        }
    }
}
