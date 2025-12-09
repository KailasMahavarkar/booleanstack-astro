import React, { useMemo, useLayoutEffect, useRef, useState, useCallback, type CSSProperties } from "react"

interface PaddingObject {
    horizontal?: number
    vertical?: number
}

export interface ThumbnailProps {
    /** The text to display (use \n for line breaks) */
    text: string
    /** Width in pixels */
    width?: number
    /** Height in pixels */
    height?: number
    /** Background color */
    bgColor?: string
    /** Text color */
    textColor?: string
    /** Optional background image URL */
    backgroundImage?: string | null
    /** Padding as percentage (10) or {horizontal: 5, vertical: 20} */
    padding?: number | PaddingObject
    /** Font size (auto-calculated if not provided) */
    fontSize?: number | string | null
    /** Font weight */
    fontWeight?: CSSProperties["fontWeight"]
    /** Font family */
    fontFamily?: string
    /** Maximum lines for auto-split */
    maxLines?: number
    /** Line height multiplier */
    lineHeight?: number
    /** Text alignment */
    textAlign?: CSSProperties["textAlign"]
    /** Additional CSS styles */
    style?: CSSProperties
    /** Additional CSS classes */
    className?: string
    /** Enable responsive scaling to fit container */
    responsive?: boolean
}

// Helper functions moved outside component to prevent recreation
const calculatePadding = (padding: number | PaddingObject) => {
    if (typeof padding === "object") {
        return {
            horizontal: `${padding.horizontal || 0}%`,
            vertical: `${padding.vertical || 0}%`,
        }
    }
    return {
        horizontal: `${padding}%`,
        vertical: `${padding}%`,
    }
}

const splitTextIntoLines = (text: string, maxLines: number): string[] => {
    if (!text?.trim()) return []

    if (text.includes("\n")) {
        return text.split("\n").slice(0, maxLines)
    }

    const words = text.split(" ").filter(Boolean)

    if (words.length <= 2) {
        return [text]
    }

    if (words.length <= 4) {
        const mid = Math.ceil(words.length / 2)
        return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")]
    }

    const targetLinesCount = Math.min(maxLines, Math.ceil(words.length / 3))
    const wordsPerLine = Math.ceil(words.length / targetLinesCount)
    const lines: string[] = []

    for (let i = 0; i < words.length; i += wordsPerLine) {
        lines.push(words.slice(i, i + wordsPerLine).join(" "))
        if (lines.length >= maxLines) break
    }

    return lines
}

// Main component wrapped in React.memo for static content
const Thumbnail = React.memo<ThumbnailProps>(
    ({
        text,
        width = 1280,
        height = 720,
        bgColor = "#1e1e28",
        textColor = "#ffffff",
        backgroundImage = null,
        padding = 10,
        fontSize = null,
        fontWeight = "bold",
        fontFamily = "Arial, sans-serif",
        maxLines = 3,
        lineHeight = 1.2,
        textAlign = "center",
        style = {},
        className = "",
        responsive = false, // Default to false for backward compatibility
        ...props
    }) => {
        const wrapperRef = useRef<HTMLDivElement>(null)
        const textRef = useRef<HTMLDivElement>(null)
        const [calculatedFontSize, setCalculatedFontSize] = useState<number>(48)
        const [scale, setScale] = useState(1) // Added scale state

        const paddingValues = useMemo(() => calculatePadding(padding), [padding])
        const lines = useMemo(() => splitTextIntoLines(text, maxLines), [text, maxLines])

        const availableSpace = useMemo(() => {
            const hPadding = typeof padding === "object" ? padding.horizontal || 0 : padding
            const vPadding = typeof padding === "object" ? padding.vertical || 0 : padding
            return {
                width: width * (1 - (hPadding * 2) / 100),
                height: height * (1 - (vPadding * 2) / 100),
            }
        }, [width, height, padding])

        const calculateOptimalFontSize = useCallback(() => {
            if (fontSize != null) {
                const size = typeof fontSize === "number" ? fontSize : Number.parseInt(fontSize, 10)
                setCalculatedFontSize(size || 48)
                return
            }

            if (!textRef.current || lines.length === 0) return

            const maxWidth = availableSpace.width
            const maxHeight = availableSpace.height

            let minSize = 12
            let maxSize = Math.min(maxWidth, maxHeight)
            let optimalSize = minSize

            const measureEl = document.createElement("div")
            measureEl.style.cssText = `
        position: absolute;
        visibility: hidden;
        white-space: nowrap;
        font-family: ${fontFamily};
        font-weight: ${fontWeight};
      `
            document.body.appendChild(measureEl)

            while (minSize <= maxSize) {
                const midSize = Math.floor((minSize + maxSize) / 2)
                measureEl.style.fontSize = `${midSize}px`

                let maxLineWidth = 0
                for (const line of lines) {
                    measureEl.textContent = line
                    maxLineWidth = Math.max(maxLineWidth, measureEl.offsetWidth)
                }

                const totalHeight = midSize * lineHeight * lines.length

                if (maxLineWidth <= maxWidth && totalHeight <= maxHeight) {
                    optimalSize = midSize
                    minSize = midSize + 1
                } else {
                    maxSize = midSize - 1
                }
            }

            document.body.removeChild(measureEl)
            setCalculatedFontSize(Math.max(12, optimalSize))
        }, [fontSize, lines, availableSpace, fontFamily, fontWeight, lineHeight])

        useLayoutEffect(() => {
            calculateOptimalFontSize()
        }, [calculateOptimalFontSize])

        useLayoutEffect(() => {
            if (!responsive || !wrapperRef.current) return

            const updateScale = () => {
                if (!wrapperRef.current) return
                const containerWidth = wrapperRef.current.offsetWidth
                const newScale = Math.min(1, containerWidth / width)
                setScale(newScale)
            }

            updateScale()

            const resizeObserver = new ResizeObserver(updateScale)
            resizeObserver.observe(wrapperRef.current)

            return () => resizeObserver.disconnect()
        }, [responsive, width])

        const containerStyle = useMemo<CSSProperties>(
            () => ({
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor: bgColor,
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: `${paddingValues.vertical} ${paddingValues.horizontal}`,
                position: "relative",
                overflow: "hidden",
                boxSizing: "border-box",
                ...style,
            }),
            [width, height, bgColor, backgroundImage, paddingValues, style],
        )

        const textStyle = useMemo<CSSProperties>(
            () => ({
                color: textColor,
                fontSize: `${calculatedFontSize}px`,
                fontWeight,
                fontFamily,
                lineHeight,
                textAlign,
                margin: 0,
                padding: 0,
                width: "100%",
                wordWrap: "break-word",
            }),
            [textColor, calculatedFontSize, fontWeight, fontFamily, lineHeight, textAlign],
        )

        const thumbnail = (
            <div style={containerStyle} className={className} {...props}>
                <div ref={textRef} style={{ width: "100%" }}>
                    {lines.map((line, index) => (
                        <div key={index} style={textStyle}>
                            {line}
                        </div>
                    ))}
                </div>
            </div>
        )

        if (!responsive) {
            return thumbnail
        }

        return (
            <div ref={wrapperRef} style={{ width: "100%" }}>
                <div
                    style={{
                        height: height * scale,
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            transform: `scale(${scale})`,
                            transformOrigin: "top left",
                        }}
                    >
                        {thumbnail}
                    </div>
                </div>
            </div>
        )
    },
)

Thumbnail.displayName = "Thumbnail"

export default Thumbnail
