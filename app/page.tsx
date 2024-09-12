'use client'

import React, { useState, useRef, ChangeEvent, useCallback } from 'react'
import Image from 'next/image'
import Resizer from 'react-image-file-resizer'
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

export default function Component() {
  const [image, setImage] = useState<string | null>(null)
  const [distance, setDistance] = useState('')
  const [movingTime, setMovingTime] = useState('')
  const [elevationGain, setElevationGain] = useState('')
  const [selectedFont, setSelectedFont] = useState('arial')
  const [overlayPosition, setOverlayPosition] = useState('bottom')
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      Resizer.imageFileResizer(
        file,
        1200,
        1200,
        'JPEG',
        80,
        0,
        (uri) => {
          setImage(uri as string)
          setImagePosition({ x: 0, y: 0 }) // Reset position when new image is uploaded
        },
        'base64'
      )
    }
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const getOverlayStyle = () => {
    const baseStyle = "absolute p-4 rounded-md"
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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true
    dragStart.current = { x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return
    const newX = e.clientX - dragStart.current.x
    const newY = e.clientY - dragStart.current.y
    setImagePosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    isDragging.current = false
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

      // Draw the image
      ctx.drawImage(img, 0, 0)

      // Set up the overlay style
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.font = `16px ${selectedFont}`
      ctx.textBaseline = 'top'

      // Calculate overlay position and size
      let overlayX, overlayY, overlayWidth, overlayHeight
      const padding = 20
      const lineHeight = 24
      const textHeight = 3 * lineHeight

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

      // Draw the overlay background
      ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight)

      // Draw the text
      ctx.fillStyle = 'white'
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      const textX = overlayX + padding
      let textY = overlayY + padding

      ctx.fillText(`Distance: ${distance} km`, textX, textY)
      textY += lineHeight
      ctx.fillText(`Moving Time: ${movingTime}`, textX, textY)
      textY += lineHeight
      ctx.fillText(`Elevation Gain: ${elevationGain} m`, textX, textY)

      // Create download link
      const dataUrl = canvas.toDataURL('image/jpeg')
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = 'fitness_activity.jpg'
      link.click()
    }
    img.src = image
  }, [image, distance, movingTime, elevationGain, selectedFont, overlayPosition])

  return (
    <div className="container mx-auto p-4 max-w-3xl bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Fitness Activity Showcase</h1>
      
      <div className="mb-6 text-center space-x-4">
        <Button onClick={handleUpload} className="bg-gray-800 hover:bg-gray-700 text-white">
          <Camera className="mr-2 h-4 w-4" />
          Upload Photo
        </Button>
        <Button onClick={downloadImage} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!image}>
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

      <div 
        className="mb-6 relative rounded-md overflow-hidden shadow-lg bg-gray-200 aspect-video"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {image ? (
          <div 
            ref={imageRef}
            className="absolute inset-0"
            style={{
              transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
              cursor: 'move'
            }}
          >
            <Image
              src={image}
              alt="Uploaded fitness activity"
              layout="fill"
              objectFit="cover"
              draggable={false}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <Camera className="h-16 w-16" />
          </div>
        )}
        {image && (
          <div
            className={getOverlayStyle()}
            style={{ fontFamily: selectedFont }}
          >
            <div className="flex items-center justify-between text-enhance">
              <span className="flex items-center"><Ruler className="mr-1 h-4 w-4" />{distance} km</span>
              <span className="flex items-center"><Clock className="mr-1 h-4 w-4" />{movingTime}</span>
              <span className="flex items-center"><Mountain className="mr-1 h-4 w-4" />{elevationGain} m</span>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
            <SelectTrigger className="w-full border-gray-300 focus:border-gray-500">
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

      <div className="mb-6 bg-white p-4 rounded-md shadow-md">
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
