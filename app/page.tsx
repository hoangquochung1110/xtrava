'use client'

import React, { useState, useRef, ChangeEvent, useCallback } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Camera, Download } from 'lucide-react'

const fontOptions = [
  { value: 'arial', label: 'Arial' },
  { value: 'helvetica', label: 'Helvetica' },
  { value: 'times-new-roman', label: 'Times New Roman' },
  { value: 'courier', label: 'Courier' },
  { value: 'verdana', label: 'Verdana' },
]

const fontSizeOptions = [
  { value: 28, label: '28px' },
  { value: 32, label: '32px' },
  { value: 36, label: '36px' },
]

const overlayPositions = [
  { value: 'bottom', label: 'Centered Bottom' },
  { value: 'left', label: 'Centered Left' },
  { value: 'right', label: 'Centered Right' },
  { value: 'top', label: 'Centered Top' },
]

const iconSizes = {
  28: { width: 28, height: 28 },
  32: { width: 32, height: 32 },
  36: { width: 36, height: 36 },
}

const iconPaths = {
  ruler: {
    28: "/icons/ruler-28.svg",
    32: "/icons/ruler-32.svg",
    36: "/icons/ruler-36.svg",
  },
  clock: {
    28: "/icons/clock-28.svg",
    32: "/icons/clock-32.svg",
    36: "/icons/clock-36.svg",
  },
  mountain: {
    28: "/icons/mountain-28.svg",
    32: "/icons/mountain-32.svg",
    36: "/icons/mountain-36.svg",
  },
}

