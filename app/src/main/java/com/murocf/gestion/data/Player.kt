package com.murocf.gestion.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "players")
data class Player(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val fullName: String,
    val dni: String,
    val salary: Double,
    val bonusPerGoal: Double = 0.0,
    val bonusPerCleanSheet: Double = 0.0,
    val bonusPerMinute: Double = 0.0,
    val customBonusName: String = "",
    val customBonusAmount: Double = 0.0
)
