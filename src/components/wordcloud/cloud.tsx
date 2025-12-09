import { useMemo, useRef, useCallback } from "react"

export interface WordCloudWord {
    text: string
    value: number
    color?: string
}

interface PlacedWord {
    text: string
    x: number
    y: number
    fontSize: number
    color: string
    rotate: number
}

export interface WordCloudProps {
    words: WordCloudWord[]
    width?: number
    height?: number
    font?: string
    fontWeight?: string | number
    minFontSize?: number
    maxFontSize?: number
    padding?: number
    colors?: string[]
    className?: string
    onWordClick?: (word: PlacedWord) => void
}

function measureText(
    text: string,
    fontSize: number,
    font: string,
    fontWeight: string | number,
    ctx: CanvasRenderingContext2D,
): { width: number; height: number } {
    ctx.font = `${fontWeight} ${fontSize}px ${font}`
    const metrics = ctx.measureText(text)
    return {
        width: metrics.width,
        height: fontSize * 1.2, // approximate height
    }
}

function placeWords(
    words: WordCloudWord[],
    width: number,
    height: number,
    font: string,
    fontWeight: string | number,
    minFontSize: number,
    maxFontSize: number,
    padding: number,
    colors: string[],
    ctx: CanvasRenderingContext2D,
): PlacedWord[] {
    if (words.length === 0) return []

    const maxValue = Math.max(...words.map((w) => w.value))
    const minValue = Math.min(...words.map((w) => w.value))
    const range = maxValue - minValue || 1

    const sorted = [...words].sort((a, b) => b.value - a.value)
    const placed: PlacedWord[] = []
    const halfW = width / 2
    const halfH = height / 2

    for (let i = 0; i < sorted.length; i++) {
        const word = sorted[i]
        const normalized = (word.value - minValue) / range
        const fontSize = minFontSize + normalized * (maxFontSize - minFontSize)
        const color = word.color || colors[i % colors.length]
        const { width: textW, height: textH } = measureText(word.text, fontSize, font, fontWeight, ctx)

        // Spiral placement
        let angle = 0
        let found = false

        for (let attempts = 0; attempts < 5000; attempts++) {
            const radius = angle * 3
            const x = radius * Math.cos(angle)
            const y = radius * Math.sin(angle) * 0.6 // flatten spiral vertically

            // Check bounds
            if (x - textW / 2 < -halfW || x + textW / 2 > halfW || y - textH / 2 < -halfH || y + textH / 2 > halfH) {
                angle += 0.1
                continue
            }

            // Check collisions
            let collision = false
            for (const p of placed) {
                const pMeasure = measureText(p.text, p.fontSize, font, fontWeight, ctx)
                if (
                    !(
                        x + textW / 2 + padding < p.x - pMeasure.width / 2 - padding ||
                        x - textW / 2 - padding > p.x + pMeasure.width / 2 + padding ||
                        y + textH / 2 + padding < p.y - pMeasure.height / 2 - padding ||
                        y - textH / 2 - padding > p.y + pMeasure.height / 2 + padding
                    )
                ) {
                    collision = true
                    break
                }
            }

            if (!collision) {
                placed.push({ text: word.text, x, y, fontSize, color, rotate: 0 })
                found = true
                break
            }

            angle += 0.1
        }

        if (!found && placed.length < 3) {
            // Force place first few words at center-ish
            placed.push({ text: word.text, x: 0, y: (i - 1) * 30, fontSize, color, rotate: 0 })
        }
    }

    return placed
}

const DEFAULT_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#10b981", "#06b6d4"]

export function WordCloud({
    words,
    width = 600,
    height = 400,
    font = "Inter, system-ui, sans-serif",
    fontWeight = "bold",
    minFontSize = 12,
    maxFontSize = 80,
    padding = 3,
    colors = DEFAULT_COLORS,
    className = "",
    onWordClick,
}: WordCloudProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const getContext = useCallback(() => {
        if (!canvasRef.current) {
            canvasRef.current = document.createElement("canvas")
        }
        return canvasRef.current.getContext("2d")!
    }, [])

    const placedWords = useMemo(() => {
        const ctx = getContext()
        return placeWords(words, width, height, font, fontWeight, minFontSize, maxFontSize, padding, colors, ctx)
    }, [words, width, height, font, fontWeight, minFontSize, maxFontSize, padding, colors, getContext])

    return (
        <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className={className}
        >
            <g transform={`translate(${width / 2}, ${height / 2})`}>
                {placedWords.map((word, i) => (
                    <text
                        key={`${word.text}-${i}`}
                        x={word.x}
                        y={word.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{
                            fontSize: word.fontSize,
                            fontFamily: font,
                            fontWeight,
                            fill: word.color,
                            cursor: onWordClick ? "pointer" : "default",
                        }}
                        onClick={() => onWordClick?.(word)}
                        className="select-none transition-opacity hover:opacity-80"
                    >
                        {word.text}
                    </text>
                ))}
            </g>
        </svg>
    )
}