export default function Component() {
  const [image, setImage] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [distance, setDistance] = useState('')
  const [movingTime, setMovingTime] = useState('')
  const [elevationGain, setElevationGain] = useState('')
  const [selectedFont, setSelectedFont] = useState('arial')
  const [selectedFontSize, setSelectedFontSize] = useState(32)
  const [overlayPosition, setOverlayPosition] = useState('bottom')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          setImageSize({ width: img.width, height: img.height })
          setImage(img.src)
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const getOverlayStyle = () => {
    const baseStyle = "absolute p-4 rounded-md text-white shadow-md"
    switch (overlayPosition) {
      case 'bottom':
        return `${baseStyle} bottom-4 left-4 right-4`
      case 'left':
        return `${baseStyle} left-4 top-4 bottom-4 w-1/4`
      case 'right':
        return `${baseStyle} right-4 top-4 bottom-4 w-1/4`
      case 'top':
        return `${baseStyle} top-4 left-4 right-4`
      default:
        return `${baseStyle} bottom-4 left-4 right-4`
    }
  }

  const downloadImage = useCallback(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.onload = () => {
      // Set canvas size to match the image
      canvas.width = img.width
      canvas.height = img.height

      // Calculate the scale factor
      const scaleFactor = Math.max(1, Math.min(canvas.width, canvas.height) / 800)

      // Draw the image
      ctx.drawImage(img, 0, 0)

      // Set up the overlay style
      const scaledFontSize = selectedFontSize * scaleFactor
      ctx.font = `${scaledFontSize}px ${selectedFont}`
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'white'
      ctx.strokeStyle = 'black'

      // Calculate overlay position and size
      let overlayX, overlayY, overlayWidth, overlayHeight
      const padding = 20 * scaleFactor
      const lineHeight = scaledFontSize * 1.2
      const textHeight = lineHeight

      switch (overlayPosition) {
        case 'bottom':
          overlayWidth = canvas.width - 2 * padding
          overlayHeight = textHeight + 2 * padding
          overlayX = padding
          overlayY = canvas.height - overlayHeight - padding
          break
        case 'top':
          overlayWidth = canvas.width - 2 * padding
          overlayHeight = textHeight + 2 * padding
          overlayX = padding
          overlayY = padding
          break
        case 'left':
          overlayWidth = canvas.width / 4
          overlayHeight = canvas.height - 2 * padding
          overlayX = padding
          overlayY = padding
          break
        case 'right':
          overlayWidth = canvas.width / 4
          overlayHeight = canvas.height - 2 * padding
          overlayX = canvas.width - overlayWidth - padding
          overlayY = padding
          break
        default:
          overlayWidth = canvas.width - 2 * padding
          overlayHeight = textHeight + 2 * padding
          overlayX = padding
          overlayY = canvas.height - overlayHeight - padding
      }

      const textY = overlayY + overlayHeight / 2

      // Calculate the width of each text item
      const distanceText = `${distance} km`
      const timeText = movingTime
      const elevationText = `${elevationGain} m`

      const distanceWidth = ctx.measureText(distanceText).width
      const timeWidth = ctx.measureText(timeText).width
      const elevationWidth = ctx.measureText(elevationText).width

      const totalTextWidth = distanceWidth + timeWidth + elevationWidth
      const spacing = (overlayWidth - totalTextWidth) / 4

      // Function to load and draw SVG icons as raster images
      const loadAndDrawIcon = (src: string, x: number, y: number, width: number, height: number) => {
        return new Promise<void>((resolve) => {
          const iconImg = new window.Image()
          iconImg.onload = () => {
            // Create an off-screen canvas
            const offscreenCanvas = document.createElement('canvas')
            offscreenCanvas.width = width
            offscreenCanvas.height = height
            const offscreenCtx = offscreenCanvas.getContext('2d')
            if (offscreenCtx) {
              // Draw the SVG on the off-screen canvas
              offscreenCtx.drawImage(iconImg, 0, 0, width, height)
              // Draw the off-screen canvas onto the main canvas
              ctx.drawImage(offscreenCanvas, x, y, width, height)
            }
            resolve()
          }
          iconImg.src = src
        })
      }

      // Load and draw icons, then add text
      const baseIconSize = iconSizes[selectedFontSize as keyof typeof iconSizes]
      const scaledIconSize = {
        width: baseIconSize.width * scaleFactor,
        height: baseIconSize.height * scaleFactor
      }
      Promise.all([
        loadAndDrawIcon(iconPaths.ruler[selectedFontSize as keyof typeof iconPaths.ruler], overlayX + spacing - scaledIconSize.width - 5 * scaleFactor, textY - scaledIconSize.height / 2, scaledIconSize.width, scaledIconSize.height),
        loadAndDrawIcon(iconPaths.clock[selectedFontSize as keyof typeof iconPaths.clock], overlayX + spacing + distanceWidth + spacing - scaledIconSize.width - 5 * scaleFactor, textY - scaledIconSize.height / 2, scaledIconSize.width, scaledIconSize.height),
        loadAndDrawIcon(iconPaths.mountain[selectedFontSize as keyof typeof iconPaths.mountain], overlayX + spacing + distanceWidth + spacing + timeWidth + spacing - scaledIconSize.width - 5 * scaleFactor, textY - scaledIconSize.height / 2, scaledIconSize.width, scaledIconSize.height)
      ]).then(() => {
        // Draw text
        let currentX = overlayX + spacing

        // Distance
        ctx.strokeText(distanceText, currentX, textY)
        ctx.fillText(distanceText, currentX, textY)
        currentX += distanceWidth + spacing

        // Time
        ctx.strokeText(timeText, currentX, textY)
        ctx.fillText(timeText, currentX, textY)
        currentX += timeWidth + spacing

        // Elevation
        ctx.strokeText(elevationText, currentX, textY)
        ctx.fillText(elevationText, currentX, textY)

        // Create download link
        const dataUrl = canvas.toDataURL('image/jpeg')
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = 'fitness_activity.jpg'
        link.click()
      })
    }
    img.src = image
  }, [image, distance, movingTime, elevationGain, selectedFont, selectedFontSize, overlayPosition])

  return (
    <div id="fitness-activity-showcase" className="container mx-auto p-4 max-w-full bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Fitness Activity Showcase</h1>
      
      <div id="upload-download-buttons" className="mb-6 text-center space-x-4">
        <Button onClick={handleUpload} className="upload-button bg-gray-800 hover:bg-gray-700 text-white">
          <Camera className="mr-2 h-4 w-4" />
          Upload Photo
        </Button>
        <Button onClick={downloadImage} className="download-button bg-blue-600 hover:bg-blue-700 text-white" disabled={!image}>
          <Download className="mr-2 h-4 w-4" />
          Download Annotated Photo
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className="mb-6">
        {image && (
          <div 
            id="image-preview"
            className="relative rounded-md overflow-hidden shadow-lg bg-gray-200 mx-auto"
            style={{
              width: '100%',
              maxWidth: '800px',
              height: '0',
              paddingBottom: `${(imageSize.height / imageSize.width) * 100}%`,
            }}
          >
            <Image
              src={image}
              alt="Uploaded fitness activity"
              layout="fill"
              objectFit="cover"
            />
            <div
              id="overlay"
              className={getOverlayStyle()}
              style={{ fontFamily: selectedFont, fontSize: `${selectedFontSize}px` }}
            >
              <div className="flex items-center justify-between text-enhance">
                <span className="distance flex items-center">
                  <Image src={iconPaths.ruler[selectedFontSize as keyof typeof iconPaths.ruler]} alt="Ruler" width={iconSizes[selectedFontSize as keyof typeof iconSizes].width} height={iconSizes[selectedFontSize as keyof typeof iconSizes].height} className="mr-1" />
                  {distance} km
                </span>
                <span className="time flex items-center">
                  <Image src={iconPaths.clock[selectedFontSize as keyof typeof iconPaths.clock]} alt="Clock" width={iconSizes[selectedFontSize as keyof typeof iconSizes].width} height={iconSizes[selectedFontSize as keyof typeof iconSizes].height} className="mr-1" />
                  {movingTime}
                </span>
                <span className="elevation flex items-center">
                  <Image src={iconPaths.mountain[selectedFontSize as keyof typeof iconPaths.mountain]} alt="Mountain" width={iconSizes[selectedFontSize as keyof typeof iconSizes].width} height={iconSizes[selectedFontSize as keyof typeof iconSizes].height} className="mr-1" />
                  {elevationGain} m
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div id="fitness-metrics" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <Label htmlFor="distance" className="text-gray-700">Distance (km)</Label>
          <Input
            id="distance"
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="Enter distance"
            className="border-gray-300 focus:border-gray-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="movingTime" className="text-gray-700">Moving Time</Label>
          <Input
            id="movingTime"
            type="text"
            value={movingTime}
            onChange={(e) => setMovingTime(e.target.value)}
            placeholder="Enter moving time"
            className="border-gray-300 focus:border-gray-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="elevationGain" className="text-gray-700">Elevation Gain (m)</Label>
          <Input
            id="elevationGain"
            type="number"
            value={elevationGain}
            onChange={(e) => setElevationGain(e.target.value)}
            placeholder="Enter elevation gain"
            className="border-gray-300 focus:border-gray-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="font" className="text-gray-700">Annotation Font</Label>
          <Select onValueChange={setSelectedFont} defaultValue={selectedFont}>
            <SelectTrigger id="font-select" className="w-full border-gray-300 focus:border-gray-500">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div id="font-size-control" className="mb-6">
        <Label htmlFor="fontSize" className="text-gray-700">Font Size</Label>
        <Select onValueChange={(value) => setSelectedFontSize(Number(value))} defaultValue={selectedFontSize.toString()}>
          <SelectTrigger id="font-size-select" className="w-full border-gray-300 focus:border-gray-500">
            <SelectValue placeholder="Select a font size" />
          </SelectTrigger>
          <SelectContent>
            {fontSizeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div id="overlay-position" className="mb-6 bg-white p-4 rounded-md shadow-md">
        <Label className="mb-2 block text-gray-700">Overlay Position</Label>
        <RadioGroup
          onValueChange={setOverlayPosition}
          defaultValue={overlayPosition}
          className="flex flex-wrap gap-4"
        >
          {overlayPositions.map((position) => (
            <div key={position.value} className="flex items-center space-x-2">
              <RadioGroupItem value={position.value} id={position.value} className="text-gray-800" />
              <Label htmlFor={position.value} className="text-gray-700">{position.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
