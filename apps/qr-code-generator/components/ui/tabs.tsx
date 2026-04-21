"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Tabs as TabsPrimitive } from "radix-ui"
import * as React from "react"

const TabsContext = React.createContext<{
  orientation?: "horizontal" | "vertical"
  value?: string
}>({})

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
    orientation?: "horizontal" | "vertical"
  }
>(({ className, orientation = "horizontal", ...props }, ref) => {
  const [currentValue, setCurrentValue] = React.useState(props.defaultValue || props.value)

  const handleValueChange = (value: string) => {
    setCurrentValue(value)
    props.onValueChange?.(value)
  }

  return (
    <TabsContext.Provider value={{ orientation, value: currentValue }}>
      <TabsPrimitive.Root
        ref={ref}
        orientation={orientation}
        className={cn("flex gap-2", orientation === "horizontal" ? "flex-col" : "flex-row", className)}
        onValueChange={handleValueChange}
        {...props}
      />
    </TabsContext.Provider>
  )
})
Tabs.displayName = TabsPrimitive.Root.displayName

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const { orientation, value } = React.useContext(TabsContext)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [activeStyle, setActiveStyle] = React.useState({
    left: "0px",
    top: "0px",
    width: "0px",
    height: "0px",
  })

  const updateActiveStyle = React.useCallback(() => {
    if (!containerRef.current || !value) return

    const activeTab = containerRef.current.querySelector('[data-state="active"]') as HTMLElement
    if (!activeTab) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const tabRect = activeTab.getBoundingClientRect()

    if (orientation === "horizontal") {
      setActiveStyle({
        left: `${tabRect.left - containerRect.left}px`,
        top: "4px",
        width: `${tabRect.width}px`,
        height: "calc(100% - 8px)",
      })
    } else {
      setActiveStyle({
        left: "4px",
        top: `${tabRect.top - containerRect.top}px`,
        width: "calc(100% - 8px)",
        height: `${tabRect.height}px`,
      })
    }
  }, [orientation, value])

  React.useEffect(() => {
    const timeoutId = setTimeout(updateActiveStyle, 0)
    return () => clearTimeout(timeoutId)
  }, [updateActiveStyle, value])

  React.useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(updateActiveStyle)
    }

    window.addEventListener("resize", handleResize)

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateActiveStyle)
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      resizeObserver.disconnect()
    }
  }, [updateActiveStyle])
  React.useEffect(() => {
    if (!containerRef.current) return

    const observer = new MutationObserver(() => {
      requestAnimationFrame(updateActiveStyle)
    })

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    })

    return () => observer.disconnect()
  }, [updateActiveStyle])

  return (
    <TabsPrimitive.List
      ref={(el) => {
        if (typeof ref === "function") ref(el)
        else if (ref) ref.current = el
        containerRef.current = el
      }}
      className={cn(
        "relative bg-muted py-1 px-1 rounded-[7px] inline-flex items-center justify-center",
        orientation === "horizontal" ? "flex-row h-9" : "flex-col h-fit w-fit",
        className,
      )}
      {...props}
    >
      {/* Animated indicator */}
      <motion.div
        className="absolute rounded-[6px] bg-background shadow-sm border-none z-0"
        animate={activeStyle}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        layout
      />
      {children}
    </TabsPrimitive.List>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-[7px] px-3.5 py-1.5",
      "text-sm font-medium",
      "relative z-10",
      "data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=inactive]:text-muted-foreground",
      "hover:text-foreground",
      "disabled:pointer-events-none disabled:opacity-50",
      "transition-colors duration-200 ease-in-out",
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { orientation } = React.useContext(TabsContext)

  return (
    <TabsPrimitive.Content ref={ref} className={cn("mt-3", className)} {...props}>
      {children}
    </TabsPrimitive.Content >
  )
})
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsContent, TabsList, TabsTrigger }
