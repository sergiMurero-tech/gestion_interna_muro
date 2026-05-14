package com.murocf.gestion.ui.components

import android.graphics.Bitmap
import android.graphics.Canvas as AndroidCanvas
import android.graphics.Color as AndroidColor
import android.graphics.Paint
import android.graphics.Path as AndroidPath
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp

class SignatureState {
    var strokes: List<List<Offset>> by mutableStateOf(emptyList())
        private set
    var canvasSize: IntSize by mutableStateOf(IntSize.Zero)

    fun startStroke(point: Offset) {
        strokes = strokes + listOf(listOf(point))
    }

    fun appendPoint(point: Offset) {
        if (strokes.isEmpty()) {
            strokes = listOf(listOf(point))
            return
        }
        val last = strokes.last()
        val newLast = last + point
        strokes = strokes.dropLast(1) + listOf(newLast)
    }

    fun clear() {
        strokes = emptyList()
    }

    fun isEmpty(): Boolean = strokes.all { it.size < 2 }

    fun toBitmap(width: Int = 1000, height: Int = 300): Bitmap? {
        if (isEmpty()) return null
        val cw = canvasSize.width
        val ch = canvasSize.height
        if (cw == 0 || ch == 0) return null
        val bmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = AndroidCanvas(bmp)
        canvas.drawColor(AndroidColor.TRANSPARENT)
        val paint = Paint().apply {
            color = AndroidColor.BLACK
            isAntiAlias = true
            style = Paint.Style.STROKE
            strokeWidth = 4f
            strokeCap = Paint.Cap.ROUND
            strokeJoin = Paint.Join.ROUND
        }
        val sx = width.toFloat() / cw.toFloat()
        val sy = height.toFloat() / ch.toFloat()
        for (stroke in strokes) {
            if (stroke.size < 2) continue
            val path = AndroidPath()
            path.moveTo(stroke[0].x * sx, stroke[0].y * sy)
            for (i in 1 until stroke.size) {
                path.lineTo(stroke[i].x * sx, stroke[i].y * sy)
            }
            canvas.drawPath(path, paint)
        }
        return bmp
    }
}

@Composable
fun rememberSignatureState(): SignatureState = remember { SignatureState() }

@Composable
fun SignaturePad(
    state: SignatureState,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier) {
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(220.dp)
                .background(Color.White)
                .border(1.dp, Color.Gray)
                .onSizeChanged { state.canvasSize = it }
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDragStart = { offset -> state.startStroke(offset) },
                        onDrag = { change, _ ->
                            state.appendPoint(change.position)
                            change.consume()
                        }
                    )
                }
        ) {
            for (stroke in state.strokes) {
                if (stroke.size < 2) {
                    if (stroke.size == 1) {
                        drawCircle(
                            color = Color.Black,
                            radius = 2.5f,
                            center = stroke[0]
                        )
                    }
                    continue
                }
                val path = Path()
                path.moveTo(stroke[0].x, stroke[0].y)
                for (i in 1 until stroke.size) {
                    path.lineTo(stroke[i].x, stroke[i].y)
                }
                drawPath(
                    path = path,
                    color = Color.Black,
                    style = Stroke(
                        width = 4f,
                        cap = StrokeCap.Round,
                        join = StrokeJoin.Round
                    )
                )
            }
        }
    }
}

@Composable
fun SignatureControls(state: SignatureState, modifier: Modifier = Modifier) {
    Row(
        modifier = modifier.fillMaxWidth().padding(top = 8.dp),
        horizontalArrangement = Arrangement.End
    ) {
        OutlinedButton(onClick = { state.clear() }) {
            Text("Borrar firma")
        }
    }
}
