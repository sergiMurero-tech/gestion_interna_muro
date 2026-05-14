package com.murocf.gestion.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.text.KeyboardOptions
import com.murocf.gestion.data.Player
import com.murocf.gestion.viewmodel.AppViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlayerEditScreen(
    viewModel: AppViewModel,
    playerId: Long?,
    onBack: () -> Unit
) {
    var fullName by remember { mutableStateOf("") }
    var dni by remember { mutableStateOf("") }
    var salary by remember { mutableStateOf("") }
    var bonusGoal by remember { mutableStateOf("") }
    var bonusCleanSheet by remember { mutableStateOf("") }
    var bonusMinute by remember { mutableStateOf("") }
    var customName by remember { mutableStateOf("") }
    var customAmount by remember { mutableStateOf("") }
    var loaded by remember { mutableStateOf(playerId == null) }

    LaunchedEffect(playerId) {
        if (playerId != null) {
            val p = viewModel.getPlayer(playerId)
            if (p != null) {
                fullName = p.fullName
                dni = p.dni
                salary = if (p.salary == 0.0) "" else p.salary.toString()
                bonusGoal = if (p.bonusPerGoal == 0.0) "" else p.bonusPerGoal.toString()
                bonusCleanSheet = if (p.bonusPerCleanSheet == 0.0) "" else p.bonusPerCleanSheet.toString()
                bonusMinute = if (p.bonusPerMinute == 0.0) "" else p.bonusPerMinute.toString()
                customName = p.customBonusName
                customAmount = if (p.customBonusAmount == 0.0) "" else p.customBonusAmount.toString()
            }
            loaded = true
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (playerId == null) "Nuevo jugador" else "Editar jugador") },
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
        }
    ) { padding ->
        Form(
            padding = padding,
            fullName = fullName, onFullName = { fullName = it },
            dni = dni, onDni = { dni = it },
            salary = salary, onSalary = { salary = it },
            bonusGoal = bonusGoal, onBonusGoal = { bonusGoal = it },
            bonusCleanSheet = bonusCleanSheet, onBonusCleanSheet = { bonusCleanSheet = it },
            bonusMinute = bonusMinute, onBonusMinute = { bonusMinute = it },
            customName = customName, onCustomName = { customName = it },
            customAmount = customAmount, onCustomAmount = { customAmount = it },
            canSave = loaded && fullName.isNotBlank() && dni.isNotBlank(),
            onSave = {
                val p = Player(
                    id = playerId ?: 0L,
                    fullName = fullName.trim(),
                    dni = dni.trim().uppercase(),
                    salary = parseDouble(salary),
                    bonusPerGoal = parseDouble(bonusGoal),
                    bonusPerCleanSheet = parseDouble(bonusCleanSheet),
                    bonusPerMinute = parseDouble(bonusMinute),
                    customBonusName = customName.trim(),
                    customBonusAmount = parseDouble(customAmount)
                )
                viewModel.savePlayer(p) { onBack() }
            }
        )
    }
}

@Composable
private fun Form(
    padding: PaddingValues,
    fullName: String, onFullName: (String) -> Unit,
    dni: String, onDni: (String) -> Unit,
    salary: String, onSalary: (String) -> Unit,
    bonusGoal: String, onBonusGoal: (String) -> Unit,
    bonusCleanSheet: String, onBonusCleanSheet: (String) -> Unit,
    bonusMinute: String, onBonusMinute: (String) -> Unit,
    customName: String, onCustomName: (String) -> Unit,
    customAmount: String, onCustomAmount: (String) -> Unit,
    canSave: Boolean,
    onSave: () -> Unit
) {
    val number = KeyboardOptions(keyboardType = KeyboardType.Decimal)
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Datos del jugador", style = MaterialTheme.typography.titleMedium)
        OutlinedTextField(value = fullName, onValueChange = onFullName, label = { Text("Nombre completo") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = dni, onValueChange = onDni, label = { Text("DNI") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = salary, onValueChange = onSalary, label = { Text("Sueldo mensual (€)") }, keyboardOptions = number, modifier = Modifier.fillMaxWidth())

        HorizontalDivider()
        Text("Primas", style = MaterialTheme.typography.titleMedium)
        OutlinedTextField(value = bonusGoal, onValueChange = onBonusGoal, label = { Text("€ por gol") }, keyboardOptions = number, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = bonusCleanSheet, onValueChange = onBonusCleanSheet, label = { Text("€ por portería a 0") }, keyboardOptions = number, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = bonusMinute, onValueChange = onBonusMinute, label = { Text("€ por minuto jugado") }, keyboardOptions = number, modifier = Modifier.fillMaxWidth())

        HorizontalDivider()
        Text("Prima personalizada", style = MaterialTheme.typography.titleMedium)
        OutlinedTextField(value = customName, onValueChange = onCustomName, label = { Text("Nombre (p.ej. Ascenso, Asistencia)") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = customAmount, onValueChange = onCustomAmount, label = { Text("€ por unidad") }, keyboardOptions = number, modifier = Modifier.fillMaxWidth())

        Button(
            onClick = onSave,
            enabled = canSave,
            modifier = Modifier.fillMaxWidth().padding(top = 16.dp)
        ) { Text("Guardar") }
    }
}
