"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { RefreshCw } from "lucide-react"

const sampleTexts = [
    "Create a poem, click the button to generate a new poem"
]

export default function TextCard() {
    const [currentText, setCurrentText] = useState(sampleTexts[0])
    const [isGenerating, setIsGenerating] = useState(false)

    const handleRegenerate = async () => {
        setIsGenerating(true)
        try {
            const res = await fetch("http://localhost:8000/agent")
            if (!res.ok) throw new Error("Error en la API")
            const data = await res.json()
            setCurrentText(data.message)
        } catch (err) {
            setCurrentText("Error al obtener el texto generado.")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f8f4ea] p-4 flex flex-col items-center justify-start pt-12">
            <div className="mb-8 text-center">
                <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[#5b4a2f]">Hello,</h1>
                <p className="text-[#7c6f57] text-base sm:text-lg mt-1 font-serif">here are today's poems for you</p>
            </div>
            <Card className="w-full max-w-md bg-[#f3efe3] rounded-2xl shadow-none border-none mb-8">
                <CardHeader className="text-center pb-0">
                    <CardTitle className="text-xl font-serif text-[#5b4a2f] font-semibold tracking-tight">POEM GENERATOR</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2 pb-6">
                    <div className="min-h-[120px] p-4 bg-[#f8f4ea] rounded-xl border-none">
                        <p className="text-[#5b4a2f] leading-relaxed whitespace-pre-line font-serif text-lg">{currentText}</p>
                        {/* Si quieres mostrar el autor, puedes extraerlo del texto o de la respuesta de la API */}
                    </div>
                    <Button onClick={handleRegenerate} disabled={isGenerating} className="w-full bg-[#e6d3a3] hover:bg-[#e0c78c] text-[#5b4a2f] text-lg font-serif font-semibold py-3 rounded-2xl mt-2 shadow-none border-none flex items-center justify-center" style={{ boxShadow: 'none' }}>
                        <RefreshCw className={`mr-2 h-5 w-5 ${isGenerating ? "animate-spin" : ""}`} />
                        {isGenerating ? "Generating..." : "Explore Poems"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
} 