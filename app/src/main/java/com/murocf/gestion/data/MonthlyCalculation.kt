package com.murocf.gestion.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "monthly_calculations")
data class MonthlyCalculation(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val playerId: Long,
    val playerName: String,
    val year: Int,
    val month: Int,
    val goals: Int,
    val cleanSheets: Int,
    val minutes: Int,
    val customCount: Int,
    val baseSalary: Double,
    val goalBonusTotal: Double,
    val cleanSheetBonusTotal: Double,
    val minuteBonusTotal: Double,
    val customBonusTotal: Double,
    val travelDiscountCount: Int,
    val travelDiscountTotal: Double,
    val proportionalDiscountTotal: Double,
    val proportionalAbsenceDays: Int,
    val proportionalTrainingDays: Int,
    val proportionalReason: String,
    val finalTotal: Double,
    val createdAt: Long = System.currentTimeMillis()
)
