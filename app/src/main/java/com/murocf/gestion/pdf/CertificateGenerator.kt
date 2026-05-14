package com.murocf.gestion.pdf

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.pdf.PdfDocument
import android.text.TextPaint
import androidx.core.content.FileProvider
import com.murocf.gestion.data.ClubInfo
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class CertificateData(
    val fullName: String,
    val dni: String,
    val licenseAmount: Double,
    val mutualidadAmount: Double,
    val date: Date = Date(),
    val signature: Bitmap? = null
)

object CertificateGenerator {

    private const val PAGE_WIDTH = 595
    private const val PAGE_HEIGHT = 842
    private const val MARGIN_LEFT = 60f
    private const val MARGIN_RIGHT = 60f
    private const val MARGIN_TOP = 60f

    fun generate(context: Context, data: CertificateData): File {
        val pdf = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(PAGE_WIDTH, PAGE_HEIGHT, 1).create()
        val page = pdf.startPage(pageInfo)
        val canvas = page.canvas

        val bodyPaint = TextPaint().apply {
            color = android.graphics.Color.BLACK
            textSize = 11f
            isAntiAlias = true
            typeface = android.graphics.Typeface.create(android.graphics.Typeface.SERIF, android.graphics.Typeface.NORMAL)
        }
        val headerPaint = TextPaint(bodyPaint).apply {
            textSize = 10f
            textAlign = Paint.Align.RIGHT
        }

        var y = MARGIN_TOP
        val rightX = PAGE_WIDTH - MARGIN_RIGHT
        val leftX = MARGIN_LEFT
        val maxWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT

        // Header (right-aligned)
        val header = listOf(
            ClubInfo.NAME,
            "Tlf: ${ClubInfo.PHONE} / Fax: ${ClubInfo.FAX}",
            ClubInfo.POSTAL_BOX,
            ClubInfo.LOCATION,
            "E-mail: ${ClubInfo.EMAIL}"
        )
        for (line in header) {
            canvas.drawText(line, rightX, y, headerPaint)
            y += headerPaint.lineSpacing()
        }

        y += 40f

        // Date line
        val dateStr = formatSpanishDate(data.date)
        canvas.drawText("En ${ClubInfo.SIGN_LOCATION} a $dateStr.", leftX, y, bodyPaint)
        y += 30f

        val total = data.licenseAmount + data.mutualidadAmount
        val paragraphs = listOf(
            "El ${ClubInfo.NAME.replace(" CF", " C.F")} con CIF ${ClubInfo.CIF} mediante el presente escrito manifiesta que:",
            "El jugador ${data.fullName.uppercase(Locale("es", "ES"))} (${data.dni}) está inscrito en la FFCV y como concepto de licencia federativa ha abonado las siguientes cantidades:",
            "Licencia ${formatEuro(data.licenseAmount)} por jugador",
            "Seguro para obtener la licencia ${formatEuro(data.mutualidadAmount)} por jugador.",
            "En total se ha abonado la cantidad de ${formatEuro(total)} por la licencia del jugador.",
            "Se adjuntan documentos federativos que lo acreditan.",
            "Y para que conste a los efectos oportunos se firma en la fecha indicada."
        )

        for (p in paragraphs) {
            y = drawWrapped(canvas, p, leftX, y, maxWidth, bodyPaint) + 18f
        }

        y += 20f
        canvas.drawText(ClubInfo.SECRETARY_TITLE, leftX, y, bodyPaint)

        // Signature
        data.signature?.let { sig ->
            val sigWidth = 200f
            val ratio = sig.height.toFloat() / sig.width.toFloat()
            val sigHeight = sigWidth * ratio
            val sigRect = Rect(
                leftX.toInt(),
                (y + 12).toInt(),
                (leftX + sigWidth).toInt(),
                (y + 12 + sigHeight).toInt()
            )
            canvas.drawBitmap(sig, null, sigRect, null)
        }

        pdf.finishPage(page)

        val dir = File(context.filesDir, "certificates").apply { mkdirs() }
        val safeName = data.fullName.replace(Regex("[^A-Za-z0-9]+"), "_").trim('_')
        val fileName = "certificado_${safeName}_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(data.date)}.pdf"
        val file = File(dir, fileName)
        FileOutputStream(file).use { pdf.writeTo(it) }
        pdf.close()
        return file
    }

    fun uriFor(context: Context, file: File) =
        FileProvider.getUriForFile(context, context.packageName + ".fileprovider", file)

    private fun drawWrapped(
        canvas: android.graphics.Canvas,
        text: String,
        x: Float,
        startY: Float,
        maxWidth: Float,
        paint: TextPaint
    ): Float {
        val words = text.split(" ")
        val sb = StringBuilder()
        var y = startY
        for (w in words) {
            val attempt = if (sb.isEmpty()) w else "$sb $w"
            if (paint.measureText(attempt) > maxWidth) {
                canvas.drawText(sb.toString(), x, y, paint)
                y += paint.lineSpacing()
                sb.clear(); sb.append(w)
            } else {
                sb.clear(); sb.append(attempt)
            }
        }
        if (sb.isNotEmpty()) {
            canvas.drawText(sb.toString(), x, y, paint)
        }
        return y
    }

    private fun TextPaint.lineSpacing(): Float = (textSize * 1.4f)

    private fun formatEuro(amount: Double): String {
        val rounded = Math.round(amount * 100) / 100.0
        val euros = rounded.toLong()
        val cents = Math.round((rounded - euros) * 100).toInt()
        return if (cents == 0) "${euros}€" else String.format(Locale.US, "%d'%02d€", euros, cents)
    }

    private fun formatSpanishDate(date: Date): String {
        val months = arrayOf(
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        )
        val cal = java.util.Calendar.getInstance().apply { time = date }
        return "${cal.get(java.util.Calendar.DAY_OF_MONTH)} de ${months[cal.get(java.util.Calendar.MONTH)]} de ${cal.get(java.util.Calendar.YEAR)}"
    }
}
