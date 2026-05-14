package com.murocf.gestion.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface PlayerDao {
    @Query("SELECT * FROM players ORDER BY fullName ASC")
    fun observeAll(): Flow<List<Player>>

    @Query("SELECT * FROM players WHERE id = :id")
    suspend fun getById(id: Long): Player?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(player: Player): Long

    @Update
    suspend fun update(player: Player)

    @Delete
    suspend fun delete(player: Player)
}
