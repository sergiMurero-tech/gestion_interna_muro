package com.murocf.gestion.viewmodel

import com.murocf.gestion.data.Player

data class CalculationInput(
    val goals: Int = 0,
    val cleanSheets: Int = 0,
    val minutes: Int = 0,
    val customCount: Int = 0,
    val travelDiscountCount: Int = 0,
    val proportionalAbsenceDays: Int = 0,
    val proportionalTrainingDays: Int = 0,
    val proportionalReason: String = ""
)

data class CalculationResult(
    val baseSalary: Double,
    val goalBonus: Double,
    val cleanSheetBonus: Double,
    val minuteBonus: Double,
    val customBonus: Double,
    val travelDiscount: Double,
    val proportionalDiscount: Double,
    val finalTotal: Double
) {
    val bonusTotal: Double get() = goalBonus + cleanSheetBonus + minuteBonus + customBonus
    val discountTotal: Double get() = travelDiscount + proportionalDiscount
}

object CalculationLogic {
    const val TRAVEL_DISCOUNT_AMOUNT = 50.0

    fun compute(player: Player, input: CalculationInput): CalculationResult {
        val goalBonus = input.goals * player.bonusPerGoal
        val cleanSheetBonus = input.cleanSheets * player.bonusPerCleanSheet
        val minuteBonus = input.minutes * player.bonusPerMinute
        val customBonus = input.customCount * player.customBonusAmount

        val travelDiscount = input.travelDiscountCount * TRAVEL_DISCOUNT_AMOUNT
        val proportionalDiscount = if (input.proportionalTrainingDays > 0 && input.proportionalAbsenceDays > 0) {
            player.salary * (input.proportionalAbsenceDays.toDouble() / input.proportionalTrainingDays.toDouble())
        } else 0.0

        val finalTotal = player.salary + goalBonus + cleanSheetBonus + minuteBonus + customBonus -
                travelDiscount - proportionalDiscount

        return CalculationResult(
            baseSalary = player.salary,
            goalBonus = goalBonus,
            cleanSheetBonus = cleanSheetBonus,
            minuteBonus = minuteBonus,
            customBonus = customBonus,
            travelDiscount = travelDiscount,
            proportionalDiscount = proportionalDiscount,
            finalTotal = finalTotal
        )
    }
}
