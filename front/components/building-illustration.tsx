"use client"

import { motion } from "framer-motion"

interface BuildingIllustrationProps {
  floors: number
  roomsPerFloor: number
}

export function BuildingIllustration({ floors, roomsPerFloor }: BuildingIllustrationProps) {
  // Ensure reasonable limits for visualization
  const maxFloors = Math.min(Math.max(floors || 1, 1), 12)
  const maxRooms = Math.min(Math.max(roomsPerFloor || 1, 1), 8)

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 overflow-x-auto">
      <motion.div
        className="relative min-w-fit"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: `${Math.max(maxRooms * 32 + 80, 200)}px`
        }}
      >
        {/* Hotel Foundation */}
        <motion.div
          className="bg-gradient-to-t from-stone-400 to-stone-300 rounded-b-md shadow-sm"
          style={{
            width: `${Math.max(maxRooms * 32 + 80, 200)}px`,
            height: "16px"
          }}
          layoutId="building-base"
        />
        
        {/* Hotel Building */}
        <div className="relative shadow-lg">
          {/* Hotel Sign */}
          <motion.div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-700 text-white px-3 py-1 rounded text-xs font-medium shadow-md z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: maxFloors * 0.1 + 0.3 }}
          >
            HOTEL
          </motion.div>
          
          {Array.from({ length: maxFloors }, (_, floorIndex) => {
            const floorNumber = maxFloors - floorIndex
            const isTopFloor = floorIndex === 0
            return (
              <motion.div
                key={floorNumber}
                className={`relative border-l-2 border-r-2 border-b ${isTopFloor ? 'border-t-2' : ''} border-slate-300 bg-gradient-to-r from-slate-50 to-gray-50`}
                style={{
                  width: `${Math.max(maxRooms * 32 + 80, 200)}px`,
                  height: "44px"
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: floorIndex * 0.1,
                  duration: 0.3,
                  type: "spring",
                  stiffness: 200
                }}
                layoutId={`floor-${floorNumber}`}
              >
                {/* Floor Number Badge */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-medium min-w-[24px] text-center z-10">
                  {floorNumber}
                </div>
                
                {/* Hotel Windows (Rooms) */}
                <div className="flex items-center h-full pl-16 pr-4 gap-2 flex-wrap justify-end overflow-hidden">
                  {Array.from({ length: maxRooms }, (_, roomIndex) => (
                    <motion.div
                      key={`${floorNumber}-${roomIndex + 1}`}
                      className={`${maxRooms > 8 ? 'w-5 h-6' : 'w-6 h-7'} bg-gradient-to-b from-sky-100 to-sky-50 border border-slate-300 rounded-sm shadow-sm relative overflow-hidden flex-shrink-0`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: (floorIndex * 0.1) + (roomIndex * 0.05),
                        duration: 0.2,
                        type: "spring",
                        stiffness: 300
                      }}
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: "#f0f9ff"
                      }}
                    >
                      {/* Window frame */}
                      <div className="absolute inset-0.5 border border-slate-200 rounded-sm">
                        {/* Window light */}
                        <motion.div
                          className="w-full h-full bg-gradient-to-b from-amber-50 to-amber-100"
                          animate={{
                            opacity: Math.random() > 0.3 ? [0.4, 0.8, 0.4] : 0.2,
                          }}
                          transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 3
                          }}
                        />
                        {/* Window divider */}
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200 transform -translate-y-0.5" />
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 transform -translate-x-0.5" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {/* Hotel Entrance */}
        <motion.div
          className="relative bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-slate-300 rounded-b-lg"
          style={{
            width: `${Math.max(maxRooms * 32 + 80, 200)}px`,
            height: "32px"
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: maxFloors * 0.1 + 0.2 }}
        >
          {/* Entrance Door */}
          <div className="absolute left-1/2 top-1 transform -translate-x-1/2 w-8 h-6 bg-gradient-to-b from-amber-800 to-amber-900 rounded-t border border-amber-700">
            <div className="absolute right-1 top-2 w-0.5 h-0.5 bg-amber-400 rounded-full" />
          </div>
          
          {/* Entrance Steps */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-stone-300 rounded-b" />
        </motion.div>
        
        {/* Hotel Statistics */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: maxFloors * 0.1 + 0.7 }}
        >
          <div className="bg-white rounded-lg p-4 shadow-lg border border-slate-200">
            <div className="text-sm font-semibold text-slate-700 mb-2">Hotel Overview</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 rounded p-2">
                <div className="font-medium text-slate-600">{maxFloors}</div>
                <div className="text-slate-500">Floors</div>
              </div>
              <div className="bg-slate-50 rounded p-2">
                <div className="font-medium text-slate-600">{maxFloors * maxRooms}</div>
                <div className="text-slate-500">Rooms</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}