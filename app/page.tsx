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
import { Camera, Clock, Download, Mountain, Ruler } from 'lucide-react'

const fontOptions = [
  { value: 'arial', label: 'Arial' },
  { value: 'helvetica', label: 'Helvetica' },
  { value: 'times-new-roman', label: 'Times New Roman' },
  { value: 'courier', label: 'Courier' },
  { value: 'verdana', label: 'Verdana' },
]

const overlayPositions = [
  { value: 'bottom', label: 'Centered Bottom' },
  { value: 'left', label: 'Centered Left' },
  { value: 'right', label: 'Centered Right' },
  { value: 'top', label: 'Centered Top' },
]

const iconPaths = {
  ruler: "M1.5 9.5v-2h1v2h1v-3h1v3h1v-2h1v2h1v-3h1v3h1v-2h1v2h1v-3h1v3h1v-2h1v2h1v-3h1v3h1v-2h1v2h1v-3h1v3h1v-2h1v2h.5v1h-18v-1h.5z",
  clock: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z",
  mountain: "M22.5 17.25h-1.14l-4.95-8.4-3.69 6.3-2.67-4.59-4.32 6.69H3.5v1.5h19v-1.5zM6.72 15.75l2.19-3.39 2.61 4.49h-4.8zm5.72 0l2.45-4.21 2.79 4.21h-5.24z"
}

export default function Component() {
  const [image, setImage] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [distance, setDistance] = useState('')
  const [movingTime, setMovingTime] = useState('')
  const [elevationGain, setElevationGain] = useState('')
  const [selectedFont, setSelectedFont] = useState('arial')
  const [selectedFontSize, setSelectedFontSize] = useState(24)
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

  const drawIcon = (ctx: CanvasRenderingContext2D, iconName: keyof typeof iconPaths, x: number, y: number, size: number) => {
    const path = new Path2D(iconPaths[iconName])
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(size / 24, size / 24)  // The icons are designed for a 24x24 viewbox
    ctx.fill(path)
    ctx.restore()
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

      // Draw the text items with proper spacing
      let currentX = overlayX + spacing

      // Distance
      drawIcon(ctx, 'ruler', currentX - scaledFontSize, textY - scaledFontSize / 2, scaledFontSize)
      ctx.strokeText(distanceText, currentX, textY)
      ctx.fillText(distanceText, currentX, textY)
      currentX += distanceWidth + spacing

      // Time
      drawIcon(ctx, 'clock', currentX - scaledFontSize, textY - scaledFontSize / 2, scaledFontSize)
      ctx.strokeText(timeText, currentX, textY)
      ctx.fillText(timeText, currentX, textY)
      currentX += timeWidth + spacing

      // Elevation
      drawIcon(ctx, 'mountain', currentX - scaledFontSize, textY - scaledFontSize / 2, scaledFontSize)
      ctx.strokeText(elevationText, currentX, textY)
      ctx.fillText(elevationText, currentX, textY)

      // Create download link
      const dataUrl = canvas.toDataURL('image/jpeg')
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = 'fitness_activity.jpg'
      link.click()
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
                <span className="distance flex items-center"><Ruler className="mr-1 h-4 w-4" />{distance} km</span>
                <span className="time flex items-center"><Clock className="mr-1 h-4 w-4" />{movingTime}</span>
                <span className="elevation flex items-center"><Mountain className="mr-1 h-4 w-4" />{elevationGain} m</span>
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
        <Input
          id="fontSize"
          type="number"
          value={selectedFontSize}
          onChange={(e) => setSelectedFontSize(Number(e.target.value))}
          min="12"
          max="72"
          className="border-gray-300 focus:border-gray-500"
        />
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
