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

const fontOptions = [
  { value: 'arial', label: 'Arial' },
  { value: 'helvetica', label: 'Helvetica' },
  { value: 'times-new-roman', label: 'Times New Roman' },
  { value: 'courier', label: 'Courier' },
  { value: 'verdana', label: 'Verdana' },
]

export default function Component() {
  const [image, setImage] = useState<string | null>(null)
  const [distance, setDistance] = useState('')
  const [movingTime, setMovingTime] = useState('')
  const [elevationGain, setElevationGain] = useState('')
  const [selectedFont, setSelectedFont] = useState('arial')
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

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Fitness Activity Showcase</h1>
      
      <div className="mb-4">
        <Button onClick={handleUpload}>Upload Photo</Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {image && (
        <div className="mb-4 relative">
          <Image
            src={image}
            alt="Uploaded fitness activity"
            width={600}
            height={400}
            className="w-full h-auto"
          />
          <div
            className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4"
            style={{ fontFamily: selectedFont }}
          >
            <p>Distance: {distance} km</p>
            <p>Moving Time: {movingTime}</p>
            <p>Elevation Gain: {elevationGain} m</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="distance">Distance (km)</Label>
          <Input
            id="distance"
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="Enter distance"
          />
        </div>
        <div>
          <Label htmlFor="movingTime">Moving Time</Label>
          <Input
            id="movingTime"
            type="text"
            value={movingTime}
            onChange={(e) => setMovingTime(e.target.value)}
            placeholder="Enter moving time"
          />
        </div>
        <div>
          <Label htmlFor="elevationGain">Elevation Gain (m)</Label>
          <Input
            id="elevationGain"
            type="number"
            value={elevationGain}
            onChange={(e) => setElevationGain(e.target.value)}
            placeholder="Enter elevation gain"
          />
        </div>
        <div>
          <Label htmlFor="font">Annotation Font</Label>
          <Select onValueChange={setSelectedFont} defaultValue={selectedFont}>
            <SelectTrigger className="w-full">
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
    </div>
  )
}