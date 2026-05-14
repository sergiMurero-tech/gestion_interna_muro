package com.murocf.gestion.ui.screens

import java.util.Locale

fun formatEuro(amount: Double): String =
    String.format(Locale("es", "ES"), "%,.2f €", amount)

fun parseDouble(s: String): Double =
    s.replace(",", ".").trim().toDoubleOrNull() ?: 0.0

fun parseInt(s: String): Int =
    s.trim().toIntOrNull() ?: 0
