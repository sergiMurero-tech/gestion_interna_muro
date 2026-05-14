package com.murocf.gestion.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface MonthlyCalculationDao {
    @Query("SELECT * FROM monthly_calculations ORDER BY year DESC, month DESC, createdAt DESC")
    fun observeAll(): Flow<List<MonthlyCalculation>>

    @Query("SELECT * FROM monthly_calculations WHERE playerId = :playerId ORDER BY year DESC, month DESC")
    fun observeForPlayer(playerId: Long): Flow<List<MonthlyCalculation>>

    @Insert
    suspend fun insert(calc: MonthlyCalculation): Long

    @Delete
    suspend fun delete(calc: MonthlyCalculation)
}
