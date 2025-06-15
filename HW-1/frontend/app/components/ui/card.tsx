import React from "react"

export function Card({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`bg-[#f3efe3] rounded-xl border border-gray-200 shadow-sm ${className}`} {...props}>
            {children}
        </div>
    )
}

export function CardHeader({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`px-6 pt-6 pb-2 ${className}`} {...props}>
            {children}
        </div>
    )
}

export function CardTitle({ children, className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2 className={`text-xl font-bold ${className}`} {...props}>
            {children}
        </h2>
    )
}

export function CardContent({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`px-6 pb-6 ${className}`} {...props}>
            {children}
        </div>
    )
} 