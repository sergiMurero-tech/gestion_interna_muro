package com.murocf.gestion.ui.screens

import android.content.Intent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.murocf.gestion.pdf.CertificateData
import com.murocf.gestion.pdf.CertificateGenerator
import com.murocf.gestion.ui.components.SignatureControls
import com.murocf.gestion.ui.components.SignaturePad
import com.murocf.gestion.ui.components.rememberSignatureState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CertificateScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    var fullName by remember { mutableStateOf("") }
    var dni by remember { mutableStateOf("") }
    var license by remember { mutableStateOf("5") }
    var mutualidad by remember { mutableStateOf("65.20") }
    var resultMessage by remember { mutableStateOf<String?>(null) }
    val signature = rememberSignatureState()

    val licenseAmount = parseDouble(license)
    val mutualidadAmount = parseDouble(mutualidad)
    val total = licenseAmount + mutualidadAmount

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Certificado de licencia") },
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
            Text("Datos del jugador", style = MaterialTheme.typography.titleMedium)
            OutlinedTextField(value = fullName, onValueChange = { fullName = it }, label = { Text("Nombre completo") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = dni, onValueChange = { dni = it }, label = { Text("DNI") }, modifier = Modifier.fillMaxWidth())

            HorizontalDivider()
            Text("Importes", style = MaterialTheme.typography.titleMedium)
            val numKb = KeyboardOptions(keyboardType = KeyboardType.Decimal)
            OutlinedTextField(value = license, onValueChange = { license = it }, label = { Text("Total Licencia (€)") }, keyboardOptions = numKb, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = mutualidad, onValueChange = { mutualidad = it }, label = { Text("Total Mutualidad / Seguro (€)") }, keyboardOptions = numKb, modifier = Modifier.fillMaxWidth())
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Total a abonar", fontWeight = FontWeight.SemiBold)
                    Text(formatEuro(total), style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.primary)
                }
            }

            HorizontalDivider()
            Text("Firma del secretario", style = MaterialTheme.typography.titleMedium)
            SignaturePad(state = signature)
            SignatureControls(state = signature)

            Button(
                onClick = {
                    val data = CertificateData(
                        fullName = fullName.trim(),
                        dni = dni.trim().uppercase(),
                        licenseAmount = licenseAmount,
                        mutualidadAmount = mutualidadAmount,
                        signature = signature.toBitmap()
                    )
                    val file = CertificateGenerator.generate(context, data)
                    val uri = CertificateGenerator.uriFor(context, file)
                    val intent = Intent(Intent.ACTION_VIEW).apply {
                        setDataAndType(uri, "application/pdf")
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    val chooser = Intent.createChooser(intent, "Abrir certificado").apply {
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    context.startActivity(chooser)
                    resultMessage = "PDF generado: ${file.name}"
                },
                enabled = fullName.isNotBlank() && dni.isNotBlank(),
                modifier = Modifier.fillMaxWidth()
            ) { Text("Generar y abrir PDF") }

            OutlinedButton(
                onClick = {
                    val data = CertificateData(
                        fullName = fullName.trim(),
                        dni = dni.trim().uppercase(),
                        licenseAmount = licenseAmount,
                        mutualidadAmount = mutualidadAmount,
                        signature = signature.toBitmap()
                    )
                    val file = CertificateGenerator.generate(context, data)
                    val uri = CertificateGenerator.uriFor(context, file)
                    val intent = Intent(Intent.ACTION_SEND).apply {
                        type = "application/pdf"
                        putExtra(Intent.EXTRA_STREAM, uri)
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    context.startActivity(Intent.createChooser(intent, "Compartir certificado"))
                    resultMessage = "PDF generado: ${file.name}"
                },
                enabled = fullName.isNotBlank() && dni.isNotBlank(),
                modifier = Modifier.fillMaxWidth()
            ) { Text("Generar y compartir") }

            resultMessage?.let { Text(it, color = MaterialTheme.colorScheme.primary) }
        }
    }
}
