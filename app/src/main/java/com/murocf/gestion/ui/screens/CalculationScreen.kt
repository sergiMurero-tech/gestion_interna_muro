package com.murocf.gestion.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.murocf.gestion.data.MonthlyCalculation
import com.murocf.gestion.data.Player
import com.murocf.gestion.viewmodel.AppViewModel
import com.murocf.gestion.viewmodel.CalculationInput
import com.murocf.gestion.viewmodel.CalculationLogic
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalculationScreen(
    viewModel: AppViewModel,
    onBack: () -> Unit
) {
    val players by viewModel.players.collectAsState()
    var selectedPlayer by remember { mutableStateOf<Player?>(null) }
    var goals by remember { mutableStateOf("") }
    var cleanSheets by remember { mutableStateOf("") }
    var minutes by remember { mutableStateOf("") }
    var customCount by remember { mutableStateOf("") }
    var travelCount by remember { mutableStateOf("") }
    var absenceDays by remember { mutableStateOf("") }
    var trainingDays by remember { mutableStateOf("") }
    var proportionalReason by remember { mutableStateOf("") }

    val now = remember { Calendar.getInstance() }
    var month by remember { mutableStateOf(now.get(Calendar.MONTH) + 1) }
    var year by remember { mutableStateOf(now.get(Calendar.YEAR)) }

    var savedMessage by remember { mutableStateOf<String?>(null) }

    val input = CalculationInput(
        goals = parseInt(goals),
        cleanSheets = parseInt(cleanSheets),
        minutes = parseInt(minutes),
        customCount = parseInt(customCount),
        travelDiscountCount = parseInt(travelCount),
        proportionalAbsenceDays = parseInt(absenceDays),
        proportionalTrainingDays = parseInt(trainingDays),
        proportionalReason = proportionalReason
    )
    val result = selectedPlayer?.let { CalculationLogic.compute(it, input) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Calcular nómina") },
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
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            PlayerSelector(players = players, selected = selectedPlayer, onSelect = { selectedPlayer = it })

            if (players.isEmpty()) {
                Text("Crea jugadores primero en la pantalla 'Jugadores'.", style = MaterialTheme.typography.bodyMedium)
                return@Column
            }

            MonthYearSelector(
                month = month, year = year,
                onMonth = { month = it }, onYear = { year = it }
            )

            HorizontalDivider()
            Text("Datos del mes", style = MaterialTheme.typography.titleMedium)
            val intKb = KeyboardOptions(keyboardType = KeyboardType.Number)
            OutlinedTextField(value = goals, onValueChange = { goals = it }, label = { Text("Goles") }, keyboardOptions = intKb, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = cleanSheets, onValueChange = { cleanSheets = it }, label = { Text("Porterías a 0") }, keyboardOptions = intKb, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = minutes, onValueChange = { minutes = it }, label = { Text("Minutos jugados") }, keyboardOptions = intKb, modifier = Modifier.fillMaxWidth())
            selectedPlayer?.let { p ->
                if (p.customBonusName.isNotBlank()) {
                    OutlinedTextField(
                        value = customCount,
                        onValueChange = { customCount = it },
                        label = { Text("${p.customBonusName} (cantidad)") },
                        keyboardOptions = intKb,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            HorizontalDivider()
            Text("Descuentos", style = MaterialTheme.typography.titleMedium)
            OutlinedTextField(
                value = travelCount, onValueChange = { travelCount = it },
                label = { Text("Nº de descuentos por viaje (50€ c/u)") },
                keyboardOptions = intKb,
                modifier = Modifier.fillMaxWidth()
            )
            Text("Descuento proporcional (otro motivo)", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
            OutlinedTextField(
                value = proportionalReason, onValueChange = { proportionalReason = it },
                label = { Text("Motivo (opcional)") },
                modifier = Modifier.fillMaxWidth()
            )
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = absenceDays, onValueChange = { absenceDays = it },
                    label = { Text("Días ausencia") },
                    keyboardOptions = intKb,
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = trainingDays, onValueChange = { trainingDays = it },
                    label = { Text("Días entrenamiento") },
                    keyboardOptions = intKb,
                    modifier = Modifier.weight(1f)
                )
            }

            HorizontalDivider()
            result?.let { ResultCard(selectedPlayer!!, it, input) }

            Button(
                onClick = {
                    val p = selectedPlayer ?: return@Button
                    val r = result ?: return@Button
                    val calc = MonthlyCalculation(
                        playerId = p.id,
                        playerName = p.fullName,
                        year = year, month = month,
                        goals = input.goals,
                        cleanSheets = input.cleanSheets,
                        minutes = input.minutes,
                        customCount = input.customCount,
                        baseSalary = r.baseSalary,
                        goalBonusTotal = r.goalBonus,
                        cleanSheetBonusTotal = r.cleanSheetBonus,
                        minuteBonusTotal = r.minuteBonus,
                        customBonusTotal = r.customBonus,
                        travelDiscountCount = input.travelDiscountCount,
                        travelDiscountTotal = r.travelDiscount,
                        proportionalDiscountTotal = r.proportionalDiscount,
                        proportionalAbsenceDays = input.proportionalAbsenceDays,
                        proportionalTrainingDays = input.proportionalTrainingDays,
                        proportionalReason = input.proportionalReason,
                        finalTotal = r.finalTotal
                    )
                    viewModel.saveCalculation(calc) {
                        savedMessage = "Cálculo guardado en el histórico."
                    }
                },
                enabled = selectedPlayer != null,
                modifier = Modifier.fillMaxWidth()
            ) { Text("Guardar en histórico") }

            savedMessage?.let { Text(it, color = MaterialTheme.colorScheme.primary) }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun PlayerSelector(players: List<Player>, selected: Player?, onSelect: (Player) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = !expanded }) {
        OutlinedTextField(
            value = selected?.fullName ?: "Selecciona jugador",
            onValueChange = {},
            readOnly = true,
            label = { Text("Jugador") },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
            modifier = Modifier.menuAnchor().fillMaxWidth()
        )
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            players.forEach { p ->
                DropdownMenuItem(text = { Text(p.fullName) }, onClick = {
                    onSelect(p); expanded = false
                })
            }
        }
    }
}

@Composable
private fun MonthYearSelector(month: Int, year: Int, onMonth: (Int) -> Unit, onYear: (Int) -> Unit) {
    val months = listOf(
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    )
    var monthExpanded by remember { mutableStateOf(false) }
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Box(modifier = Modifier.weight(1f)) {
            OutlinedTextField(
                value = months[month - 1],
                onValueChange = {},
                readOnly = true,
                label = { Text("Mes") },
                trailingIcon = {
                    IconButton(onClick = { monthExpanded = true }) {
                        Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                    }
                },
                modifier = Modifier.fillMaxWidth()
            )
            DropdownMenu(expanded = monthExpanded, onDismissRequest = { monthExpanded = false }) {
                months.forEachIndexed { index, name ->
                    DropdownMenuItem(text = { Text(name) }, onClick = {
                        onMonth(index + 1); monthExpanded = false
                    })
                }
            }
        }
        OutlinedTextField(
            value = year.toString(),
            onValueChange = { v -> v.toIntOrNull()?.let(onYear) },
            label = { Text("Año") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
private fun ResultCard(
    player: Player,
    r: com.murocf.gestion.viewmodel.CalculationResult,
    input: CalculationInput
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text("Resultado", style = MaterialTheme.typography.titleMedium)
            Line("Sueldo base", formatEuro(r.baseSalary))
            if (r.goalBonus > 0) Line("Primas por gol (${input.goals} × ${formatEuro(player.bonusPerGoal)})", formatEuro(r.goalBonus))
            if (r.cleanSheetBonus > 0) Line("Primas portería a 0 (${input.cleanSheets} × ${formatEuro(player.bonusPerCleanSheet)})", formatEuro(r.cleanSheetBonus))
            if (r.minuteBonus > 0) Line("Primas por minutos (${input.minutes} × ${formatEuro(player.bonusPerMinute)})", formatEuro(r.minuteBonus))
            if (r.customBonus > 0) Line("${player.customBonusName} (${input.customCount} × ${formatEuro(player.customBonusAmount)})", formatEuro(r.customBonus))
            if (r.travelDiscount > 0) Line("Descuento viajes (${input.travelDiscountCount} × 50,00 €)", "-${formatEuro(r.travelDiscount)}")
            if (r.proportionalDiscount > 0) Line(
                "Descuento proporcional (${input.proportionalAbsenceDays}/${input.proportionalTrainingDays} días)",
                "-${formatEuro(r.proportionalDiscount)}"
            )
            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("TOTAL A PAGAR", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text(formatEuro(r.finalTotal), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            }
        }
    }
}

@Composable
private fun Line(label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(label, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
        Text(value, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
    }
}
