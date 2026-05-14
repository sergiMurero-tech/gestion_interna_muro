package com.murocf.gestion.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.murocf.gestion.data.Player
import com.murocf.gestion.viewmodel.AppViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlayersScreen(
    viewModel: AppViewModel,
    onBack: () -> Unit,
    onEdit: (Long) -> Unit,
    onAdd: () -> Unit
) {
    val players by viewModel.players.collectAsState()
    var pendingDelete by remember { mutableStateOf<Player?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Jugadores") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onAdd, containerColor = MaterialTheme.colorScheme.primary) {
                Icon(Icons.Default.Add, contentDescription = "Añadir jugador", tint = MaterialTheme.colorScheme.onPrimary)
            }
        }
    ) { padding ->
        if (players.isEmpty()) {
            EmptyState(padding)
        } else {
            PlayerList(padding, players, onEdit) { pendingDelete = it }
        }
    }

    pendingDelete?.let { p ->
        AlertDialog(
            onDismissRequest = { pendingDelete = null },
            title = { Text("Eliminar jugador") },
            text = { Text("¿Eliminar a ${p.fullName}? Los cálculos guardados se conservarán.") },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.deletePlayer(p)
                    pendingDelete = null
                }) { Text("Eliminar") }
            },
            dismissButton = {
                TextButton(onClick = { pendingDelete = null }) { Text("Cancelar") }
            }
        )
    }
}

@Composable
private fun EmptyState(padding: PaddingValues) {
    Box(
        modifier = Modifier.fillMaxSize().padding(padding).padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            "Aún no hay jugadores. Pulsa + para crear el primero.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
        )
    }
}

@Composable
private fun PlayerList(
    padding: PaddingValues,
    players: List<Player>,
    onEdit: (Long) -> Unit,
    onDelete: (Player) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(padding),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(players, key = { it.id }) { p ->
            Card(modifier = Modifier.fillMaxWidth(), onClick = { onEdit(p.id) }) {
                androidx.compose.foundation.layout.Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.fillMaxWidth(0.85f)) {
                        Text(p.fullName, style = MaterialTheme.typography.titleMedium)
                        Text("DNI: ${p.dni}", style = MaterialTheme.typography.bodySmall)
                        Text("Sueldo: ${formatEuro(p.salary)}", style = MaterialTheme.typography.bodyMedium)
                    }
                    IconButton(onClick = { onDelete(p) }) {
                        Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = MaterialTheme.colorScheme.error)
                    }
                }
            }
        }
    }
}
