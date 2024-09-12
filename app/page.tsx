'use client'

import React, { useState, useRef, ChangeEvent } from 'react'
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
import { Camera, Clock, Mountain, Ruler } from 'lucide-react'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        },
        'base64'
      )
    }
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const getOverlayStyle = () => {
    const baseStyle = "absolute text-white p-4 rounded-md shadow-md"
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

  return (
    <div className="container mx-auto p-4 max-w-3xl bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Fitness Activity Showcase</h1>
      
      <div className="mb-6 text-center">
        <Button onClick={handleUpload} className="bg-gray-800 hover:bg-gray-700 text-white">
          <Camera className="mr-2 h-4 w-4" />
          Upload Photo
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className="mb-6 relative rounded-md overflow-hidden shadow-lg bg-gray-200 aspect-video">
        {image ? (
          <Image
            src={image}
            alt="Uploaded fitness activity"
            layout="fill"
            objectFit="cover"
          />
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